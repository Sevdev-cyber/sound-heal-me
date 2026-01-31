// ============================================
// GUIDED SESSIONS
// Orchestrates breathwork + sound healing
// ============================================

const guidedSessions = {
    morning: {
        name: 'Morning Energizer',
        duration: 600, // 10 minutes
        steps: [
            { type: 'instruction', text: 'Welcome to your morning energizer. Find a comfortable seated position.', duration: 5 },
            { type: 'sound', sounds: ['ethereal'], duration: 10 },
            { type: 'breathwork', pattern: 'energize', duration: 180 },
            { type: 'instruction', text: 'Continue breathing naturally. Notice the energy flowing through your body.', duration: 10 },
            { type: 'sound', sounds: ['crystal-bowl', 'chimes'], duration: 120 },
            { type: 'breathwork', pattern: 'coherent', duration: 180 },
            { type: 'instruction', text: 'Take a moment to set an intention for your day.', duration: 10 },
            { type: 'sound', sounds: ['tibetan-bowl'], duration: 85 }
        ]
    },

    stress: {
        name: 'Stress Relief',
        duration: 900, // 15 minutes
        steps: [
            { type: 'instruction', text: 'Welcome. Let go of any tension. Find a comfortable position.', duration: 5 },
            { type: 'sound', sounds: ['rain'], duration: 30 },
            { type: 'instruction', text: "Let's begin with calming breath to activate your relaxation response.", duration: 5 },
            { type: 'breathwork', pattern: '478', duration: 240 },
            { type: 'sound', sounds: ['ocean', 'tibetan-bowl'], duration: 180 },
            { type: 'breathwork', pattern: 'coherent', duration: 240 },
            { type: 'instruction', text: 'Notice how your body feels more relaxed. Allow any remaining tension to melt away.', duration: 10 },
            { type: 'sound', sounds: ['forest', 'crystal-bowl'], duration: 180 },
            { type: 'instruction', text: 'Take three deep breaths and gently return to the present moment.', duration: 10 }
        ]
    },

    deep: {
        name: 'Deep Relaxation',
        duration: 1200, // 20 minutes
        steps: [
            { type: 'instruction', text: 'Welcome to deep relaxation. Lie down comfortably and close your eyes.', duration: 10 },
            { type: 'sound', sounds: ['ethereal'], duration: 60 },
            { type: 'breathwork', pattern: 'coherent', duration: 300 },
            { type: 'sound', sounds: ['tibetan-bowl', 'alpha'], duration: 240 },
            { type: 'breathwork', pattern: '478', duration: 240 },
            { type: 'sound', sounds: ['ocean', 'crystal-bowl'], duration: 300 },
            { type: 'instruction', text: 'Rest in this peaceful state. There is nowhere to go, nothing to do.', duration: 10 },
            { type: 'sound', sounds: ['rain'], duration: 40 }
        ]
    },

    sleep: {
        name: 'Sleep Preparation',
        duration: 1800, // 30 minutes
        steps: [
            { type: 'instruction', text: 'Welcome. Prepare for deep, restorative sleep. Get comfortable in bed.', duration: 10 },
            { type: 'sound', sounds: ['rain'], duration: 120 },
            { type: 'breathwork', pattern: '478', duration: 360 },
            { type: 'sound', sounds: ['ocean', 'theta'], duration: 480 },
            { type: 'breathwork', pattern: 'coherent', duration: 240 },
            { type: 'sound', sounds: ['rain', 'alpha'], duration: 580 },
            { type: 'instruction', text: 'Allow yourself to drift into peaceful sleep. Good night.', duration: 10 }
        ]
    }
};

class SessionManager {
    constructor() {
        this.currentSession = null;
        this.currentStepIndex = 0;
        this.isActive = false;
        this.stepTimer = null;
    }

    start(sessionId) {
        const session = guidedSessions[sessionId];
        if (!session) return;

        this.currentSession = session;
        this.currentStepIndex = 0;
        this.isActive = true;

        this.showSessionModal(session.name);
        this.runStep();
    }

    showSessionModal(sessionName) {
        // Create modal overlay
        const modal = document.createElement('div');
        modal.id = 'sessionModal';
        modal.className = 'overlay';
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';

        modal.innerHTML = `
      <div class="card" style="max-width: 600px; width: 90%;">
        <div class="flex-between mb-lg">
          <h3>${sessionName}</h3>
          <button class="btn-icon btn-ghost" onclick="sessionManager.stop()">×</button>
        </div>
        
        <div id="sessionInstruction" class="text-center mb-xl" style="font-size: var(--font-size-lg); min-height: 60px;">
          Starting session...
        </div>
        
        <div class="flex-column gap-md">
          <div class="flex-between text-muted" style="font-size: var(--font-size-sm);">
            <span>Progress</span>
            <span id="sessionProgress">Step 1 of ${this.currentSession.steps.length}</span>
          </div>
          <div style="height: 4px; background: var(--color-surface); border-radius: var(--radius-full); overflow: hidden;">
            <div id="sessionProgressBar" style="height: 100%; width: 0%; background: var(--gradient-primary); transition: width 0.5s ease;"></div>
          </div>
        </div>
        
        <div class="mt-lg flex gap-md">
          <button class="btn btn-ghost" style="flex: 1;" onclick="sessionManager.stop()">
            End Session
          </button>
        </div>
      </div>
    `;

        document.body.appendChild(modal);
    }

    runStep() {
        if (!this.isActive || this.currentStepIndex >= this.currentSession.steps.length) {
            this.complete();
            return;
        }

        const step = this.currentSession.steps[this.currentStepIndex];
        this.updateProgress();

        switch (step.type) {
            case 'instruction':
                this.showInstruction(step.text);
                break;
            case 'breathwork':
                this.startBreathwork(step.pattern, step.duration);
                break;
            case 'sound':
                this.playSounds(step.sounds);
                break;
        }

        this.stepTimer = setTimeout(() => {
            this.nextStep();
        }, step.duration * 1000);
    }

    showInstruction(text) {
        const instructionEl = document.getElementById('sessionInstruction');
        if (instructionEl) {
            instructionEl.textContent = text;
            instructionEl.style.animation = 'none';
            setTimeout(() => {
                instructionEl.style.animation = 'fadeIn 1s ease';
            }, 10);
        }
    }

    startBreathwork(pattern, duration) {
        this.showInstruction('Follow the breathing guide below');

        // Temporarily take over breathwork engine
        if (window.breathworkEngine) {
            const patternSelect = document.getElementById('breathPattern');
            const durationSlider = document.getElementById('breathDuration');

            patternSelect.value = pattern;
            patternSelect.dispatchEvent(new Event('change'));

            durationSlider.value = Math.ceil(duration / 60);
            durationSlider.dispatchEvent(new Event('input'));

            window.breathworkEngine.start();
        }
    }

    playSounds(sounds) {
        this.showInstruction('Immerse yourself in the healing sounds');

        if (window.soundPlayer) {
            sounds.forEach(soundId => {
                if (!window.soundPlayer.activeSounds.has(soundId)) {
                    window.soundPlayer.playSound(soundId);
                }
            });
        }
    }

    nextStep() {
        // Stop current sounds
        if (window.soundPlayer) {
            window.soundPlayer.stopAll();
        }

        // Stop breathwork if active
        if (window.breathworkEngine && window.breathworkEngine.isActive) {
            window.breathworkEngine.stop();
        }

        this.currentStepIndex++;
        this.runStep();
    }

    updateProgress() {
        const progressText = document.getElementById('sessionProgress');
        const progressBar = document.getElementById('sessionProgressBar');

        if (progressText) {
            progressText.textContent = `Step ${this.currentStepIndex + 1} of ${this.currentSession.steps.length}`;
        }

        if (progressBar) {
            const percent = ((this.currentStepIndex + 1) / this.currentSession.steps.length) * 100;
            progressBar.style.width = `${percent}%`;
        }
    }

    complete() {
        const instructionEl = document.getElementById('sessionInstruction');
        if (instructionEl) {
            instructionEl.textContent = `✨ ${this.currentSession.name} Complete! ✨`;
        }

        setTimeout(() => {
            this.stop();
        }, 3000);
    }

    stop() {
        this.isActive = false;
        clearTimeout(this.stepTimer);

        // Stop all active sounds
        if (window.soundPlayer) {
            window.soundPlayer.stopAll();
        }

        // Stop breathwork
        if (window.breathworkEngine && window.breathworkEngine.isActive) {
            window.breathworkEngine.stop();
        }

        // Remove modal
        const modal = document.getElementById('sessionModal');
        if (modal) {
            modal.remove();
        }
    }
}

// Initialize
window.sessionManager = new SessionManager();

// Global function for session cards
window.startSession = function (sessionId) {
    window.sessionManager.start(sessionId);
};
