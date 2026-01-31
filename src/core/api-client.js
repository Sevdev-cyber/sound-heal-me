// API Client - Wrapper for backend REST API calls
class APIClient {
    constructor() {
        this.baseURL = this.getBaseURL();
        this.userId = localStorage.getItem('userId') || null;
    }

    /**
     * Determine base URL based on environment
     */
    getBaseURL() {
        // Production: Railway URL
        if (window.location.hostname.includes('railway.app')) {
            return 'https://sound-heal-me-production.up.railway.app/api';
        }
        // Development: Check if backend is running locally
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return 'http://localhost:3000/api';
        }
        // Fallback to current origin + /api
        return `${window.location.origin}/api`;
    }

    /**
     * Make authenticated request
     */
    async request(method, endpoint, data = null) {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, options);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`API request failed: ${method} ${endpoint}`, error);
            throw error;
        }
    }

    // ========== AUTH ==========

    async login(userId = null) {
        const response = await this.request('POST', '/auth/login', { userId });
        if (response.user) {
            this.userId = response.user.id;
            localStorage.setItem('userId', this.userId);
        }
        return response;
    }

    async register(username, email) {
        const response = await this.request('POST', '/auth/register', { username, email });
        if (response.user) {
            this.userId = response.user.id;
            localStorage.setItem('userId', this.userId);
        }
        return response;
    }

    // ========== PROFILE ==========

    async getProfile() {
        if (!this.userId) throw new Error('Not logged in');
        return await this.request('GET', `/profile/${this.userId}`);
    }

    async updateProfile(updates) {
        if (!this.userId) throw new Error('Not logged in');
        return await this.request('PUT', `/profile/${this.userId}`, updates);
    }

    async getStats() {
        if (!this.userId) throw new Error('Not logged in');
        return await this.request('GET', `/profile/${this.userId}/stats`);
    }

    async addXP(xp) {
        if (!this.userId) throw new Error('Not logged in');
        return await this.request('POST', `/profile/${this.userId}/xp`, { xp });
    }

    // ========== SESSIONS ==========

    async getSessions(limit = 100, offset = 0) {
        if (!this.userId) throw new Error('Not logged in');
        return await this.request('GET', `/sessions/${this.userId}?limit=${limit}&offset=${offset}`);
    }

    async createSession(sessionData) {
        if (!this.userId) throw new Error('Not logged in');
        return await this.request('POST', `/sessions/${this.userId}`, sessionData);
    }

    async getRecentSessions(count = 10) {
        if (!this.userId) throw new Error('Not logged in');
        return await this.request('GET', `/sessions/${this.userId}/recent?count=${count}`);
    }

    async getCalendar(year, month) {
        if (!this.userId) throw new Error('Not logged in');
        return await this.request('GET', `/sessions/${this.userId}/calendar/${year}/${month}`);
    }

    async deleteSession(sessionId) {
        return await this.request('DELETE', `/sessions/${sessionId}`);
    }

    // ========== ANALYTICS ==========

    async getStreak() {
        if (!this.userId) throw new Error('Not logged in');
        return await this.request('GET', `/analytics/${this.userId}/streak`);
    }

    async getMoodStats() {
        if (!this.userId) throw new Error('Not logged in');
        return await this.request('GET', `/analytics/${this.userId}/mood-stats`);
    }

    async getRecommendations() {
        if (!this.userId) throw new Error('Not logged in');
        return await this.request('GET', `/analytics/${this.userId}/recommendations`);
    }

    async getTrends(days = 30) {
        if (!this.userId) throw new Error('Not logged in');
        return await this.request('GET', `/analytics/${this.userId}/trends?days=${days}`);
    }

    async getWeeklyReport() {
        if (!this.userId) throw new Error('Not logged in');
        return await this.request('GET', `/analytics/${this.userId}/weekly-report`);
    }

    async getMonthlyReport(year, month) {
        if (!this.userId) throw new Error('Not logged in');
        return await this.request('GET', `/analytics/${this.userId}/monthly-report/${year}/${month}`);
    }

    // ========== HEALTH CHECK ==========

    async healthCheck() {
        try {
            const response = await fetch(`${this.baseURL.replace('/api', '')}/api/health`);
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    /**
     * Check if backend is available
     */
    async isBackendAvailable() {
        try {
            await this.healthCheck();
            return true;
        } catch (error) {
            return false;
        }
    }
}

// Create global instance
window.apiClient = new APIClient();

console.log('🔌 API Client initialized:', window.apiClient.baseURL);
