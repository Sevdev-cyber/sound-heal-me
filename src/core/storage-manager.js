// Storage Manager - IndexedDB Wrapper for Sacred Sound App
// Handles all database operations with error handling and migrations

class StorageManager {
    constructor() {
        this.dbName = 'SacredSoundDB';
        this.version = 1;
        this.db = null;
    }

    /**
     * Initialize database connection
     * Creates object stores if they don't exist
     */
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // User Profile Store
                if (!db.objectStoreNames.contains('userProfile')) {
                    db.createObjectStore('userProfile', { keyPath: 'id' });
                }

                // Sessions Store
                if (!db.objectStoreNames.contains('sessions')) {
                    const sessionsStore = db.createObjectStore('sessions', {
                        keyPath: 'id',
                        autoIncrement: false
                    });
                    sessionsStore.createIndex('date', 'date', { unique: false });
                    sessionsStore.createIndex('type', 'type', { unique: false });
                }

                // Custom Sessions Store
                if (!db.objectStoreNames.contains('customSessions')) {
                    const customStore = db.createObjectStore('customSessions', {
                        keyPath: 'id',
                        autoIncrement: false
                    });
                    customStore.createIndex('name', 'name', { unique: false });
                    customStore.createIndex('favorite', 'favorite', { unique: false });
                }

                // Achievements Store
                if (!db.objectStoreNames.contains('achievements')) {
                    db.createObjectStore('achievements', { keyPath: 'id' });
                }
            };
        });
    }

    /**
     * Generic get method
     */
    async get(storeName, key) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(key);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Generic get all method
     */
    async getAll(storeName) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Generic set/update method
     */
    async set(storeName, data) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(data);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Generic delete method
     */
    async delete(storeName, key) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(key);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Query by index
     */
    async getAllByIndex(storeName, indexName, value) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const index = store.index(indexName);
            const request = index.getAll(value);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get sessions by date range
     */
    async getSessionsByDateRange(startDate, endDate) {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['sessions'], 'readonly');
            const store = transaction.objectStore(storeName);
            const index = store.index('date');
            const range = IDBKeyRange.bound(startDate, endDate);
            const request = index.getAll(range);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Clear all data (for reset/logout)
     */
    async clearAll() {
        if (!this.db) await this.init();

        const storeNames = ['userProfile', 'sessions', 'customSessions', 'achievements'];
        const promises = storeNames.map(storeName => {
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);
                const request = store.clear();

                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        });

        return Promise.all(promises);
    }

    /**
     * Export all data as JSON
     */
    async exportData() {
        const data = {
            userProfile: await this.get('userProfile', 'primary-user'),
            sessions: await this.getAll('sessions'),
            customSessions: await this.getAll('customSessions'),
            achievements: await this.getAll('achievements'),
            exportedAt: new Date().toISOString()
        };

        return data;
    }

    /**
     * Import data from JSON
     */
    async importData(data) {
        if (data.userProfile) {
            await this.set('userProfile', data.userProfile);
        }

        if (data.sessions && Array.isArray(data.sessions)) {
            for (const session of data.sessions) {
                await this.set('sessions', session);
            }
        }

        if (data.customSessions && Array.isArray(data.customSessions)) {
            for (const customSession of data.customSessions) {
                await this.set('customSessions', customSession);
            }
        }

        if (data.achievements && Array.isArray(data.achievements)) {
            for (const achievement of data.achievements) {
                await this.set('achievements', achievement);
            }
        }
    }
}

// Create global instance
window.storageManager = new StorageManager();
