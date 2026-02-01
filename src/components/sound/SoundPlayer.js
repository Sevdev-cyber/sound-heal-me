/**
 * Sound Player Component
 * Universal sound generation engine for all audio types
 * Migrated from root sound-player.js to modular structure
 */

export class SoundPlayer {
    constructor() {
        this.audioContext = null;
        this.activeOscillators = new Map(); // Track playing sounds
        this.activeSamples = new Map(); // Track playing samples
        this.masterGain = null;
        this.initialized = false;
    }

    /**
     * Initialize audio context (must be triggered by user interaction)
     */
    async init() {
        if (this.initialized) return;

        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            this.masterGain.gain.value = 0.7; // Master volume

            this.initialized = true;
            console.log('🎵 SoundPlayer initialized');
        } catch (error) {
            console.error('Failed to initialize audio:', error);
        }
    }

    /**
     * Play a frequency (singing bowl, binaural beat, etc.)
     */
    playFrequency(frequency, options = {}) {
        if (!this.initialized) this.init();

        const {
            id = `freq_${frequency}`,
            volume = 0.5,
            type = 'sine',
            fadeIn = 500
        } = options;

        // Stop if already playing
        if (this.activeOscillators.has(id)) {
            this.stopSound(id);
        }

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = type;
        osc.frequency.value = frequency;

        // Fade in
        gain.gain.setValueAtTime(0, this.audioContext.currentTime);
        gain.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + fadeIn / 1000);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();

        this.activeOscillators.set(id, { osc, gain });

        return id;
    }

    /**
     * Play binaural beat (L/R frequency difference)
     */
    playBinauralBeat(baseFreq, beatFreq, options = {}) {
        const id = options.id || `binaural_${baseFreq}_${beatFreq}`;

        // Left channel
        this.playFrequency(baseFreq, {
            ...options,
            id: `${id}_left`
        });

        // Right channel (slightly different frequency)
        this.playFrequency(baseFreq + beatFreq, {
            ...options,
            id: `${id}_right`
        });

        return id;
    }

    /**
     * Play nature Sound (sample-based - simplified for now)
     */
    playNatureSound(soundId, options = {}) {
        // For now, use oscillator to simulate
        // In production, you'd load actual audio samples
        const frequencies = {
            rain: 400,
            ocean: 300,
            forest: 800,
            river: 350,
            wind: 250,
            thunder: 100
        };

        const freq = frequencies[soundId] || 440;
        return this.playFrequency(freq, {
            ...options,
            id: soundId,
            type: 'triangle',
            volume: 0.3
        });
    }

    /**
     * Stop a specific sound
     */
    stopSound(id, fadeOut = 500) {
        // Stop oscillator
        if (this.activeOscillators.has(id)) {
            const { osc, gain } = this.activeOscillators.get(id);

            // Fade out
            gain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + fadeOut / 1000);

            // Stop after fade
            setTimeout(() => {
                osc.stop();
                this.activeOscillators.delete(id);
            }, fadeOut);
        }

        // Stop binaural (which has _left/_right)
        this.stopSound(`${id}_left`, fadeOut);
        this.stopSound(`${id}_right`, fadeOut);
    }

    /**
     * Stop all sounds
     */
    stopAll() {
        for (const id of this.activeOscillators.keys()) {
            this.stopSound(id);
        }
    }

    /**
     * Set master volume
     */
    setMasterVolume(volume) {
        if (this.masterGain) {
            this.masterGain.gain.linearRampToValueAtTime(
                volume,
                this.audioContext.currentTime + 0.1
            );
        }
    }

    /**
     * Check if a sound is playing
     */
    isPlaying(id) {
        return this.activeOscillators.has(id) || this.activeOscillators.has(`${id}_left`);
    }
}

// Export singleton
export const soundPlayer = new SoundPlayer();

// Global access for backward compatibility
window.soundPlayer = soundPlayer;

console.log('✅ SoundPlayer module loaded');
