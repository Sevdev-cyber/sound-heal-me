/**
 * Session Manager Component
 * Handles guided sessions combining breathwork + sound
 * Migrated from root sessions.js to modular structure
 */

export class SessionManager {
    constructor() {
        this.sessions = {
            morning: {
                name: 'Morning Energizer',
                duration: 10,
                description: 'Start your day with energizing breath and uplifting sounds',
                steps: [
                    { type: 'breathwork', pattern: 'energize', duration: 5 },
                    { type: 'sound', sounds: ['solar-plexus', 'sacral'], duration: 5 }
                ]
            },
            evening: {
                name: 'Evening Wind Down',
                duration: 15,
                description: 'Gentle relaxation to prepare for restful sleep',
                steps: [
                    { type: 'breathwork', pattern: '478', duration: 7 },
                    { type: 'sound', sounds: ['crown', 'third-eye'], duration: 8 }
                ]
            },
            stress: {
                name: 'Stress Relief',
                duration: 10,
                description: 'Quick reset to release tension and find calm',
                steps: [
                    { type: 'breathwork', pattern: 'coherent', duration: 5 },
                    { type: 'sound', sounds: ['heart'], duration: 5 }
                ]
            },
            deep: {
                name: 'Deep Meditation',
                duration: 20,
                description: 'Extended practice for profound relaxation',
                steps: [
                    { type: 'breathwork', pattern: 'box', duration: 10 },
                    { type: 'sound', sounds: ['root', 'om'], duration: 10 }
                ]
            }
        };

        this.currentSession = null;
        this.currentStep = 0;
        this.isActive = false;
    }

    /**
     * Start a guided session
     */
    async startSession(sessionId) {
        const session = this.sessions[sessionId];

        if (!session) {
            console.error('Session not found:', sessionId);
            return;
        }

        this.currentSession = session;
        this.currentStep = 0;
        this.isActive = true;

        console.log(`🧘 Starting session: ${session.name}`);

        // Run through steps
        for (let i = 0; i < session.steps.length && this.isActive; i++) {
            this.currentStep = i;
            const step = session.steps[i];

            await this.runStep(step);
        }

        if (this.isActive) {
            this.completeSession();
        }
    }

    /**
     * Run a single session step
     */
    async runStep(step) {
        if (step.type === 'breathwork') {
            // Trigger breathwork
            if (window.basicBreathwork) {
                window.basicBreathwork.currentPattern = step.pattern;
                window.basicBreathwork.duration = step.duration;
                await window.basicBreathwork.start();
            }
        } else if (step.type === 'sound') {
            // Play sounds
            if (window.soundPlayer) {
                await window.soundPlayer.init();

                // Play each sound in the step
                for (const soundId of step.sounds) {
                    // This is simplified - in real implementation,
                    // you'd map sound IDs to actual frequencies/samples
                    window.soundPlayer.playFrequency(432, { id: soundId });
                }

                // Wait for duration
                await this.wait(step.duration * 60 * 1000);

                // Stop sounds
                window.soundPlayer.stopAll();
            }
        }
    }

    /**
     * Stop current session
     */
    stopSession() {
        this.isActive = false;
        this.currentSession = null;
        this.currentStep = 0;

        // Stop any active breathwork
        if (window.basicBreathwork && window.basicBreathwork.isActive) {
            window.basicBreathwork.stop();
        }

        // Stop any active sounds
        if (window.soundPlayer) {
            window.soundPlayer.stopAll();
        }

        console.log('⏹️ Session stopped');
    }

    /**
     * Complete session
     */
    completeSession() {
        console.log('✅ Session complete!');

        // Save to analytics
        if (window.sessionAnalytics) {
            window.sessionAnalytics.saveSession({
                type: 'guided',
                name: this.currentSession.name,
                duration: this.currentSession.duration,
                completed: true
            });
        }

        this.currentSession = null;
        this.isActive = false;
    }

    /**
     * Wait helper
     */
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Export singleton
export const sessionManager = new SessionManager();

// Global access
window.sessionManager = sessionManager;

// Global function for onclick handlers in HTML
window.startSession = (sessionId) => {
    sessionManager.startSession(sessionId);
};

console.log('✅ SessionManager module loaded');
