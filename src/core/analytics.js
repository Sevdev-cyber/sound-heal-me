// Session Analytics and History Manager
// Tracks sessions, calculates streaks, and provides statistics

class SessionAnalytics {
    constructor() {
        this.initialized = false;
    }

    /**
     * Initialize analytics
     */
    async init() {
        await window.storageManager.init();
        this.initialized = true;
    }

    /**
     * Generate unique ID for session
     */
    generateSessionId() {
        return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Save a completed session
     */
    async saveSession(sessionData) {
        if (!this.initialized) await this.init();

        const session = {
            id: this.generateSessionId(),
            date: Date.now(),
            ...sessionData
        };

        await window.storageManager.set('sessions', session);

        // Update user profile stats
        if (window.userProfile) {
            await window.userProfile.updateStatsAfterSession(
                sessionData.type,
                sessionData.duration || 0
            );
        }

        return session;
    }

    /**
     * Get all sessions
     */
    async getAllSessions() {
        if (!this.initialized) await this.init();

        const sessions = await window.storageManager.getAll('sessions');
        return sessions.sort((a, b) => b.date - a.date);
    }

    /**
     * Get sessions for a specific date
     */
    async getSessionsForDate(date) {
        const allSessions = await this.getAllSessions();
        const targetDate = new Date(date).setHours(0, 0, 0, 0);

        return allSessions.filter(session => {
            const sessionDate = new Date(session.date).setHours(0, 0, 0, 0);
            return sessionDate === targetDate;
        });
    }

    /**
     * Get sessions for date range
     */
    async getSessionsInRange(startDate, endDate) {
        const allSessions = await this.getAllSessions();

        return allSessions.filter(session => {
            return session.date >= startDate && session.date <= endDate;
        });
    }

    /**
     * Get sessions this week
     */
    async getThisWeekSessions() {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        return this.getSessionsInRange(startOfWeek.getTime(), Date.now());
    }

    /**
     * Get sessions this month
     */
    async getThisMonthSessions() {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        startOfMonth.setHours(0, 0, 0, 0);

        return this.getSessionsInRange(startOfMonth.getTime(), Date.now());
    }

    /**
     * Calculate current streak
     */
    async calculateStreak() {
        const allSessions = await this.getAllSessions();

        if (allSessions.length === 0) return 0;

        let streak = 0;
        const today = new Date().setHours(0, 0, 0, 0);
        let checkDate = today;

        // Get unique days with sessions
        const sessionDays = new Set();
        allSessions.forEach(session => {
            const day = new Date(session.date).setHours(0, 0, 0, 0);
            sessionDays.add(day);
        });

        const sortedDays = Array.from(sessionDays).sort((a, b) => b - a);

        // If no session today or yesterday, streak is 0
        if (sortedDays[0] < today - 86400000) {
            return 0;
        }

        // Count consecutive days
        for (let i = 0; i < sortedDays.length; i++) {
            if (sortedDays[i] === checkDate || sortedDays[i] === checkDate - 86400000) {
                streak++;
                checkDate = sortedDays[i] - 86400000;
            } else {
                break;
            }
        }

        return streak;
    }

    /**
     * Get mood improvement statistics
     */
    async getMoodStats() {
        const allSessions = await this.getAllSessions();
        const sessionsWithMood = allSessions.filter(s => s.moodBefore && s.moodAfter);

        if (sessionsWithMood.length === 0) {
            return {
                average: 0,
                total: 0,
                byType: {}
            };
        }

        let totalImprovement = 0;
        const byType = {};

        sessionsWithMood.forEach(session => {
            const improvement = session.moodAfter - session.moodBefore;
            totalImprovement += improvement;

            if (!byType[session.type]) {
                byType[session.type] = { total: 0, count: 0 };
            }

            byType[session.type].total += improvement;
            byType[session.type].count++;
        });

        // Calculate averages
        Object.keys(byType).forEach(type => {
            byType[type].average = byType[type].total / byType[type].count;
        });

        return {
            average: totalImprovement / sessionsWithMood.length,
            total: sessionsWithMood.length,
            byType
        };
    }

    /**
     * Get calendar data for a month
     */
    async getCalendarData(year, month) {
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0, 23, 59, 59);

        const sessions = await this.getSessionsInRange(
            startDate.getTime(),
            endDate.getTime()
        );

        // Group by day
        const calendar = {};

        sessions.forEach(session => {
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

        // Convert sets to arrays
        Object.keys(calendar).forEach(day => {
            calendar[day].types = Array.from(calendar[day].types);
        });

        return calendar;
    }

    /**
     * Get time of day statistics
     */
    async getTimeOfDayStats() {
        const allSessions = await this.getAllSessions();

        const timeSlots = {
            morning: { count: 0, label: '6-12' },      // 6 AM - 12 PM
            afternoon: { count: 0, label: '12-18' },   // 12 PM - 6 PM
            evening: { count: 0, label: '18-22' },     // 6 PM - 10 PM
            night: { count: 0, label: '22-6' }         // 10 PM - 6 AM
        };

        allSessions.forEach(session => {
            const hour = new Date(session.date).getHours();

            if (hour >= 6 && hour < 12) {
                timeSlots.morning.count++;
            } else if (hour >= 12 && hour < 18) {
                timeSlots.afternoon.count++;
            } else if (hour >= 18 && hour < 22) {
                timeSlots.evening.count++;
            } else {
                timeSlots.night.count++;
            }
        });

        return timeSlots;
    }

    /**
     * Get most used patterns/sounds
     */
    async getMostUsed() {
        const allSessions = await this.getAllSessions();

        const patterns = {};
        const sounds = {};
        const guidedSessions = {};

        allSessions.forEach(session => {
            if (session.pattern) {
                patterns[session.pattern] = (patterns[session.pattern] || 0) + 1;
            }

            if (session.sounds && Array.isArray(session.sounds)) {
                session.sounds.forEach(sound => {
                    sounds[sound] = (sounds[sound] || 0) + 1;
                });
            }

            if (session.guidedSession) {
                guidedSessions[session.guidedSession] = (guidedSessions[session.guidedSession] || 0) + 1;
            }
        });

        return {
            patterns: Object.entries(patterns).sort((a, b) => b[1] - a[1]),
            sounds: Object.entries(sounds).sort((a, b) => b[1] - a[1]),
            guidedSessions: Object.entries(guidedSessions).sort((a, b) => b[1] - a[1])
        };
    }

    /**
     * Export sessions as CSV
     */
    async exportAsCSV() {
        const sessions = await this.getAllSessions();

        let csv = 'Date,Time,Type,Pattern,Duration,Mood Before,Mood After,Completed,Notes\n';

        sessions.forEach(session => {
            const date = new Date(session.date);
            csv += `${date.toLocaleDateString()},`;
            csv += `${date.toLocaleTimeString()},`;
            csv += `${session.type || ''},`;
            csv += `${session.pattern || ''},`;
            csv += `${session.duration || 0},`;
            csv += `${session.moodBefore || ''},`;
            csv += `${session.moodAfter || ''},`;
            csv += `${session.completed ? 'Yes' : 'No'},`;
            csv += `"${(session.notes || '').replace(/"/g, '""')}"\n`;
        });

        return csv;
    }

    /**
     * Delete a session
     */
    async deleteSession(sessionId) {
        if (!this.initialized) await this.init();
        await window.storageManager.delete('sessions', sessionId);
    }
}

// Create global instance
window.sessionAnalytics = new SessionAnalytics();
