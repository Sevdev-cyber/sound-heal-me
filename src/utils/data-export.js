// Data Export - Health app compatible exports
// Generates JSON for HealthKit, Google Fit, and generic wellness apps

class DataExport {
    /**
     * Export sessions as HealthKit-compatible JSON
     */
    exportHealthKitJSON(sessions) {
        const healthData = {
            data: sessions.map(session => ({
                type: 'HKCategoryTypeIdentifierMindfulSession',
                sourceName: 'Sacred Sound',
                sourceVersion: '2.0',
                unit: 'min',
                creationDate: new Date(session.date).toISOString(),
                startDate: new Date(session.date).toISOString(),
                endDate: new Date(session.date + (session.duration || 10) * 60 * 1000).toISOString(),
                value: session.duration || 10,
                metadata: {
                    HKMetadataKeyMindfulSessionType: this.getHealthKitSessionType(session.type),
                    pattern: session.pattern || session.guidedSession,
                    moodBefore: session.moodBefore,
                    moodAfter: session.moodAfter,
                    moodImprovement: session.moodAfter && session.moodBefore ?
                        session.moodAfter - session.moodBefore : null
                }
            }))
        };

        return JSON.stringify(healthData, null, 2);
    }

    /**
     * Get HealthKit session type
     */
    getHealthKitSessionType(type) {
        const typeMap = {
            'breathwork': 'Meditation.Breathing',
            'sound': 'Meditation.SoundHealing',
            'guided': 'Meditation.Guided'
        };
        return typeMap[type] || 'Meditation';
    }

    /**
     * Export for Google Fit
     */
    exportGoogleFitJSON(sessions) {
        const fitData = {
            dataSourceId: 'raw:com.sacredsound:meditation',
            application: {
                packageName: 'com.sacredsound.app',
                version: '2.0',
                detailsUrl: 'https://sacredsound.app'
            },
            dataPoints: sessions.map(session => ({
                dataTypeName: 'com.google.activity.segment',
                startTimeNanos: new Date(session.date).getTime() * 1000000,
                endTimeNanos: (new Date(session.date).getTime() + (session.duration || 10) * 60 * 1000) * 1000000,
                value: [{
                    intVal: 108 // Activity type: Meditation
                }],
                modifiedTimeMillis: new Date(session.date).getTime()
            }))
        };

        return JSON.stringify(fitData, null, 2);
    }

    /**
     * Generic wellness app export
     */
    exportGenericJSON(sessions, userStats) {
        const data = {
            exportDate: new Date().toISOString(),
            app: 'Sacred Sound',
            version: '2.0',
            user: {
                totalSessions: userStats.totalSessions || sessions.length,
                totalMinutes: userStats.totalMinutes,
                currentStreak: userStats.currentStreak,
                level: userStats.level || 1,
                xp: userStats.xp || 0
            },
            sessions: sessions.map(session => ({
                id: session.id,
                date: new Date(session.date).toISOString(),
                type: session.type,
                pattern: session.pattern || session.guidedSession,
                duration: session.duration,
                sounds: session.sounds,
                moodBefore: session.moodBefore,
                moodAfter: session.moodAfter,
                completed: session.completed !== false
            }))
        };

        return JSON.stringify(data, null, 2);
    }

    /**
     * Download health data
     */
    async downloadHealthData(format = 'healthkit') {
        const sessions = await window.storageManager.getAll('sessions');
        const profile = await window.userProfile.getProfile();

        let jsonData;
        let filename;

        switch (format) {
            case 'healthkit':
                jsonData = this.exportHealthKitJSON(sessions);
                filename = 'sacred-sound-healthkit.json';
                break;
            case 'googlefit':
                jsonData = this.exportGoogleFitJSON(sessions);
                filename = 'sacred-sound-googlefit.json';
                break;
            default:
                jsonData = this.exportGenericJSON(sessions, profile.stats);
                filename = 'sacred-sound-export.json';
        }

        // Download
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        if (window.showNotification) {
            window.showNotification(`✅ Exported ${sessions.length} sessions as ${format.toUpperCase()}`);
        }
    }
}

// Create global instance
window.dataExport = new DataExport();

console.log('💾 Data Export module loaded');
