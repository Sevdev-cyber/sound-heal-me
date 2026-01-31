// Analytics Routes
const express = require('express');
const router = express.Router();
const db = require('../db/connection');

// Get current streak
router.get('/:userId/streak', async (req, res) => {
    try {
        const { userId } = req.params;

        const sessions = await db.query(
            `SELECT date FROM sessions 
       WHERE user_id = $1 AND completed = true
       ORDER BY date DESC`,
            [userId]
        );

        if (sessions.rows.length === 0) {
            return res.json({ currentStreak: 0, longestStreak: 0 });
        }

        const { currentStreak, longestStreak } = calculateStreaks(sessions.rows);

        // Update user stats
        await db.query(
            `UPDATE users 
       SET stats = jsonb_set(
         jsonb_set(stats, '{currentStreak}', $1::text::jsonb),
         '{longestStreak}', $2::text::jsonb
       )
       WHERE id = $3`,
            [currentStreak, longestStreak, userId]
        );

        res.json({ currentStreak, longestStreak });
    } catch (error) {
        console.error('Get streak error:', error);
        res.status(500).json({ error: 'Failed to calculate streak' });
    }
});

// Get mood statistics
router.get('/:userId/mood-stats', async (req, res) => {
    try {
        const { userId } = req.params;

        const result = await db.query(
            `SELECT mood_before, mood_after, date 
       FROM sessions 
       WHERE user_id = $1 
       AND mood_before IS NOT NULL 
       AND mood_after IS NOT NULL
       ORDER BY date DESC
       LIMIT 30`,
            [userId]
        );

        if (result.rows.length === 0) {
            return res.json({
                averageImprovement: 0,
                totalSessions: 0,
                improvementRate: 0
            });
        }

        const improvements = result.rows.map(s => s.mood_after - s.mood_before);
        const averageImprovement = improvements.reduce((a, b) => a + b, 0) / improvements.length;
        const positiveImprovements = improvements.filter(i => i > 0).length;
        const improvementRate = (positiveImprovements / improvements.length) * 100;

        res.json({
            averageImprovement: Math.round(averageImprovement * 100) / 100,
            totalSessions: result.rows.length,
            improvementRate: Math.round(improvementRate),
            sessions: result.rows
        });
    } catch (error) {
        console.error('Get mood stats error:', error);
        res.status(500).json({ error: 'Failed to get mood statistics' });
    }
});

// Get personalized recommendations
router.get('/:userId/recommendations', async (req, res) => {
    try {
        const { userId } = req.params;

        // Get user preferences and recent sessions
        const userResult = await db.query(
            'SELECT preferences, stats FROM users WHERE id = $1',
            [userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const { preferences, stats } = userResult.rows[0];

        // Get recent sessions
        const sessionsResult = await db.query(
            `SELECT type, pattern, guided_session, date 
       FROM sessions 
       WHERE user_id = $1 
       ORDER BY date DESC 
       LIMIT 20`,
            [userId]
        );

        const recommendations = generateRecommendations(
            preferences,
            stats,
            sessionsResult.rows
        );

        res.json(recommendations);
    } catch (error) {
        console.error('Get recommendations error:', error);
        res.status(500).json({ error: 'Failed to get recommendations' });
    }
});

// Calculate streaks from sessions
function calculateStreaks(sessions) {
    if (sessions.length === 0) {
        return { currentStreak: 0, longestStreak: 0 };
    }

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let lastDate = null;

    // Check if user has session today or yesterday
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const lastSession = new Date(sessions[0].date);
    lastSession.setHours(0, 0, 0, 0);

    if (lastSession < yesterday) {
        currentStreak = 0;
    } else {
        // Calculate current streak
        for (const session of sessions) {
            const sessionDate = new Date(session.date);
            sessionDate.setHours(0, 0, 0, 0);

            if (!lastDate) {
                tempStreak = 1;
                lastDate = sessionDate;
                continue;
            }

            const dayDiff = Math.floor((lastDate - sessionDate) / (1000 * 60 * 60 * 24));

            if (dayDiff === 0) {
                // Same day, skip
                continue;
            } else if (dayDiff === 1) {
                // Consecutive day
                tempStreak++;
                lastDate = sessionDate;
            } else {
                // Streak broken
                break;
            }
        }
        currentStreak = tempStreak;
    }

    // Calculate longest streak
    tempStreak = 0;
    lastDate = null;

    for (const session of sessions) {
        const sessionDate = new Date(session.date);
        sessionDate.setHours(0, 0, 0, 0);

        if (!lastDate) {
            tempStreak = 1;
            lastDate = sessionDate;
            longestStreak = Math.max(longestStreak, tempStreak);
            continue;
        }

        const dayDiff = Math.floor((lastDate - sessionDate) / (1000 * 60 * 60 * 24));

        if (dayDiff === 0) {
            continue;
        } else if (dayDiff === 1) {
            tempStreak++;
            longestStreak = Math.max(longestStreak, tempStreak);
            lastDate = sessionDate;
        } else {
            tempStreak = 1;
            lastDate = sessionDate;
        }
    }

    return { currentStreak, longestStreak };
}

// Generate personalized recommendations
function generateRecommendations(preferences, stats, recentSessions) {
    const recommendations = [];
    const hour = new Date().getHours();

    // Time-based recommendations
    if (hour >= 5 && hour < 12) {
        recommendations.push({
            type: 'guided',
            session: 'morning',
            reason: 'Perfect for your morning energizer'
        });
        recommendations.push({
            type: 'breathwork',
            pattern: 'energize',
            reason: 'Wake up with energizing breath'
        });
    } else if (hour >= 20 || hour < 5) {
        recommendations.push({
            type: 'guided',
            session: 'sleep',
            reason: 'Wind down for better sleep'
        });
        recommendations.push({
            type: 'breathwork',
            pattern: '478',
            reason: 'Relaxing breath for bedtime'
        });
    } else if (hour >= 12 && hour < 17) {
        recommendations.push({
            type: 'guided',
            session: 'stress',
            reason: 'Midday stress relief'
        });
    }

    // Favorites-based
    if (preferences.favoriteBreathPatterns && preferences.favoriteBreathPatterns.length > 0) {
        const favorite = preferences.favoriteBreathPatterns[0];
        recommendations.push({
            type: 'breathwork',
            pattern: favorite,
            reason: 'One of your favorites'
        });
    }

    // Variety recommendation
    const sessionTypes = recentSessions.map(s => s.type);
    const breathworkCount = sessionTypes.filter(t => t === 'breathwork').length;
    const soundCount = sessionTypes.filter(t => t === 'sound').length;

    if (breathworkCount > soundCount * 2) {
        recommendations.push({
            type: 'sound',
            reason: 'Try some sound healing for variety'
        });
    } else if (soundCount > breathworkCount * 2) {
        recommendations.push({
            type: 'breathwork',
            pattern: 'box',
            reason: 'Balance with breathwork practice'
        });
    }

    return recommendations.slice(0, 3);
}

module.exports = router;
