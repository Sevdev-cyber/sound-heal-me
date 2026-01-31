// User Profile Manager
// Handles user preferences, statistics, and profile data

class UserProfile {
    constructor() {
        this.userId = 'primary-user';
        this.profile = null;
        this.initialized = false;
    }

    /**
     * Initialize user profile
     * Creates default profile if doesn't exist
     * Auto-login to backend if available
     */
    async init() {
        await window.storageManager.init();

        // Auto-login to backend if available
        if (window.apiClient && window.storageManager.backendAvailable) {
            try {
                const existingUserId = localStorage.getItem('userId');
                const response = await window.apiClient.login(existingUserId);

                if (response.user) {
                    console.log('✅ Logged in to backend:', response.user.id);
                    // Update userId to match backend
                    this.userId = response.user.id;
                }
            } catch (error) {
                console.warn('⚠️ Backend login failed, using local-only mode:', error);
            }
        }

        this.profile = await window.storageManager.get('userProfile', this.userId);

        if (!this.profile) {
            // Create default profile
            this.profile = this.createDefaultProfile();
            await window.storageManager.set('userProfile', this.profile);
        }

        this.initialized = true;
        return this.profile;
    }

    /**
     * Create default profile structure
     */
    createDefaultProfile() {
        return {
            id: this.userId, // Will be backend UUID after login
            created: Date.now(),
            lastAccess: Date.now(),
            preferences: {
                favoriteBreathPatterns: [],
                favoriteSounds: [],
                favoriteGuidedSessions: [],
                defaultSessionDuration: 10,
                autoStartSounds: false,
                theme: localStorage.getItem('theme') || 'light',
                soundVolume: 0.5,
                notifications: {
                    enabled: false,
                    dailyReminder: '07:00',
                    streakProtection: true
                }
            },
            stats: {
                totalSessions: 0,
                totalMinutes: 0,
                breathworkMinutes: 0,
                soundHealingMinutes: 0,
                guidedSessionMinutes: 0,
                currentStreak: 0,
                longestStreak: 0,
                lastSessionDate: null,
                sessionsThisWeek: 0,
                sessionsThisMonth: 0,
                favoriteTimeOfDay: null
            },
            achievements: [],
            level: 1,
            xp: 0
        };
    }

    /**
     * Get current profile
     */
    async getProfile() {
        if (!this.initialized) await this.init();
        return this.profile;
    }

    /**
     * Update preferences
     */
    async updatePreference(key, value) {
        if (!this.initialized) await this.init();

        this.profile.preferences[key] = value;
        this.profile.lastAccess = Date.now();

        await window.storageManager.set('userProfile', this.profile);
        return this.profile;
    }

    /**
     * Add to favorites
     */
    async addFavorite(type, itemId) {
        if (!this.initialized) await this.init();

        const favoriteKey = `favorite${type.charAt(0).toUpperCase() + type.slice(1)}`;

        if (!this.profile.preferences[favoriteKey].includes(itemId)) {
            this.profile.preferences[favoriteKey].push(itemId);
            await window.storageManager.set('userProfile', this.profile);
        }

        return this.profile;
    }

    /**
     * Remove from favorites
     */
    async removeFavorite(type, itemId) {
        if (!this.initialized) await this.init();

        const favoriteKey = `favorite${type.charAt(0).toUpperCase() + type.slice(1)}`;
        const index = this.profile.preferences[favoriteKey].indexOf(itemId);

        if (index > -1) {
            this.profile.preferences[favoriteKey].splice(index, 1);
            await window.storageManager.set('userProfile', this.profile);
        }

        return this.profile;
    }

    /**
     * Update stats after session completion
     */
    async updateStatsAfterSession(sessionType, durationMinutes) {
        if (!this.initialized) await this.init();

        const today = new Date().setHours(0, 0, 0, 0);
        const lastSessionDay = this.profile.stats.lastSessionDate
            ? new Date(this.profile.stats.lastSessionDate).setHours(0, 0, 0, 0)
            : null;

        // Update total stats
        this.profile.stats.totalSessions++;
        this.profile.stats.totalMinutes += durationMinutes;

        // Update type-specific minutes
        if (sessionType === 'breathwork') {
            this.profile.stats.breathworkMinutes += durationMinutes;
        } else if (sessionType === 'sound') {
            this.profile.stats.soundHealingMinutes += durationMinutes;
        } else if (sessionType === 'guided') {
            this.profile.stats.guidedSessionMinutes += durationMinutes;
        }

        // Calculate streak
        if (!lastSessionDay) {
            // First session ever
            this.profile.stats.currentStreak = 1;
        } else if (today === lastSessionDay) {
            // Same day, streak continues
            // No change to streak
        } else if (today - lastSessionDay === 86400000) {
            // Yesterday, continue streak
            this.profile.stats.currentStreak++;
        } else {
            // Streak broken
            this.profile.stats.currentStreak = 1;
        }

        // Update longest streak
        if (this.profile.stats.currentStreak > this.profile.stats.longestStreak) {
            this.profile.stats.longestStreak = this.profile.stats.currentStreak;
        }

        this.profile.stats.lastSessionDate = Date.now();

        // Update weekly/monthly counters
        this.profile.stats.sessionsThisWeek = await this.getSessionsThisWeek();
        this.profile.stats.sessionsThisMonth = await this.getSessionsThisMonth();

        // Add XP
        const xpGained = this.calculateXP(sessionType, durationMinutes);
        this.profile.xp += xpGained;

        // Check for level up
        const newLevel = this.calculateLevel(this.profile.xp);
        if (newLevel > this.profile.level) {
            this.profile.level = newLevel;
            // Trigger level up notification
            this.triggerLevelUp(newLevel);
        }

        await window.storageManager.set('userProfile', this.profile);
        return this.profile;
    }

    /**
     * Calculate XP for a session
     */
    calculateXP(sessionType, durationMinutes) {
        const baseXP = 10;
        const minuteMultiplier = Math.min(durationMinutes / 10, 5); // Max 5x for 50+ min
        return Math.floor(baseXP * minuteMultiplier);
    }

    /**
     * Calculate level from XP
     */
    calculateLevel(xp) {
        const levels = [
            { level: 1, xpNeeded: 0 },
            { level: 2, xpNeeded: 100 },
            { level: 3, xpNeeded: 300 },
            { level: 4, xpNeeded: 700 },
            { level: 5, xpNeeded: 1500 },
            { level: 6, xpNeeded: 3000 }
        ];

        for (let i = levels.length - 1; i >= 0; i--) {
            if (xp >= levels[i].xpNeeded) {
                return levels[i].level;
            }
        }

        return 1;
    }

    /**
     * Trigger level up notification
     */
    triggerLevelUp(newLevel) {
        const levelNames = ['', 'Beginner', 'Initiate', 'Practitioner', 'Adept', 'Master', 'Guru'];

        if (window.showNotification) {
            window.showNotification(`🎉 Level Up! You're now a ${levelNames[newLevel]}!`);
        }
    }

    /**
     * Get sessions this week
     */
    async getSessionsThisWeek() {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const allSessions = await window.storageManager.getAll('sessions');
        return allSessions.filter(s => s.date >= startOfWeek.getTime()).length;
    }

    /**
     * Get sessions this month
     */
    async getSessionsThisMonth() {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        const allSessions = await window.storageManager.getAll('sessions');
        return allSessions.filter(s => s.date >= startOfMonth.getTime()).length;
    }

    /**
     * Get statistics
     */
    async getStats() {
        if (!this.initialized) await this.init();
        return this.profile.stats;
    }

    /**
     * Get recommendations based on history and time
     */
    async getRecommendations() {
        if (!this.initialized) await this.init();

        const hour = new Date().getHours();
        const allSessions = await window.storageManager.getAll('sessions');
        const favorites = this.profile.preferences;

        const recommendations = [];

        // Time-based recommendations
        if (hour >= 6 && hour < 10) {
            if (favorites.favoriteBreathPatterns.includes('energize')) {
                recommendations.push({
                    type: 'breathwork',
                    pattern: 'energize',
                    reason: 'Your favorite morning energizer'
                });
            } else {
                recommendations.push({
                    type: 'guided',
                    session: 'morning',
                    reason: 'Perfect for starting your day'
                });
            }
        } else if (hour >= 22) {
            recommendations.push({
                type: 'guided',
                session: 'sleep',
                reason: 'Wind down for restful sleep'
            });
        } else if (hour >= 12 && hour < 14) {
            recommendations.push({
                type: 'breathwork',
                pattern: 'coherent',
                reason: 'Midday reset for clarity'
            });
        }

        // History-based recommendations
        if (allSessions.length > 0) {
            const mostSuccessfulSessions = allSessions
                .filter(s => s.moodAfter && s.moodBefore)
                .sort((a, b) => (b.moodAfter - b.moodBefore) - (a.moodAfter - a.moodBefore))
                .slice(0, 3);

            if (mostSuccessfulSessions.length > 0) {
                const topSession = mostSuccessfulSessions[0];
                recommendations.push({
                    type: topSession.type,
                    pattern: topSession.pattern,
                    session: topSession.session,
                    reason: 'This worked great for you before 🌟'
                });
            }
        }

        // Streak-based recommendations
        if (this.profile.stats.currentStreak > 0) {
            recommendations.push({
                type: 'any',
                reason: `Keep your ${this.profile.stats.currentStreak}-day streak alive! 🔥`
            });
        }

        return recommendations;
    }

    /**
     * Reset profile (for testing or user request)
     */
    async reset() {
        this.profile = this.createDefaultProfile();
        await window.storageManager.set('userProfile', this.profile);
        return this.profile;
    }
}

// Create global instance
window.userProfile = new UserProfile();
