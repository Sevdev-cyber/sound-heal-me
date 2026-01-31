// Profile Routes
const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { calculateLevel } = require('../utils/calculations');

// Get user profile
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const result = await db.query(
            'SELECT * FROM users WHERE id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Failed to get profile' });
    }
});

// Update user profile
router.put('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { preferences, stats } = req.body;

        const updates = [];
        const values = [];
        let paramCount = 1;

        if (preferences) {
            updates.push(`preferences = $${paramCount++}`);
            values.push(JSON.stringify(preferences));
        }

        if (stats) {
            updates.push(`stats = $${paramCount++}`);
            values.push(JSON.stringify(stats));
        }

        updates.push(`last_access = NOW()`);
        values.push(userId);

        const query = `
      UPDATE users 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

        const result = await db.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// Get user statistics
router.get('/:userId/stats', async (req, res) => {
    try {
        const { userId } = req.params;

        const result = await db.query(
            'SELECT stats FROM users WHERE id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(result.rows[0].stats);
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ error: 'Failed to get stats' });
    }
});

// Add XP to user
router.post('/:userId/xp', async (req, res) => {
    try {
        const { userId } = req.params;
        const { xp } = req.body;

        if (!xp || xp < 0) {
            return res.status(400).json({ error: 'Valid XP amount required' });
        }

        // Get current user
        const userResult = await db.query(
            'SELECT xp, level FROM users WHERE id = $1',
            [userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const currentXP = userResult.rows[0].xp;
        const currentLevel = userResult.rows[0].level;
        const newXP = currentXP + xp;
        const newLevel = calculateLevel(newXP);

        const leveledUp = newLevel > currentLevel;

        // Update user
        const result = await db.query(
            `UPDATE users 
       SET xp = $1, level = $2
       WHERE id = $3
       RETURNING *`,
            [newXP, newLevel, userId]
        );

        res.json({
            user: result.rows[0],
            xpGained: xp,
            leveledUp,
            newLevel: leveledUp ? newLevel : null
        });
    } catch (error) {
        console.error('Add XP error:', error);
        res.status(500).json({ error: 'Failed to add XP' });
    }
});

module.exports = router;
