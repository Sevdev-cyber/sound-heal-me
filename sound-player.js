// ============================================
// SOUND HEALING PLAYER
// Web Audio API based sound synthesis and mixing
// ============================================

class SoundHealingPlayer {
    constructor() {
        this.audioContext = null;
        this.activeSounds = new Map();
        this.masterGain = null;
        this.analyser = null;
        this.visualizerCanvas = null;
        this.visualizerCtx = null;
        this.animationFrame = null;

        this.soundDefinitions = {
            'tibetan-bowl': { type: 'bowl', freq: 220, name: 'Tibetan Bowl' },
            'crystal-bowl': { type: 'bowl', freq: 432, name: 'Crystal Bowl' },
            'rain': { type: 'noise', filter: 'lowpass', name: 'Rain' },
            'ocean': { type: 'oscillating-noise', name: 'Ocean Waves' },
            'forest': { type: 'nature', name: 'Forest' },
            'theta': { type: 'binaural', base: 200, beat: 6, name: 'Theta Waves' },
            'alpha': { type: 'binaural', base: 200, beat: 10, name: 'Alpha Waves' },
            'ethereal': { type: 'pad', freqs: [261.63, 329.63, 392.00], name: 'Ethereal Pads' },
            'chimes': { type: 'chimes', name: 'Wind Chimes' }
        };

        this.initElements();
        this.initEventListeners();
    }

    initElements() {
        this.soundButtons = document.querySelectorAll('.sound-btn');
        this.mixerDiv = document.getElementById('soundMixer');
        this.activeSoundsDiv = document.getElementById('activeSounds');
        this.visualizerCanvas = document.getElementById('audioVisualizer');
        this.visualizerCtx = this.visualizerCanvas.getContext('2d');
    }

    initEventListeners() {
        this.soundButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const soundId = btn.dataset.sound;
                if (this.activeSounds.has(soundId)) {
                    this.stopSound(soundId);
                } else {
                    this.playSound(soundId);
                }
            });
        });
    }

    initAudioContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = 0.5;

            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;

            this.masterGain.connect(this.analyser);
            this.analyser.connect(this.audioContext.destination);

            this.startVisualizer();
        }
    }

    playSound(soundId) {
        this.initAudioContext();

        const definition = this.soundDefinitions[soundId];
        if (!definition) return;

        let soundNodes;

        switch (definition.type) {
            case 'bowl':
                soundNodes = this.createBowl(definition.freq);
                break;
            case 'noise':
                soundNodes = this.createNoise(definition.filter);
                break;
            case 'oscillating-noise':
                soundNodes = this.createOscillatingNoise();
                break;
            case 'nature':
                soundNodes = this.createNature();
                break;
            case 'binaural':
                soundNodes = this.createBinaural(definition.base, definition.beat);
                break;
            case 'pad':
                soundNodes = this.createPad(definition.freqs);
                break;
            case 'chimes':
                soundNodes = this.createChimes();
                break;
        }

        if (soundNodes) {
            this.activeSounds.set(soundId, soundNodes);
            this.updateUI(soundId, definition.name);
            this.updateMixer();
        }
    }

    stopSound(soundId) {
        const soundNodes = this.activeSounds.get(soundId);
        if (!soundNodes) return;

        // Fade out
        const now = this.audioContext.currentTime;
        soundNodes.gain.gain.setValueAtTime(soundNodes.gain.gain.value, now);
        soundNodes.gain.gain.linearRampToValueAtTime(0, now + 0.5);

        setTimeout(() => {
            soundNodes.sources.forEach(source => source.stop());
            this.activeSounds.delete(soundId);
            this.updateUI(soundId, null);
            this.updateMixer();
        }, 500);
    }

    createBowl(frequency) {
        const gain = this.audioContext.createGain();
        const oscillator = this.audioContext.createOscillator();
        const lfo = this.audioContext.createOscillator();
        const lfoGain = this.audioContext.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;

        lfo.type = 'sine';
        lfo.frequency.value = 2;
        lfoGain.gain.value = 5;

        lfo.connect(lfoGain);
        lfoGain.connect(oscillator.frequency);

        oscillator.connect(gain);
        gain.connect(this.masterGain);

        gain.gain.setValueAtTime(0, this.audioContext.currentTime);
        gain.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 2);

        oscillator.start();
        lfo.start();

        return { sources: [oscillator, lfo], gain };
    }

    createNoise(filterType = 'lowpass') {
        const bufferSize = this.audioContext.sampleRate * 2;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.audioContext.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        const filter = this.audioContext.createBiquadFilter();
        filter.type = filterType;
        filter.frequency.value = 1000;
        filter.Q.value = 1;

        const gain = this.audioContext.createGain();
        gain.gain.value = 0;

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        gain.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + 2);

        noise.start();

        return { sources: [noise], gain, filter };
    }

    createOscillatingNoise() {
        const nodes = this.createNoise('bandpass');
        const lfo = this.audioContext.createOscillator();
        const lfoGain = this.audioContext.createGain();

        lfo.type = 'sine';
        lfo.frequency.value = 0.3;
        lfoGain.gain.value = 300;

        lfo.connect(lfoGain);
        lfoGain.connect(nodes.filter.frequency);

        lfo.start();
        nodes.sources.push(lfo);

        return nodes;
    }

    createNature() {
        const nodes = this.createNoise('lowpass');
        nodes.filter.frequency.value = 3000;

        // Add random bird chirps
        const chirpInterval = setInterval(() => {
            if (!this.activeSounds.has('forest')) {
                clearInterval(chirpInterval);
                return;
            }
            if (Math.random() > 0.7) {
                this.playChirp();
            }
        }, 3000);

        return nodes;
    }

    playChirp() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = 'sine';
        const startFreq = 800 + Math.random() * 1200;
        const endFreq = startFreq + (Math.random() * 400 - 200);

        osc.frequency.setValueAtTime(startFreq, this.audioContext.currentTime);
        osc.frequency.linearRampToValueAtTime(endFreq, this.audioContext.currentTime + 0.1);

        gain.gain.setValueAtTime(0, this.audioContext.currentTime);
        gain.gain.linearRampToValueAtTime(0.05, this.audioContext.currentTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.audioContext.currentTime + 0.2);
    }

    createBinaural(baseFreq, beatFreq) {
        const leftOsc = this.audioContext.createOscillator();
        const rightOsc = this.audioContext.createOscillator();
        const merger = this.audioContext.createChannelMerger(2);
        const gain = this.audioContext.createGain();

        leftOsc.frequency.value = baseFreq;
        rightOsc.frequency.value = baseFreq + beatFreq;

        leftOsc.connect(merger, 0, 0);
        rightOsc.connect(merger, 0, 1);
        merger.connect(gain);
        gain.connect(this.masterGain);

        gain.gain.setValueAtTime(0, this.audioContext.currentTime);
        gain.gain.linearRampToValueAtTime(0.15, this.audioContext.currentTime + 3);

        leftOsc.start();
        rightOsc.start();

        return { sources: [leftOsc, rightOsc], gain };
    }

    createPad(frequencies) {
        const gain = this.audioContext.createGain();
        const sources = [];

        frequencies.forEach(freq => {
            const osc = this.audioContext.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = freq;
            osc.connect(gain);
            osc.start();
            sources.push(osc);
        });

        gain.connect(this.masterGain);
        gain.gain.setValueAtTime(0, this.audioContext.currentTime);
        gain.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 4);

        return { sources, gain };
    }

    createChimes() {
        const gain = this.audioContext.createGain();
        gain.gain.value = 0.2;
        gain.connect(this.masterGain);

        const chimeFreqs = [523.25, 659.25, 783.99, 1046.50];
        const sources = [];

        const playRandomChime = () => {
            const freq = chimeFreqs[Math.floor(Math.random() * chimeFreqs.length)];
            const osc = this.audioContext.createOscillator();
            const oscGain = this.audioContext.createGain();

            osc.type = 'sine';
            osc.frequency.value = freq;

            oscGain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            oscGain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 2);

            osc.connect(oscGain);
            oscGain.connect(gain);

            osc.start();
            osc.stop(this.audioContext.currentTime + 2);
        };

        const interval = setInterval(() => {
            if (!this.activeSounds.has('chimes')) {
                clearInterval(interval);
                return;
            }
            if (Math.random() > 0.5) {
                playRandomChime();
            }
        }, 2000);

        // Play initial chime
        playRandomChime();

        return { sources: [], gain };
    }

    updateUI(soundId, soundName) {
        const btn = document.querySelector(`[data-sound="${soundId}"]`);
        if (!btn) return;

        if (soundName) {
            btn.classList.remove('btn-secondary');
            btn.classList.add('btn-primary');
        } else {
            btn.classList.remove('btn-primary');
            btn.classList.add('btn-secondary');
        }
    }

    updateMixer() {
        if (this.activeSounds.size === 0) {
            this.mixerDiv.style.display = 'none';
            return;
        }

        this.mixerDiv.style.display = 'block';
        this.activeSoundsDiv.innerHTML = '';

        this.activeSounds.forEach((nodes, soundId) => {
            const definition = this.soundDefinitions[soundId];

            const soundControl = document.createElement('div');
            soundControl.className = 'flex-between gap-md';
            soundControl.style.padding = 'var(--space-md)';
            soundControl.style.background = 'var(--color-surface)';
            soundControl.style.borderRadius = 'var(--radius-md)';

            soundControl.innerHTML = `
        <span style="flex: 1;">${definition.name}</span>
        <input type="range" class="slider" style="flex: 2;" min="0" max="100" value="50" data-sound="${soundId}">
        <button class="btn-icon btn-ghost" data-stop="${soundId}">×</button>
      `;

            this.activeSoundsDiv.appendChild(soundControl);

            const slider = soundControl.querySelector('input[type="range"]');
            slider.addEventListener('input', (e) => {
                const volume = parseInt(e.target.value) / 100;
                nodes.gain.gain.setValueAtTime(volume * 0.3, this.audioContext.currentTime);
            });

            const stopBtn = soundControl.querySelector('button');
            stopBtn.addEventListener('click', () => this.stopSound(soundId));
        });
    }

    startVisualizer() {
        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            this.animationFrame = requestAnimationFrame(draw);

            this.analyser.getByteFrequencyData(dataArray);

            const gradient = this.visualizerCtx.createLinearGradient(0, 0, 0, this.visualizerCanvas.height);
            gradient.addColorStop(0, 'hsl(240, 60%, 65%)');
            gradient.addColorStop(1, 'hsl(280, 55%, 65%)');

            this.visualizerCtx.fillStyle = 'hsl(240, 20%, 98%)';
            this.visualizerCtx.fillRect(0, 0, this.visualizerCanvas.width, this.visualizerCanvas.height);

            const barWidth = (this.visualizerCanvas.width / bufferLength) * 2.5;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const barHeight = (dataArray[i] / 255) * this.visualizerCanvas.height;

                this.visualizerCtx.fillStyle = gradient;
                this.visualizerCtx.fillRect(
                    x,
                    this.visualizerCanvas.height - barHeight,
                    barWidth,
                    barHeight
                );

                x += barWidth + 1;
            }
        };

        draw();
    }

    stopAll() {
        this.activeSounds.forEach((_, soundId) => {
            this.stopSound(soundId);
        });
    }
}

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.soundPlayer = new SoundHealingPlayer();
    });
} else {
    window.soundPlayer = new SoundHealingPlayer();
}
