// Achievements Routes - Gamification system
const express = require('express');
const router = express.Router();
const db = require('../db/connection');

// Achievement definitions
const ACHIEVEMENTS = [
    // Beginner
    { id: 'first_session', name: 'First Steps', icon: '🌱', requirement: 1, type: 'sessions', description: 'Complete your first practice session' },
    { id: 'early_bird', name: 'Early Bird', icon: '🌅', requirement: 'special', type: 'time', description: 'Practice before 7 AM' },
    { id: 'night_owl', name: 'Night Owl', icon: '🦉', requirement: 'special', type: 'time', description: 'Practice after 10 PM' },

    // Intermediate
    { id: '10_sessions', name: 'Dedicated Beginner', icon: '💪', requirement: 10, type: 'sessions', description: 'Complete 10 practice sessions' },
    { id: '50_sessions', name: 'Practitioner', icon: '🧘', requirement: 50, type: 'sessions', description: 'Complete 50 practice sessions' },
    { id: 'week_streak', name: 'Week Warrior', icon: '🔥', requirement: 7, type: 'streak', description: 'Maintain a 7-day practice streak' },
    { id: 'month_streak', name: 'Dedicated', icon: '💫', requirement: 30, type: 'streak', description: 'Maintain a 30-day practice streak' },

    // Advanced
    { id: '100_sessions', name: 'Master', icon: '🎓', requirement: 100, type: 'sessions', description: 'Complete 100 practice sessions' },
    { id: '500_sessions', name: 'Guru', icon: '🕉️', requirement: 500, type: 'sessions', description: 'Complete 500 practice sessions' },
    { id: 'year_streak', name: 'Enlightened', icon: '✨', requirement: 365, type: 'streak', description: 'Maintain a 365-day practice streak' },

    // Special
    { id: 'wim_hof_complete', name: 'Ice Man', icon: '❄️', requirement: 'special', type: 'breathwork', description: 'Complete full Wim Hof Method session' },
    { id: 'chakra_master', name: 'Chakra Master', icon: '🎵', requirement: 'special', type: 'sound', description: 'Use all 7 chakra frequencies' },
    { id: 'mood_improver', name: 'Mood Improver', icon: '😊', requirement: 'special', type: 'mood', description: 'Improve mood by 5+ points in 10 sessions' },
    { id: 'variety_seeker', name: 'Variety Seeker', icon: '🎨', requirement: 'special', type: 'variety', description: 'Try all three practice types' },
    { id: 'consistent', name: 'Consistent', icon: '📅', requirement: 'special', type: 'consistency', description: 'Practice 5 days a week for a month' }
];

// Get all achievements for user
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const result = await db.query(
            'SELECT * FROM achievements WHERE user_id = $1 ORDER BY unlocked_at DESC',
            [userId]
        );

        // Map unlocked achievements with definitions
        const unlockedIds = result.rows.map(a => a.achievement_type);
        const achievementsWithStatus = ACHIEVEMENTS.map(achievement => ({
            ...achievement,
            unlocked: unlockedIds.includes(achievement.id),
            unlockedAt: result.rows.find(a => a.achievement_type === achievement.id)?.unlocked_at || null
        }));

        res.json({
            total: ACHIEVEMENTS.length,
            unlocked: unlockedIds.length,
            achievements: achievementsWithStatus
        });
    } catch (error) {
        console.error('Get achievements error:', error);
        res.status(500).json({ error: 'Failed to get achievements' });
    }
});

// Unlock specific achievement
router.post('/:userId/unlock/:achievementId', async (req, res) => {
    try {
        const { userId, achievementId } = req.params;

        // Check if achievement exists
        const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
        if (!achievement) {
            return res.status(404).json({ error: 'Achievement not found' });
        }

        // Check if already unlocked
        const existing = await db.query(
            'SELECT * FROM achievements WHERE user_id = $1 AND achievement_type = $2',
            [userId, achievementId]
        );

        if (existing.rows.length > 0) {
            return res.json({ message: 'Already unlocked', achievement });
        }

        // Unlock achievement
        await db.query(
            `INSERT INTO achievements (user_id, achievement_type, unlocked_at)
       VALUES ($1, $2, NOW())`,
            [userId, achievementId]
        );

        // Award XP bonus
        const xpBonus = calculateAchievementXP(achievement);
        await db.query(
            `UPDATE users 
       SET xp = xp + $1
       WHERE id = $2`,
            [xpBonus, userId]
        );

        res.json({
            message: 'Achievement unlocked!',
            achievement,
            xpBonus
        });
    } catch (error) {
        console.error('Unlock achievement error:', error);
        res.status(500).json({ error: 'Failed to unlock achievement' });
    }
});

// Auto-check and unlock achievements
router.post('/:userId/check', async (req, res) => {
    try {
        const { userId } = req.params;

        // Get user stats
        const userResult = await db.query(
            'SELECT stats FROM users WHERE id = $1',
            [userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const stats = userResult.rows[0].stats;

        // Get all sessions
        const sessionsResult = await db.query(
            'SELECT * FROM sessions WHERE user_id = $1 ORDER BY date DESC',
            [userId]
        );

        const sessions = sessionsResult.rows;
        const totalSessions = stats.totalSessions || sessions.length;
        const currentStreak = stats.currentStreak || 0;

        // Get already unlocked achievements
        const unlockedResult = await db.query(
            'SELECT achievement_type FROM achievements WHERE user_id = $1',
            [userId]
        );
        const unlockedIds = unlockedResult.rows.map(a => a.achievement_type);

        const newlyUnlocked = [];

        // Check each achievement
        for (const achievement of ACHIEVEMENTS) {
            if (unlockedIds.includes(achievement.id)) continue;

            let shouldUnlock = false;

            switch (achievement.type) {
                case 'sessions':
                    shouldUnlock = totalSessions >= achievement.requirement;
                    break;

                case 'streak':
                    shouldUnlock = currentStreak >= achievement.requirement;
                    break;

                case 'time':
                    // Special checks for time-based achievements
                    if (achievement.id === 'early_bird') {
                        shouldUnlock = sessions.some(s => {
                            const hour = new Date(s.date).getHours();
                            return hour < 7;
                        });
                    } else if (achievement.id === 'night_owl') {
                        shouldUnlock = sessions.some(s => {
                            const hour = new Date(s.date).getHours();
                            return hour >= 22;
                        });
                    }
                    break;

                case 'breathwork':
                    if (achievement.id === 'wim_hof_complete') {
                        shouldUnlock = sessions.some(s =>
                            s.type === 'breathwork' && s.pattern === 'wim-hof'
                        );
                    }
                    break;

                case 'sound':
                    if (achievement.id === 'chakra_master') {
                        const uniqueChakras = new Set();
                        sessions.forEach(s => {
                            if (s.sounds && Array.isArray(s.sounds)) {
                                s.sounds.forEach(sound => {
                                    if (sound.startsWith('chakra_')) uniqueChakras.add(sound);
                                });
                            }
                        });
                        shouldUnlock = uniqueChakras.size >= 7;
                    }
                    break;

                case 'mood':
                    if (achievement.id === 'mood_improver') {
                        const improvements = sessions
                            .filter(s => s.mood_before && s.mood_after)
                            .map(s => s.mood_after - s.mood_before)
                            .filter(diff => diff >= 5);
                        shouldUnlock = improvements.length >= 10;
                    }
                    break;

                case 'variety':
                    if (achievement.id === 'variety_seeker') {
                        const types = new Set(sessions.map(s => s.type));
                        shouldUnlock = types.has('breathwork') && types.has('sound') && types.has('guided');
                    }
                    break;

                case 'consistency':
                    if (achievement.id === 'consistent') {
                        // Check last 28 days for 20+ sessions (5 days/week)
                        const last28Days = sessions.filter(s => {
                            const daysDiff = (Date.now() - new Date(s.date)) / (1000 * 60 * 60 * 24);
                            return daysDiff <= 28;
                        });
                        shouldUnlock = last28Days.length >= 20;
                    }
                    break;
            }

            if (shouldUnlock) {
                // Unlock it
                await db.query(
                    `INSERT INTO achievements (user_id, achievement_type, unlocked_at)
           VALUES ($1, $2, NOW())`,
                    [userId, achievement.id]
                );

                const xpBonus = calculateAchievementXP(achievement);
                await db.query(
                    `UPDATE users SET xp = xp + $1 WHERE id = $2`,
                    [xpBonus, userId]
                );

                newlyUnlocked.push({
                    ...achievement,
                    xpBonus
                });
            }
        }

        res.json({
            checked: ACHIEVEMENTS.length,
            newlyUnlocked: newlyUnlocked.length,
            achievements: newlyUnlocked
        });
    } catch (error) {
        console.error('Check achievements error:', error);
        res.status(500).json({ error: 'Failed to check achievements' });
    }
});

// Calculate XP bonus for achievement
function calculateAchievementXP(achievement) {
    const xpMap = {
        first_session: 10,
        early_bird: 25,
        night_owl: 25,
        '10_sessions': 50,
        '50_sessions': 150,
        week_streak: 100,
        month_streak: 300,
        '100_sessions': 250,
        '500_sessions': 1000,
        year_streak: 1000,
        wim_hof_complete: 75,
        chakra_master: 100,
        mood_improver: 150,
        variety_seeker: 50,
        consistent: 200
    };

    return xpMap[achievement.id] || 50;
}

module.exports = router;
