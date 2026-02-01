/**
 * Basic Breathwork Component
 * Handles fundamental breathing patterns (Box, 4-7-8, Coherent, Energize)
 * Migrated from root breathwork.js to modular structure
 */

export class BasicBreathwork {
    constructor() {
        this.isActive = false;
        this.isPaused = false;
        this.currentPattern = 'box';
        this.duration = 5; // minutes
        this.breathCount = 0;
        this.elapsed = 0;
        this.timerId = null;
        this.audioContext = null;

        // Pattern definitions
        this.patterns = {
            box: { name: 'Box Breathing', timings: [4, 4, 4, 4], labels: ['Inhale', 'Hold', 'Exhale', 'Hold'] },
            '478': { name: '4-7-8 Relaxation', timings: [4, 7, 8, 0], labels: ['Inhale', 'Hold', 'Exhale', 'Rest'] },
            coherent: { name: 'Coherent Breathing', timings: [5, 0, 5, 0], labels: ['Inhale', 'Rest', 'Exhale', 'Rest'] },
            energize: { name: 'Energizing Breath', timings: [2, 1, 4, 1], labels: ['Inhale', 'Hold', 'Exhale', 'Hold'] }
        };

        // Will be set by init()
        this.elements = null;
    }

    /**
     * Initialize - must be called after DOM is ready
     */
    init() {
        this.elements = {
            circle: document.getElementById('breathCircle'),
            text: document.getElementById('breathText'),
            pattern: document.getElementById('breathPattern'),
            durationSlider: document.getElementById('breathDuration'),
            durationLabel: document.getElementById('durationLabel'),
            progress: document.getElementById('breathProgress'),
            breathCount: document.getElementById('breathCount'),
            timeRemaining: document.getElementById('timeRemaining'),
            startBtn: document.getElementById('breathStart'),
            pauseBtn: document.getElementById('breathPause'),
            stopBtn: document.getElementById('breathStop')
        };

        // Event listeners
        if (this.elements.pattern) {
            this.elements.pattern.addEventListener('change', (e) => {
                this.currentPattern = e.target.value;
            });
        }

        if (this.elements.durationSlider) {
            this.elements.durationSlider.addEventListener('input', (e) => {
                this.duration = parseInt(e.target.value);
                if (this.elements.durationLabel) {
                    this.elements.durationLabel.textContent = this.duration;
                }
            });
        }

        if (this.elements.startBtn) {
            this.elements.startBtn.addEventListener('click', () => this.start());
        }

        if (this.elements.pauseBtn) {
            this.elements.pauseBtn.addEventListener('click', () => this.pause());
        }

        if (this.elements.stopBtn) {
            this.elements.stopBtn.addEventListener('click', () => this.stop());
        }

        console.log('✅ BasicBreathwork initialized');
    }

    /**
     * Start breathing session
     */
    async start() {
        if (this.isActive && !this.isPaused) return;

        if (this.isPaused) {
            this.isPaused = false;
            this.updateUI();
            this.resumeSession();
            return;
        }

        this.isActive = true;
        this.isPaused = false;
        this.breathCount = 0;
        this.elapsed = 0;

        // Init audio
        this.initAudio();

        // Update UI
        this.updateUI();

        // Start session
        await this.runSession();
    }

    /**
     * Pause session
     */
    pause() {
        this.isPaused = !this.isPaused;
        if (this.isPaused) {
            clearTimeout(this.timerId);
        } else {
            this.resumeSession();
        }
        this.updateUI();
    }

    /**
     * Stop session
     */
    stop() {
        this.isActive = false;
        this.isPaused = false;
        clearTimeout(this.timerId);
        this.breathCount = 0;
        this.elapsed = 0;
        this.updateUI();
        this.resetVisual();

        // Save session
        if (window.sessionAnalytics) {
            window.sessionAnalytics.saveSession({
                type: 'breathwork',
                pattern: this.currentPattern,
                duration: Math.floor(this.elapsed / 60),
                completed: this.elapsed >= this.duration * 60,
                notes: `${this.breathCount} breaths completed`
            });
        }
    }

    /**
     * Run breathing session
     */
    async runSession() {
        const pattern = this.patterns[this.currentPattern];
        const totalSeconds = this.duration * 60;

        while (this.isActive && this.elapsed < totalSeconds) {
            if (this.isPaused) {
                await this.wait(100);
                continue;
            }

            await this.breathCycle(pattern);
            this.breathCount++;
            this.updateProgress();
        }

        if (this.isActive) {
            this.complete();
        }
    }

    /**
     * Single breath cycle
     */
    async breathCycle(pattern) {
        for (let i = 0; i < pattern.timings.length; i++) {
            if (!this.isActive || this.isPaused) break;

            const seconds = pattern.timings[i];
            const label = pattern.labels[i];

            if (seconds === 0) continue;

            // Update visual
            this.updateVisual(label);

            // Play sound
            if (label === 'Inhale') {
                this.playChime();
            }

            // Wait for duration
            await this.wait(seconds * 1000);
            this.elapsed += seconds;
        }
    }

    /**
     * Resume paused session
     */
    resumeSession() {
        this.runSession();
    }

    /**
     * Complete session
     */
    complete() {
        this.isActive = false;
        this.updateVisual('Complete!');

        // Save session
        if (window.sessionAnalytics) {
            window.sessionAnalytics.saveSession({
                type: 'breathwork',
                pattern: this.currentPattern,
                duration: this.duration,
                completed: true,
                notes: `${this.breathCount} breaths completed`
            });
        }

        // Reset after 2 seconds
        setTimeout(() => this.resetVisual(), 2000);
    }

    /**
     * Update visual circle and text
     */
    updateVisual(phase) {
        if (!this.elements.circle || !this.elements.text) return;

        const text = this.elements.text.querySelector('div');
        if (text) {
            text.textContent = phase;
        }

        // Animate circle
        if (phase === 'Inhale') {
            this.elements.circle.setAttribute('r', '120');
            this.elements.circle.setAttribute('opacity', '1');
        } else if (phase === 'Exhale') {
            this.elements.circle.setAttribute('r', '80');
            this.elements.circle.setAttribute('opacity', '0.7');
        }
    }

    /**
     * Reset visual to initial state
     */
    resetVisual() {
        if (!this.elements.circle || !this.elements.text) return;

        this.elements.circle.setAttribute('r', '80');
        this.elements.circle.setAttribute('opacity', '0.7');

        const text = this.elements.text.querySelector('div');
        if (text) {
            text.textContent = 'Ready';
        }
    }

    /**
     * Update progress display
     */
    updateProgress() {
        if (!this.elements.breathCount || !this.elements.timeRemaining) return;

        this.elements.breathCount.textContent = this.breathCount;

        const remaining = this.duration * 60 - this.elapsed;
        const minutes = Math.floor(remaining / 60);
        const seconds = remaining % 60;
        this.elements.timeRemaining.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    /**
     * Update UI state (buttons, visibility)
     */
    updateUI() {
        if (!this.elements) return;

        const { startBtn, pauseBtn, stopBtn, progress } = this.elements;

        if (this.isActive) {
            startBtn?.classList.add('hidden');
            pauseBtn?.classList.remove('hidden');
            stopBtn?.classList.remove('hidden');
            progress?.style.setProperty('display', 'block');

            if (this.isPaused) {
                pauseBtn.textContent = 'Resume';
            } else {
                pauseBtn.textContent = 'Pause';
            }
        } else {
            startBtn?.classList.remove('hidden');
            pauseBtn?.classList.add('hidden');
            stopBtn?.classList.add('hidden');
            progress?.style.setProperty('display', 'none');
        }
    }

    /**
     * Initialize audio context
     */
    initAudio() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    /**
     * Play breath chime
     */
    playChime() {
        if (!this.audioContext) return;

        const ctx = this.audioContext;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.frequency.value = 440;
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.2);
    }

    /**
     * Wait helper
     */
    wait(ms) {
        return new Promise(resolve => {
            this.timerId = setTimeout(resolve, ms);
        });
    }
}

// Export singleton instance for global access (backward compatibility)
export const basicBreathwork = new BasicBreathwork();

// Also expose globally for HTML onclick handlers
window.basicBreathwork = basicBreathwork;

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => basicBreathwork.init());
} else {
    basicBreathwork.init();
}
