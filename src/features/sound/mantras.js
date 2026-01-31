// Mantras and Vocals - Procedural Voice Synthesis
// Om, Aum, So Hum and other sacred mantras

class MantraVocals {
    constructor() {
        this.audioContext = null;
        this.activeVocals = new Map();
    }

    /**
     * Initialize audio context
     */
    initAudioContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        return this.audioContext;
    }

    /**
     * Create Om mantra (136.1 Hz - Earth frequency)
     */
    createOm(volume = 0.4, destination) {
        const ctx = this.initAudioContext();
        const baseFreq = 136.1;

        // Three layers for Om sound
        const osc1 = ctx.createOscillator();
        osc1.type = 'sine';
        osc1.frequency.value = baseFreq;

        const osc2 = ctx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.value = baseFreq * 2;

        const osc3 = ctx.createOscillator();
        osc3.type = 'triangle';
        osc3.frequency.value = baseFreq * 3;

        //  Formant filter for vocal quality
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 400; // 'O' formant
        filter.Q.value = 10;

        // Gain nodes
        const gain1 = ctx.createGain();
        gain1.gain.value = volume;

        const gain2 = ctx.createGain();
        gain2.gain.value = volume * 0.5;

        const gain3 = ctx.createGain();
        gain3.gain.value = volume * 0.3;

        // LFO for natural vibrato
        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 5;

        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 3;

        lfo.connect(lfoGain);
        lfoGain.connect(osc1.frequency);
        lfoGain.connect(osc2.frequency);

        // Connect chain
        osc1.connect(gain1);
        osc2.connect(gain2);
        osc3.connect(gain3);

        gain1.connect(filter);
        gain2.connect(filter);
        gain3.connect(filter);

        if (destination) {
            filter.connect(destination);
        }

        // Slow fade in
        gain1.gain.setValueAtTime(0, ctx.currentTime);
        gain1.gain.linearRampToValueAtTime(volume, ctx.currentTime + 4);
        gain2.gain.setValueAtTime(0, ctx.currentTime);
        gain2.gain.linearRampToValueAtTime(volume * 0.5, ctx.currentTime + 4);
        gain3.gain.setValueAtTime(0, ctx.currentTime);
        gain3.gain.linearRampToValueAtTime(volume * 0.3, ctx.currentTime + 4);

        // Start
        osc1.start();
        osc2.start();
        osc3.start();
        lfo.start();

        this.activeVocals.set('om', {
            oscillators: [osc1, osc2, osc3, lfo],
            gains: [gain1, gain2, gain3],
            filter
        });

        return filter;
    }

    /**
     * Create Aum mantra (3 phases: A-U-M)
     */
    async createAum(volume = 0.4, destination) {
        const ctx = this.initAudioContext();
        const baseFreq = 136.1;

        // Phase durations in seconds
        const phaseDurations = { a: 3, u: 3, m: 4 };

        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = baseFreq;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.Q.value = 8;

        const gain = ctx.createGain();
        gain.gain.value = 0;

        osc.connect(filter);
        filter.connect(gain);

        if (destination) {
            gain.connect(destination);
        }

        osc.start();

        let time = ctx.currentTime;

        // A phase (open, high formant)
        filter.frequency.setValueAtTime(800, time);
        gain.gain.linearRampToValueAtTime(volume, time + 1);
        time += phaseDurations.a;

        // U phase (mid, lower formant)
        filter.frequency.linearRampToValueAtTime(350, time);
        time += phaseDurations.u;

        // M phase (closed, lowest formant)
        filter.frequency.linearRampToValueAtTime(200, time);
        gain.gain.linearRampToValueAtTime(0, time + phaseDurations.m);

        // Stop after sequence
        const totalDuration = phaseDurations.a + phaseDurations.u + phaseDurations.m;
        setTimeout(() => {
            osc.stop();
            if (this.activeVocals.has('aum')) {
                this.activeVocals.delete('aum');
            }
        }, totalDuration * 1000);

        this.activeVocals.set('aum', {
            oscillators: [osc],
            gains: [gain],
            filter
        });

        return filter;
    }

    /**
     * Create So Hum mantra (inhale-exhale)
     */
    createSoHum(breathPattern, volume = 0.3, destination) {
        const ctx = this.initAudioContext();

        // This would sync with breathwork pattern
        // "So" on inhale, "Hum" on exhale

        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = 136.1;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.Q.value = 10;

        const gain = ctx.createGain();
        gain.gain.value = 0;

        osc.connect(filter);
        filter.connect(gain);

        if (destination) {
            gain.connect(destination);
        }

        osc.start();

        // This will be controlled by breath phase
        this.activeVocals.set('so-hum', {
            oscillators: [osc],
            gains: [gain],
            filter,
            syncToBreath: true
        });

        return filter;
    }

    /**
     * Sync So Hum to breath phase
     */
    syncSoHumToBreath(phase) {
        const vocal = this.activeVocals.get('so-hum');
        if (!vocal) return;

        const ctx = this.audioContext;
        const now = ctx.currentTime;

        if (phase === 'inhale') {
            // "So" - higher, brighter
            vocal.filter.frequency.linearRampToValueAtTime(500, now + 0.5);
            vocal.gains[0].gain.linearRampToValueAtTime(0.3, now + 0.5);
        } else if (phase === 'exhale') {
            // "Hum" - lower, darker
            vocal.filter.frequency.linearRampToValueAtTime(200, now + 0.5);
            vocal.gains[0].gain.linearRampToValueAtTime(0.3, now + 0.5);
        } else if (phase === 'hold') {
            // Silence during hold
            vocal.gains[0].gain.linearRampToValueAtTime(0, now + 0.3);
        }
    }

    /**
     * Stop a mantra
     */
    stop(mantraId, fadeTime = 3) {
        const vocal = this.activeVocals.get(mantraId);
        if (!vocal) return;

        const ctx = this.audioContext;
        const now = ctx.currentTime;

        vocal.gains.forEach(gain => {
            gain.gain.linearRampToValueAtTime(0, now + fadeTime);
        });

        setTimeout(() => {
            vocal.oscillators.forEach(osc => {
                try {
                    osc.stop();
                } catch (e) { }
            });
            this.activeVocals.delete(mantraId);
        }, fadeTime * 1000);
    }

    /**
     * Stop all mantras
     */
    stopAll(fadeTime = 3) {
        const ids = Array.from(this.activeVocals.keys());
        ids.forEach(id => this.stop(id, fadeTime));
    }
}

// Export
window.mantraVocals = new MantraVocals();
