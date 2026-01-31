// Hybrid Storage Manager - IndexedDB + Backend API Sync
// Provides offline-first storage with cloud backup

class HybridStorageManager {
    constructor() {
        this.dbName = 'SacredSoundDB';
        this.version = 1;
        this.db = null;
        this.syncQueue = [];
        this.online = navigator.onLine;
        this.backendAvailable = false;

        // Listen to online/offline events
        window.addEventListener('online', () => {
            this.online = true;
            this.processSyncQueue();
        });

        window.addEventListener('offline', () => {
            this.online = false;
        });
    }

    async init() {
        // Initialize IndexedDB
        await this.initIndexedDB();

        // Check backend availability
        if (window.apiClient) {
            this.backendAvailable = await window.apiClient.isBackendAvailable();
            console.log(`📡 Backend ${this.backendAvailable ? 'available' : 'unavailable'} - using ${this.backendAvailable ? 'hybrid' : 'offline'} mode`);
        }

        return this.db;
    }

    async initIndexedDB() {
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
                }

                // Achievements Store
                if (!db.objectStoreNames.contains('achievements')) {
                    db.createObjectStore('achievements', { keyPath: 'id' });
                }

                // Sync Queue Store (for offline operations)
                if (!db.objectStoreNames.contains('syncQueue')) {
                    db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
                }
            };
        });
    }

    // ========== HYBRID GET METHODS ==========

    /**
     * Get from IndexedDB (cache), fallback to API if not found
     */
    async get(storeName, key) {
        if (!this.db) await this.init();

        // Try IndexedDB first
        const localData = await this.getLocal(storeName, key);

        // If found locally, return it
        if (localData) {
            return localData;
        }

        // Otherwise fetch from API (if available)
        if (this.backendAvailable && this.online && window.apiClient) {
            try {
                const apiData = await this.fetchFromAPI(storeName, key);
                if (apiData) {
                    // Cache it locally
                    await this.setLocal(storeName, apiData);
                    return apiData;
                }
            } catch (error) {
                console.warn('Failed to fetch from API, using local only:', error);
            }
        }

        return null;
    }

    /**
     * Get all items - prefer API for freshest data, fallback to IndexedDB
     */
    async getAll(storeName) {
        if (!this.db) await this.init();

        // If online and backend available, fetch from API
        if (this.backendAvailable && this.online && window.apiClient) {
            try {
                const apiData = await this.fetchAllFromAPI(storeName);
                if (apiData) {
                    // Update local cache
                    await this.setAllLocal(storeName, apiData);
                    return apiData;
                }
            } catch (error) {
                console.warn('Failed to fetch from API, using local cache:', error);
            }
        }

        // Fallback to local
        return await this.getAllLocal(storeName);
    }

    // ========== HYBRID SET METHODS ==========

    /**
     * Set data - save to IndexedDB immediately, sync to API when online
     */
    async set(storeName, data) {
        if (!this.db) await this.init();

        // Always save locally first
        await this.setLocal(storeName, data);

        // Try to sync to API
        if (this.backendAvailable && this.online && window.apiClient) {
            try {
                await this.syncToAPI(storeName, 'set', data);
            } catch (error) {
                console.warn('Failed to sync to API, queued for later:', error);
                await this.addToSyncQueue({ storeName, action: 'set', data });
            }
        } else {
            // Queue for later sync
            await this.addToSyncQueue({ storeName, action: 'set', data });
        }

        return data;
    }

    /**
     * Delete data - remove from IndexedDB, sync deletion to API
     */
    async delete(storeName, key) {
        if (!this.db) await this.init();

        // Delete locally
        await this.deleteLocal(storeName, key);

        // Try to sync deletion to API
        if (this.backendAvailable && this.online && window.apiClient) {
            try {
                await this.syncToAPI(storeName, 'delete', { id: key });
            } catch (error) {
                console.warn('Failed to sync deletion to API:', error);
                await this.addToSyncQueue({ storeName, action: 'delete', data: { id: key } });
            }
        } else {
            await this.addToSyncQueue({ storeName, action: 'delete', data: { id: key } });
        }
    }

    // ========== LOCAL INDEXEDDB OPERATIONS ==========

    async getLocal(storeName, key) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(key);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getAllLocal(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async setLocal(storeName, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(data);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async setAllLocal(storeName, dataArray) {
        const promises = dataArray.map(data => this.setLocal(storeName, data));
        return await Promise.all(promises);
    }

    async deleteLocal(storeName, key) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(key);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // ========== API SYNC OPERATIONS ==========

    async fetchFromAPI(storeName, key) {
        if (storeName === 'userProfile' && key === 'primary-user') {
            return await window.apiClient.getProfile();
        }
        return null;
    }

    async fetchAllFromAPI(storeName) {
        if (storeName === 'sessions') {
            return await window.apiClient.getSessions();
        }
        return null;
    }

    async syncToAPI(storeName, action, data) {
        if (storeName === 'userProfile') {
            if (action === 'set') {
                await window.apiClient.updateProfile(data);
            }
        } else if (storeName === 'sessions') {
            if (action === 'set') {
                await window.apiClient.createSession(data);
            } else if (action === 'delete') {
                await window.apiClient.deleteSession(data.id);
            }
        }
    }

    // ========== SYNC QUEUE MANAGEMENT ==========

    async addToSyncQueue(operation) {
        const transaction = this.db.transaction(['syncQueue'], 'readwrite');
        const store = transaction.objectStore('syncQueue');
        await store.add({
            ...operation,
            timestamp: Date.now(),
            retries: 0
        });
        console.log('📥 Operation queued for sync:', operation);
    }

    async processSyncQueue() {
        if (!this.backendAvailable || !this.online) return;

        const queue = await new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['syncQueue'], 'readonly');
            const store = transaction.objectStore('syncQueue');
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });

        console.log(`📤 Processing ${queue.length} queued operations...`);

        for (const operation of queue) {
            try {
                await this.syncToAPI(operation.storeName, operation.action, operation.data);
                // Remove from queue on success
                await this.removeFromSyncQueue(operation.id);
            } catch (error) {
                console.error('Failed to sync operation:', operation, error);
            }
        }
    }

    async removeFromSyncQueue(id) {
        const transaction = this.db.transaction(['syncQueue'], 'readwrite');
        const store = transaction.objectStore('syncQueue');
        await store.delete(id);
    }

    // ========== UTILITY METHODS ==========

    async clearAll() {
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

    async exportData() {
        const data = {
            userProfile: await this.getLocal('userProfile', 'primary-user'),
            sessions: await this.getAllLocal('sessions'),
            customSessions: await this.getAllLocal('customSessions'),
            achievements: await this.getAllLocal('achievements'),
            exportedAt: new Date().toISOString()
        };

        return data;
    }

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
                await this.setLocal('customSessions', customSession);
            }
        }

        if (data.achievements && Array.isArray(data.achievements)) {
            for (const achievement of data.achievements) {
                await this.setLocal('achievements', achievement);
            }
        }
    }
}

// Replace global instance
window.storageManager = new HybridStorageManager();

console.log('💾 Hybrid Storage Manager initialized');
