// Wim Hof Method - Complete Breathing Protocol
// 3 rounds: Hyperventilation → Retention → Recovery Breath

class WimHofMethod {
    constructor() {
        this.isActive = false;
        this.currentRound = 0;
        this.currentPhase = null;
        this.totalRounds = 3;
        this.breathCount = 0;
        this.retentionStartTime = null;
        this.retentionTime = 0;
        this.personalBests = JSON.parse(localStorage.getItem('wimHofBests') || '[]');
        this.audioContext = null;
    }

    /**
     * Initialize audio for breath cues
     */
    initAudio() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    /**
     * Play breath cue sound
     */
    playChime(type = 'breath') {
        this.initAudio();
        const ctx = this.audioContext;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        if (type === 'breath') {
            osc.frequency.value = 440;
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        } else if (type === 'phase-complete') {
            osc.frequency.value = 880;
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        } else if (type === 'round-complete') {
            osc.frequency.value = 1320;
            gain.gain.setValueAtTime(0.2, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        }

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.5);
    }

    /**
     * Start Wim Hof protocol
     */
    async start() {
        this.isActive = true;
        this.currentRound = 1;

        this.updateUI({
            status: 'active',
            round: this.currentRound,
            phase: 'instructions',
            message: 'Get comfortable. Breathe deeply and fully.'
        });

        await this.wait(3000);

        for (let round = 1; round <= this.totalRounds; round++) {
            this.currentRound = round;

            if (!this.isActive) break;

            await this.runRound(round);
        }

        if (this.isActive) {
            this.complete();
        }
    }

    /**
     * Run a single round
     */
    async runRound(roundNum) {
        // Phase 1: Hyperventilation (30-40 breaths)
        await this.hyperventilationPhase(roundNum);

        if (!this.isActive) return;

        // Phase 2: Breath Retention
        await this.retentionPhase(roundNum);

        if (!this.isActive) return;

        // Phase 3: Recovery Breath
        await this.recoveryBreath(roundNum);
    }

    /**
     * Phase 1: Hyperventilation
     */
    async hyperventilationPhase(round) {
        const targetBreaths = 30 + Math.floor(Math.random() * 11); // 30-40
        this.breathCount = 0;
        this.currentPhase = 'hyperventilation';

        this.updateUI({
            phase: 'hyperventilation',
            round,
            instructions: 'Breathe in deeply, let go passively',
            breathCount: 0,
            totalBreaths: targetBreaths
        });

        while (this.breathCount < targetBreaths && this.isActive) {
            // Inhale (2 seconds)
            this.updateBreathVisual('inhale');
            this.playChime('breath');
            await this.wait(2000);

            // Exhale (1 second - passive)
            this.updateBreathVisual('exhale');
            await this.wait(1000);

            this.breathCount++;
            this.updateUI({ breathCount: this.breathCount });
        }

        this.playChime('phase-complete');
    }

    /**
     * Phase 2: Breath Retention
     */
    async retentionPhase(round) {
        this.currentPhase = 'retention';
        this.retentionStartTime = Date.now();
        this.retentionTime = 0;

        this.updateUI({
            phase: 'retention',
            round,
            instructions: 'Hold your breath. Relax. Stay calm.',
            retentionTime: 0
        });

        // Update timer every 100ms
        const timerInterval = setInterval(() => {
            if (this.currentPhase !== 'retention' || !this.isActive) {
                clearInterval(timerInterval);
                return;
            }

            this.retentionTime = Math.floor((Date.now() - this.retentionStartTime) / 1000);
            this.updateUI({ retentionTime: this.retentionTime });
        }, 100);

        // User signals when they need to breathe
        // UI will have a button for this
        return new Promise((resolve) => {
            this.onRetentionComplete = () => {
                clearInterval(timerInterval);
                this.playChime('phase-complete');

                // Save personal best
                this.saveRetentionTime(round, this.retentionTime);

                resolve();
            };
        });
    }

    /**
     * User signals retention complete
     */
    completeRetention() {
        if (this.onRetentionComplete) {
            this.onRetentionComplete();
        }
    }

    /**
     * Phase 3: Recovery Breath
     */
    async recoveryBreath(round) {
        this.currentPhase = 'recovery';

        this.updateUI({
            phase: 'recovery',
            round,
            instructions: 'Big breath in and hold for 15 seconds'
        });

        // Deep inhale
        this.updateBreathVisual('inhale');
        this.playChime('breath');
        await this.wait(3000);

        // Hold 15 seconds
        this.updateUI({ instructions: 'Hold for 15 seconds... relax' });

        for (let i = 15; i > 0; i--) {
            this.updateUI({ countdown: i });
            await this.wait(1000);
            if (!this.isActive) return;
        }

        // Exhale
        this.updateUI({ instructions: 'Breathe out slowly' });
        this.updateBreathVisual('exhale');
        await this.wait(3000);

        this.playChime('round-complete');

        // Short rest before next round
        if (round < this.totalRounds) {
            this.updateUI({
                phase: 'rest',
                instructions: `Round ${round} complete! Rest for a moment.`
            });
            await this.wait(5000);
        }
    }

    /**
     * Complete protocol
     */
    complete() {
        this.isActive = false;

        this.updateUI({
            status: 'complete',
            message: '🎉 Wim Hof Method complete! Well done!',
            personalBests: this.personalBests
        });

        // Save session
        if (window.sessionAnalytics) {
            window.sessionAnalytics.saveSession({
                type: 'breathwork',
                pattern: 'wim-hof',
                duration: 15, // Approximately 15 minutes
                completed: true,
                notes: `${this.totalRounds} rounds completed`
            });
        }
    }

    /**
     * Stop protocol
     */
    stop() {
        this.isActive = false;
        this.currentPhase = null;

        this.updateUI({
            status: 'stopped',
            message: 'Protocol stopped'
        });
    }

    /**
     * Save retention time as personal best
     */
    saveRetentionTime(round, seconds) {
        this.personalBests.push({
            round,
            time: seconds,
            date: Date.now()
        });

        // Keep only last 20 records
        if (this.personalBests.length > 20) {
            this.personalBests = this.personalBests.slice(-20);
        }

        localStorage.setItem('wimHofBests', JSON.stringify(this.personalBests));
    }

    /**
     * Get best retention time
     */
    getBestRetentionTime() {
        if (this.personalBests.length === 0) return 0;

        return Math.max(...this.personalBests.map(b => b.time));
    }

    /**
     * Update UI elements
     */
    updateUI(data) {
        const event = new CustomEvent('wimhof-update', { detail: data });
        window.dispatchEvent(event);
    }

    /**
     * Update breath visualization
     */
    updateBreathVisual(phase) {
        const event = new CustomEvent('wimhof-breath', { detail: { phase } });
        window.dispatchEvent(event);
    }

    /**
     * Helper: wait
     */
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Export
window.wimHofMethod = new WimHofMethod();
