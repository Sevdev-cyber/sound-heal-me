// Utility Functions for XP and Level Calculations

/**
 * Calculate user level based on XP
 * @param {number} xp - Total XP
 * @returns {number} - Current level
 */
function calculateLevel(xp) {
    const levels = [
        { level: 1, minXP: 0, name: 'Beginner' },
        { level: 2, minXP: 100, name: 'Initiate' },
        { level: 3, minXP: 300, name: 'Practitioner' },
        { level: 4, minXP: 700, name: 'Adept' },
        { level: 5, minXP: 1500, name: 'Master' },
        { level: 6, minXP: 3000, name: 'Guru' },
        { level: 7, minXP: 10000, name: 'Enlightened' }
    ];

    for (let i = levels.length - 1; i >= 0; i--) {
        if (xp >= levels[i].minXP) {
            return levels[i].level;
        }
    }

    return 1;
}

/**
 * Get level name
 * @param {number} level - Level number
 * @returns {string} - Level name
 */
function getLevelName(level) {
    const names = ['', 'Beginner', 'Initiate', 'Practitioner', 'Adept', 'Master', 'Guru', 'Enlightened'];
    return names[level] || 'Beginner';
}

/**
 * Calculate XP for session completion
 * @param {string} type - Session type
 * @param {number} duration - Duration in minutes
 * @returns {number} - XP earned
 */
function calculateSessionXP(type, duration) {
    const baseXP = {
        breathwork: 10,
        sound: 8,
        guided: 15
    };

    const base = baseXP[type] || 10;
    const durationBonus = Math.floor(duration / 5) * 2; // 2 XP per 5 minutes

    return base + durationBonus;
}

/**
 * Get XP required for next level
 * @param {number} currentLevel - Current level
 * @returns {number} - XP needed for next level
 */
function getNextLevelXP(currentLevel) {
    const thresholds = [0, 100, 300, 700, 1500, 3000, 10000];
    return thresholds[currentLevel] || 10000;
}

module.exports = {
    calculateLevel,
    getLevelName,
    calculateSessionXP,
    getNextLevelXP
};
