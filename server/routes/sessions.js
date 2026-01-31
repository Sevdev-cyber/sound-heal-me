// Sessions Routes
const express = require('express');
const router = express.Router();
const db = require('../db/connection');

// Get all sessions for a user
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { limit = 100, offset = 0 } = req.query;

        const result = await db.query(
            `SELECT * FROM sessions 
       WHERE user_id = $1 
       ORDER BY date DESC 
       LIMIT $2 OFFSET $3`,
            [userId, limit, offset]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Get sessions error:', error);
        res.status(500).json({ error: 'Failed to get sessions' });
    }
});

// Create new session
router.post('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const {
            type,
            pattern,
            guidedSession,
            duration,
            moodBefore,
            moodAfter,
            completed,
            sounds,
            notes
        } = req.body;

        if (!type) {
            return res.status(400).json({ error: 'Session type required' });
        }

        const result = await db.query(
            `INSERT INTO sessions (
        user_id, type, pattern, guided_session, duration,
        mood_before, mood_after, completed, sounds, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
            [userId, type, pattern, guidedSession, duration,
                moodBefore, moodAfter, completed, sounds, notes]
        );

        // Update user stats
        await updateUserStats(userId, type, duration || 0);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Create session error:', error);
        res.status(500).json({ error: 'Failed to create session' });
    }
});

// Get recent sessions
router.get('/:userId/recent', async (req, res) => {
    try {
        const { userId } = req.params;
        const { count = 10 } = req.query;

        const result = await db.query(
            `SELECT * FROM sessions 
       WHERE user_id = $1 
       ORDER BY date DESC 
       LIMIT $2`,
            [userId, count]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Get recent sessions error:', error);
        res.status(500).json({ error: 'Failed to get recent sessions' });
    }
});

// Get calendar data for a month
router.get('/:userId/calendar/:year/:month', async (req, res) => {
    try {
        const { userId, year, month } = req.params;

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        const result = await db.query(
            `SELECT * FROM sessions 
       WHERE user_id = $1 
       AND date >= $2 
       AND date <= $3
       ORDER BY date ASC`,
            [userId, startDate, endDate]
        );

        // Group by day
        const calendar = {};
        result.rows.forEach(session => {
            const day = new Date(session.date).getDate();
            if (!calendar[day]) {
                calendar[day] = {
                    sessions: [],
                    totalMinutes: 0,
                    types: new Set()
                };
            }
            calendar[day].sessions.push(session);
            calendar[day].totalMinutes += session.duration || 0;
            calendar[day].types.add(session.type);
        });

        // Convert Sets to arrays
        Object.keys(calendar).forEach(day => {
            calendar[day].types = Array.from(calendar[day].types);
        });

        res.json(calendar);
    } catch (error) {
        console.error('Get calendar error:', error);
        res.status(500).json({ error: 'Failed to get calendar data' });
    }
});

// Delete a session
router.delete('/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;

        const result = await db.query(
            'DELETE FROM sessions WHERE id = $1 RETURNING *',
            [sessionId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Session not found' });
        }

        res.json({ message: 'Session deleted', session: result.rows[0] });
    } catch (error) {
        console.error('Delete session error:', error);
        res.status(500).json({ error: 'Failed to delete session' });
    }
});

// Helper function to update user stats
async function updateUserStats(userId, sessionType, duration) {
    try {
        const userResult = await db.query(
            'SELECT stats FROM users WHERE id = $1',
            [userId]
        );

        if (userResult.rows.length === 0) return;

        const stats = userResult.rows[0].stats;
        stats.totalSessions = (stats.totalSessions || 0) + 1;
        stats.totalMinutes = (stats.totalMinutes || 0) + duration;

        if (sessionType === 'breathwork') {
            stats.breathworkMinutes = (stats.breathworkMinutes || 0) + duration;
        } else if (sessionType === 'sound') {
            stats.soundHealingMinutes = (stats.soundHealingMinutes || 0) + duration;
        } else if (sessionType === 'guided') {
            stats.guidedSessionMinutes = (stats.guidedSessionMinutes || 0) + duration;
        }

        stats.lastSessionDate = new Date().toISOString();

        await db.query(
            'UPDATE users SET stats = $1 WHERE id = $2',
            [JSON.stringify(stats), userId]
        );
    } catch (error) {
        console.error('Update stats error:', error);
    }
}

module.exports = router;
