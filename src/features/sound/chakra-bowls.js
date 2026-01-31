// Chakra Bowls - Extended Singing Bowl Frequencies
// 7 Chakra frequencies + Solfeggio + Planetary tones

class ChakraBowls {
    constructor() {
        this.audioContext = null;
        this.activeOscillators = new Map();

        // Chakra frequencies
        this.frequencies = {
            // 7 Chakras
            'root-chakra': {
                freq: 396,
                name: 'Root Chakra - Muladhara',
                description: 'Grounding, security, basic needs',
                color: '#E53935',
                element: 'Earth'
            },
            'sacral-chakra': {
                freq: 417,
                name: 'Sacral Chakra - Svadhisthana',
                description: 'Creativity, emotions, sexuality',
                color: '#FB8C00',
                element: 'Water'
            },
            'solar-plexus': {
                freq: 528,
                name: 'Solar Plexus - Manipura',
                description: 'Personal power, confidence',
                color: '#FDD835',
                element: 'Fire'
            },
            'heart-chakra': {
                freq: 639,
                name: 'Heart Chakra - Anahata',
                description: 'Love, compassion, healing',
                color: '#43A047',
                element: 'Air'
            },
            'throat-chakra': {
                freq: 741,
                name: 'Throat Chakra - Vishuddha',
                description: 'Communication, expression, truth',
                color: '#1E88E5',
                element: 'Ether'
            },
            'third-eye': {
                freq: 852,
                name: 'Third Eye - Ajna',
                description: 'Intuition, wisdom, insight',
                color: '#5E35B1',
                element: 'Light'
            },
            'crown-chakra': {
                freq: 963,
                name: 'Crown Chakra - Sahasrara',
                description: 'Spiritual connection, enlightenment',
                color: '#9C27B0',
                element: 'Thought'
            },

            // Additional Solfeggio frequencies
            'solfeggio-174': {
                freq: 174,
                name: 'Solfeggio 174 Hz',
                description: 'Pain reduction, security',
                color: '#795548'
            },
            'solfeggio-285': {
                freq: 285,
                name: 'Solfeggio 285 Hz',
                description: 'Healing and regeneration',
                color: '#8D6E63'
            },

            // Planetary frequencies
            'earth-om': {
                freq: 136.1,
                name: 'Earth Om',
                description: 'Earth year frequency, grounding',
                color: '#4E342E'
            },
            'moon': {
                freq: 210.42,
                name: 'Moon',
                description: 'Lunar frequency, emotions',
                color: '#B0BEC5'
            },
            'sun': {
                freq: 126.22,
                name: 'Sun',
                description: 'Solar frequency, vitality',
                color: '#FFD54F'
            }
        };
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
     * Create singing bowl sound with LFO modulation
     */
    createChakraBowl(bowlId, volume = 0.3) {
        const ctx = this.initAudioContext();
        const bowl = this.frequencies[bowlId];

        if (!bowl) {
            console.error(`Bowl ${bowlId} not found`);
            return null;
        }

        // Main oscillator
        const oscillator = ctx.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.value = bowl.freq;

        // LFO for vibrato (makes it sound more natural)
        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 4 + Math.random() * 2; // 4-6 Hz vibrato

        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 2; // Subtle vibrato depth

        lfo.connect(lfoGain);
        lfoGain.connect(oscillator.frequency);

        // Add harmonics for richness
        const harmonic1 = ctx.createOscillator();
        harmonic1.type = 'sine';
        harmonic1.frequency.value = bowl.freq * 2; // Octave

        const harmonic2 = ctx.createOscillator();
        harmonic2.type = 'sine';
        harmonic2.frequency.value = bowl.freq * 3; // Perfect fifth

        // Gain nodes for mixing
        const mainGain = ctx.createGain();
        mainGain.gain.value = volume;

        const harmonic1Gain = ctx.createGain();
        harmonic1Gain.gain.value = volume * 0.3;

        const harmonic2Gain = ctx.createGain();
        harmonic2Gain.gain.value = volume * 0.15;

        // Connect everything
        oscillator.connect(mainGain);
        harmonic1.connect(harmonic1Gain);
        harmonic2.connect(harmonic2Gain);

        // Merger for final output
        const merger = ctx.createChannelMerger(1);
        mainGain.connect(merger);
        harmonic1Gain.connect(merger);
        harmonic2Gain.connect(merger);

        // Fade in
        mainGain.gain.setValueAtTime(0, ctx.currentTime);
        mainGain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 3);

        harmonic1Gain.gain.setValueAtTime(0, ctx.currentTime);
        harmonic1Gain.gain.linearRampToValueAtTime(volume * 0.3, ctx.currentTime + 3);

        harmonic2Gain.gain.setValueAtTime(0, ctx.currentTime);
        harmonic2Gain.gain.linearRampToValueAtTime(volume * 0.15, ctx.currentTime + 3);

        // Start oscillators
        oscillator.start();
        harmonic1.start();
        harmonic2.start();
        lfo.start();

        // Store references
        this.activeOscillators.set(bowlId, {
            oscillators: [oscillator, harmonic1, harmonic2, lfo],
            gains: [mainGain, harmonic1Gain, harmonic2Gain, lfoGain],
            merger,
            volume
        });

        return merger;
    }

    /**
     * Play a chakra bowl
     */
    play(bowlId, volume = 0.3, destination) {
        const bowl = this.createChakraBowl(bowlId, volume);

        if (bowl && destination) {
            bowl.connect(destination);
        }

        return bowl;
    }

    /**
     * Stop a specific bowl
     */
    stop(bowlId, fadeTime = 2) {
        const bowl = this.activeOscillators.get(bowlId);

        if (!bowl) return;

        const ctx = this.audioContext;
        const now = ctx.currentTime;

        // Fade out
        bowl.gains.forEach(gain => {
            gain.gain.linearRampToValueAtTime(0, now + fadeTime);
        });

        // Stop after fade
        setTimeout(() => {
            bowl.oscillators.forEach(osc => {
                try {
                    osc.stop();
                } catch (e) {
                    // Already stopped
                }
            });

            this.activeOscillators.delete(bowlId);
        }, fadeTime * 1000);
    }

    /**
     * Stop all bowls
     */
    stopAll(fadeTime = 2) {
        const bowlIds = Array.from(this.activeOscillators.keys());
        bowlIds.forEach(id => this.stop(id, fadeTime));
    }

    /**
     * Adjust volume of a playing bowl
     */
    setVolume(bowlId, newVolume) {
        const bowl = this.activeOscillators.get(bowlId);

        if (!bowl) return;

        const ctx = this.audioContext;
        const now = ctx.currentTime;

        bowl.gains[0].gain.linearRampToValueAtTime(newVolume, now + 0.5);
        bowl.gains[1].gain.linearRampToValueAtTime(newVolume * 0.3, now + 0.5);
        bowl.gains[2].gain.linearRampToValueAtTime(newVolume * 0.15, now + 0.5);
    }

    /**
     * Get all available bowls
     */
    getAllBowls() {
        return Object.entries(this.frequencies).map(([id, data]) => ({
            id,
            ...data
        }));
    }

    /**
     * Get bowls by category
     */
    getBowlsByCategory(category) {
        const categories = {
            chakra: ['root-chakra', 'sacral-chakra', 'solar-plexus', 'heart-chakra',
                'throat-chakra', 'third-eye', 'crown-chakra'],
            solfeggio: ['solfeggio-174', 'solfeggio-285'],
            planetary: ['earth-om', 'moon', 'sun']
        };

        return categories[category] || [];
    }

    /**
     * Play chakra sequence (all 7 chakras in order)
     */
    async playChakraSequence(duration = 60, destination) {
        const chakras = this.getBowlsByCategory('chakra');
        const durationPerChakra = duration / chakras.length;

        for (let i = 0; i < chakras.length; i++) {
            this.play(chakras[i], 0.3, destination);

            await new Promise(resolve => setTimeout(resolve, durationPerChakra * 1000));

            this.stop(chakras[i], 3);
        }
    }
}

// Export for use
window.chakraBowls = new ChakraBowls();
