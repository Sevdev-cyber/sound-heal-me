// Pranayama - Classical Yogic Breathing Techniques
// Nadi Shodhana, Kapalabhati, Bhastrika, Ujjayi

class Pranayama {
    constructor() {
        this.isActive = false;
        this.currentTechnique = null;
        this.currentPhase = null;
        this.repsCompleted = 0;
        this.audioContext = null;
    }

    /**
     * Initialize audio
     */
    initAudio() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    /**
     * Techniques definitions
     */
    techniques = {
        'nadi-shodhana': {
            name: 'Nadi Shodhana',
            englishName: 'Alternate Nostril',
            description: 'Balances left and right energy channels',
            pattern: { left: 4, hold: 4, right: 4, hold: 4 },
            duration: 10, // minutes
            safety: 'Safe for all levels'
        },
        'kapalabhati': {
            name: 'Kapalabhati',
            englishName: 'Skull Shining Breath',
            description: 'Energizing, cleansing breath',
            pattern: { passiveInhale: 0.5, forcefulExhale: 0.5 },
            reps: 30,
            rounds: 3,
            safety: 'Avoid if pregnant or with high blood pressure'
        },
        'bhastrika': {
            name: 'Bhastrika',
            englishName: 'Bellows Breath',
            description: 'Powerful energizing technique',
            pattern: { forcefulInhale: 1, forcefulExhale: 1 },
            reps: 20,
            rounds: 3,
            safety: 'Advanced - not for beginners. Avoid if pregnant or with heart conditions'
        },
        'ujjayi': {
            name: 'Ujjayi',
            englishName: 'Ocean Breath',
            description: 'Calming, ocean-like breath with throat constriction',
            pattern: { inhale: 5, exhale: 5 },
            duration: 10, // minutes
            safety: 'Safe for all levels'
        }
    };

    /**
     * Start a pranayama technique
     */
    async start(techniqueId) {
        const technique = this.techniques[techniqueId];

        if (!technique) {
            console.error(`Technique ${techniqueId} not found`);
            return;
        }

        this.isActive = true;
        this.currentTechnique = techniqueId;
        this.repsCompleted = 0;

        this.updateUI({
            status: 'active',
            technique: technique.name,
            description: technique.description,
            safety: technique.safety
        });

        // Show safety warning if needed
        if (technique.safety.includes('Avoid')) {
            await this.showSafetyWarning(technique.safety);
        }

        // Run specific technique
        if (techniqueId === 'nadi-shodhana') {
            await this.runNadiShodhana();
        } else if (techniqueId === 'kapalabhati') {
            await this.runKapalabhati();
        } else if (techniqueId === 'bhastrika') {
            await this.runBhastrika();
        } else if (techniqueId === 'ujjayi') {
            await this.runUjjayi();
        }

        if (this.isActive) {
            this.complete();
        }
    }

    /**
     * Nadi Shodhana (Alternate Nostril)
     */
    async runNadiShodhana() {
        const technique = this.techniques['nadi-shodhana'];
        const { left, hold, right } = technique.pattern;
        const durationMs = technique.duration * 60 * 1000;
        const startTime = Date.now();

        this.updateUI({
            phase: 'instructions',
            message: 'Use your right thumb to close right nostril, ring finger to close left nostril'
        });

        await this.wait(4000);

        while (Date.now() - startTime < durationMs && this.isActive) {
            // Close right nostril, inhale left
            this.updateUI({
                phase: 'inhale',
                nostril: 'left',
                duration: left
            });
            await this.animateBreath('inhale', left * 1000);

            // Hold both
            this.updateUI({ phase: 'hold', nostril: 'both', duration: hold });
            await this.wait(hold * 1000);

            // Close left nostril, exhale right
            this.updateUI({
                phase: 'exhale',
                nostril: 'right',
                duration: right
            });
            await this.animateBreath('exhale', right * 1000);

            // Hold both
            this.updateUI({ phase: 'hold', nostril: 'both', duration: hold });
            await this.wait(hold * 1000);

            // Close right nostril, inhale right
            this.updateUI({
                phase: 'inhale',
                nostril: 'right',
                duration: right
            });
            await this.animateBreath('inhale', right * 1000);

            // Hold both
            this.updateUI({ phase: 'hold', nostril: 'both', duration: hold });
            await this.wait(hold * 1000);

            // Close left nostril, exhale left
            this.updateUI({
                phase: 'exhale',
                nostril: 'left',
                duration: left
            });
            await this.animateBreath('exhale', left * 1000);

            // Hold both
            this.updateUI({ phase: 'hold', nostril: 'both', duration: hold });
            await this.wait(hold * 1000);

            this.repsCompleted++;
        }
    }

    /**
     * Kapalabhati (Skull Shining)
     */
    async runKapalabhati() {
        const technique = this.techniques['kapalabhati'];
        const { reps, rounds } = technique;

        for (let round = 1; round <= rounds && this.isActive; round++) {
            this.updateUI({
                phase: 'round',
                round,
                totalRounds: rounds,
                message: `Round ${round} of ${rounds}`
            });

            await this.wait(2000);

            // Rapid breathing
            for (let rep = 1; rep <= reps && this.isActive; rep++) {
                // Passive inhale
                this.updateUI({ phase: 'passive-inhale', rep, totalReps: reps });
                this.playQuickChime();
                await this.wait(500);

                // Forceful exhale
                this.updateUI({ phase: 'forceful-exhale' });
                await this.wait(500);

                this.repsCompleted = rep;
            }

            // Rest between rounds
            if (round < rounds) {
                this.updateUI({ phase: 'rest', message: 'Rest and breathe normally' });
                await this.wait(30000); // 30 seconds rest
            }
        }
    }

    /**
     * Bhastrika (Bellows Breath)
     */
    async runBhastrika() {
        const technique = this.techniques['bhastrika'];
        const { reps, rounds } = technique;

        this.updateUI({
            message: 'This is an advanced technique. Stop if you feel dizzy.'
        });

        await this.wait(3000);

        for (let round = 1; round <= rounds && this.isActive; round++) {
            this.updateUI({
                phase: 'round',
                round,
                totalRounds: rounds
            });

            await this.wait(2000);

            // Rapid forceful breathing
            for (let rep = 1; rep <= reps && this.isActive; rep++) {
                // Forceful inhale
                this.updateUI({
                    phase: 'forceful-inhale',
                    rep,
                    totalReps: reps,
                    intensity: 'high'
                });
                this.playChime('high');
                await this.animateBreath('inhale', 1000);

                // Forceful exhale
                this.updateUI({ phase: 'forceful-exhale', intensity: 'high' });
                await this.animateBreath('exhale', 1000);

                this.repsCompleted = rep;
            }

            // Rest between rounds
            if (round < rounds) {
                this.updateUI({ phase: 'rest', message: 'Rest and normalize breathing' });
                await this.wait(45000); // 45 seconds rest
            }
        }
    }

    /**
     * Ujjayi (Ocean Breath)
     */
    async runUjjayi() {
        const technique = this.techniques['ujjayi'];
        const { inhale, exhale } = technique.pattern;
        const durationMs = technique.duration * 60 * 1000;
        const startTime = Date.now();

        this.updateUI({
            phase: 'instructions',
            message: 'Slightly constrict the back of your throat to create an ocean-like sound'
        });

        await this.wait(4000);

        while (Date.now() - startTime < durationMs && this.isActive) {
            // Ujjayi inhale
            this.updateUI({
                phase: 'ujjayi-inhale',
                duration: inhale,
                message: 'Inhale with throat constriction - ocean sound'
            });
            await this.animateBreath('inhale', inhale * 1000, 'ocean');

            // Ujjayi exhale
            this.updateUI({
                phase: 'ujjayi-exhale',
                duration: exhale,
                message: 'Exhale with throat constriction - ocean sound'
            });
            await this.animateBreath('exhale', exhale * 1000, 'ocean');

            this.repsCompleted++;
        }
    }

    /**
     * Animate breath visualization
     */
    async animateBreath(phase, durationMs, style = 'normal') {
        const event = new CustomEvent('pranayama-breath', {
            detail: { phase, duration: durationMs, style }
        });
        window.dispatchEvent(event);

        await this.wait(durationMs);
    }

    /**
     * Play audio chime
     */
    playChime(pitch = 'normal') {
        this.initAudio();
        const ctx = this.audioContext;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.frequency.value = pitch === 'high' ? 880 : 440;
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.2);
    }

    /**
     * Play quick chime for rapid breathing
     */
    playQuickChime() {
        this.initAudio();
        const ctx = this.audioContext;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.frequency.value = 660;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.05);
    }

    /**
     * Show safety warning
     */
    async showSafetyWarning(warning) {
        this.updateUI({
            phase: 'warning',
            message: `⚠️ Safety Notice: ${warning}`,
            requireConfirmation: true
        });

        // Wait for user confirmation
        return new Promise((resolve) => {
            this.onSafetyConfirmed = resolve;
        });
    }

    /**
     * Confirm safety warning
     */
    confirmSafety() {
        if (this.onSafetyConfirmed) {
            this.onSafetyConfirmed();
        }
    }

    /**
     * Complete technique
     */
    complete() {
        this.isActive = false;

        this.updateUI({
            status: 'complete',
            message: `✨ ${this.techniques[this.currentTechnique].name} complete!`,
            repsCompleted: this.repsCompleted
        });

        // Save session
        if (window.sessionAnalytics) {
            window.sessionAnalytics.saveSession({
                type: 'breathwork',
                pattern: this.currentTechnique,
                duration: this.techniques[this.currentTechnique].duration || 10,
                completed: true,
                notes: `${this.repsCompleted} cycles completed`
            });
        }
    }

    /**
     * Stop technique
     */
    stop() {
        this.isActive = false;

        this.updateUI({
            status: 'stopped',
            message: 'Technique stopped. Return to normal breathing.'
        });
    }

    /**
     * Update UI
     */
    updateUI(data) {
        const event = new CustomEvent('pranayama-update', { detail: data });
        window.dispatchEvent(event);
    }

    /**
     * Wait helper
     */
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get all techniques
     */
    getAllTechniques() {
        return Object.entries(this.techniques).map(([id, technique]) => ({
            id,
            ...technique
        }));
    }
}

// Export
window.pranayama = new Pranayama();
