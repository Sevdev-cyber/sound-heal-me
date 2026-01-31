// Auth Routes - Simple UUID-based authentication
const express = require('express');
const router = express.Router();
const db = require('../db/connection');

// Login or create anonymous user
router.post('/login', async (req, res) => {
    try {
        const { userId } = req.body;

        if (userId) {
            // Check if user exists
            const result = await db.query(
                'SELECT * FROM users WHERE id = $1',
                [userId]
            );

            if (result.rows.length > 0) {
                return res.json({ user: result.rows[0] });
            }
        }

        // Create new anonymous user
        const newUser = await db.query(
            `INSERT INTO users (username) 
       VALUES ($1) 
       RETURNING *`,
            [`user_${Date.now()}`]
        );

        res.json({ user: newUser.rows[0], isNew: true });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Failed to login' });
    }
});

// Register with email (optional)
router.post('/register', async (req, res) => {
    try {
        const { username, email } = req.body;

        if (!username || !email) {
            return res.status(400).json({ error: 'Username and email required' });
        }

        const result = await db.query(
            `INSERT INTO users (username, email) 
       VALUES ($1, $2) 
       RETURNING *`,
            [username, email]
        );

        res.json({ user: result.rows[0] });
    } catch (error) {
        if (error.code === '23505') { // Unique violation
            return res.status(409).json({ error: 'Username or email already exists' });
        }
        console.error('Register error:', error);
        res.status(500).json({ error: 'Failed to register' });
    }
});

module.exports = router;
