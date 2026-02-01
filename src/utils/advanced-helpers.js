// Global helper functions for advanced breathwork

/**
 * Start Wim Hof Method with modal UI
 */
async function startWimHofMethod() {
    // Create modal if it doesn't exist
    if (!document.getElementById('wimHofModal')) {
        createWimHofModal();
    }

    const modal = document.getElementById('wimHofModal');
    const titleEl = modal.querySelector('.wim-hof-title');
    const roundEl = modal.querySelector('.wim-hof-round');
    const phaseEl = modal.querySelector('.wim-hof-phase');
    const counterEl = modal.querySelector('.wim-hof-counter');
    const instructionsEl = modal.querySelector('.wim-hof-instructions');
    const visualEl = modal.querySelector('.wim-hof-circle');
    const controlsEl = modal.querySelector('.wim-hof-controls');

    // Show modal
    modal.classList.add('active');

    // Check if module is loaded
    if (!window.wimHofMethod) {
        phaseEl.textContent = '⚠️ Loading...';
        instructionsEl.textContent = 'Wim Hof module is initializing. Please wait...';
        setTimeout(() => modal.classList.remove('active'), 3000);
        return;
    }

    // Setup event listeners for UI updates
    const updateHandler = (e) => {
        const data = e.detail;

        if (data.round) {
            roundEl.textContent = `Round ${data.round} of ${window.wimHofMethod.totalRounds}`;
        }

        if (data.phase === 'hyperventilation') {
            phaseEl.textContent = '🫁 Rapid Breathing';
            instructionsEl.textContent = data.instructions || 'Breathe in deeply, let go passively';
            if (data.breathCount !== undefined) {
                counterEl.textContent = `${data.breathCount}/${data.totalBreaths || 30}`;
            }
        } else if (data.phase === 'retention') {
            phaseEl.textContent = '⏱️ Hold Your Breath';
            instructionsEl.textContent = 'Relax. Stay calm. Click when you need to breathe.';
            counterEl.textContent = `${data.retentionTime || 0}s`;

            // Show completion button
            controlsEl.innerHTML = `
                <button class="btn btn-primary btn-lg" onclick="window.wimHofMethod.completeRetention()">
                    I Need to Breathe
                </button>
                <button class="btn btn-ghost" onclick="closeWimHofModal()">
                    Stop Protocol
                </button>
            `;
        } else if (data.phase === 'recovery') {
            phaseEl.textContent = '💨 Recovery Breath';
            instructionsEl.textContent = data.instructions || 'Big breath in and hold for 15 seconds';
            if (data.countdown) {
                counterEl.textContent = `${data.countdown}s`;
            } else {
                counterEl.textContent = '';
            }
            controlsEl.innerHTML = `
                <button class="btn btn-ghost" onclick="closeWimHofModal()">
                    Stop
                </button>
            `;
        } else if (data.phase === 'rest') {
            phaseEl.textContent = '🧘 Rest';
            instructionsEl.textContent = data.instructions || 'Take a moment to rest';
            counterEl.textContent = '';
        } else if (data.status === 'complete') {
            phaseEl.textContent = '🎉 Complete!';
            instructionsEl.textContent = 'Wim Hof Method completed successfully!';
            counterEl.textContent = '';

            const best = window.wimHofMethod.getBestRetentionTime();
            controlsEl.innerHTML = `
                <div style="text-align: center; margin-bottom: var(--space-lg);">
                    <div style="font-size: var(--font-size-sm); color: var(--color-text-muted);">Personal Best Retention:</div>
                    <div style="font-size: var(--font-size-3xl); font-weight: 700; color: var(--color-primary);">${best}s</div>
                </div>
                <button class="btn btn-primary" onclick="closeWimHofModal()">
                    Close
                </button>
            `;

            // Update main display
            updateWimHofBest();
        }

        if (data.message) {
            instructionsEl.textContent = data.message;
        }
    };

    const breathHandler = (e) => {
        const { phase } = e.detail;
        visualEl.className = 'wim-hof-circle ' + phase;
    };

    window.addEventListener('wimhof-update', updateHandler);
    window.addEventListener('wimhof-breath', breathHandler);

    // Set initial UI
    titleEl.textContent = '❄️ Wim Hof Method';
    roundEl.textContent = 'Preparing...';
    phaseEl.textContent = 'Get Ready';
    instructionsEl.textContent = 'Find a comfortable position. You will be guided through 3 rounds.';
    counterEl.textContent = '';
    controlsEl.innerHTML = `
        <button class="btn btn-ghost" onclick="closeWimHofModal()">Cancel</button>
    `;

    // Start after 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
        await window.wimHofMethod.start();
    } catch (error) {
        console.error('Wim Hof error:', error);
        phaseEl.textContent = '❌ Error';
        instructionsEl.textContent = 'Something went wrong. Check console for details.';
        controlsEl.innerHTML = `
            <button class="btn btn-primary" onclick="closeWimHofModal()">Close</button>
        `;
    }

    // Cleanup
    window.removeEventListener('wimhof-update', updateHandler);
    window.removeEventListener('wimhof-breath', breathHandler);
}

/**
 * Create Wim Hof modal HTML
 */
function createWimHofModal() {
    const modal = document.createElement('div');
    modal.id = 'wimHofModal';
    modal.className = 'wim-hof-modal';
    modal.innerHTML = `
        <div class="wim-hof-container">
            <h2 class="wim-hof-title">❄️ Wim Hof Method</h2>
            <div class="wim-hof-round">Preparing...</div>
            <div class="wim-hof-phase">Get Ready</div>
            <div class="wim-hof-visual">
                <div class="wim-hof-circle"></div>
            </div>
            <div class="wim-hof-counter"></div>
            <div class="wim-hof-instructions">Breathe in deeply, let go passively</div>
            <div class="wim-hof-controls">
                <button class="btn btn-ghost" onclick="closeWimHofModal()">Cancel</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

/**
 * Close Wim Hof modal
 */
function closeWimHofModal() {
    const modal = document.getElementById('wimHofModal');
    if (modal) {
        modal.classList.remove('active');
    }

    // Stop protocol if active
    if (window.wimHofMethod && window.wimHofMethod.isActive) {
        window.wimHofMethod.stop();
    }
}

/**
 * Start Pranayama technique
 */
async function startPranayamaMethod(techniqueId) {
    if (!window.pranayama) {
        alert('⚠️ Pranayama module is loading...\n\nPlease wait a moment and try again.');
        return;
    }

    const technique = window.pranayama.techniques[techniqueId];

    if (!technique) {
        alert('❌ Technique not found: ' + techniqueId);
        return;
    }

    // Safety check
    if (technique.safety && technique.safety.toLowerCase().includes('avoid')) {
        const confirmed = confirm(
            `⚠️ Safety Notice:\n${technique.safety}\n\nDo you want to continue?`
        );
        if (!confirmed) return;
    }

    // Show info
    alert(
        `🧘 Starting ${technique.name}\n\n` +
        `${technique.description}\n\n` +
        `Duration: ${technique.duration || technique.reps + ' reps'}`
    );

    try {
        await window.pranayama.start(techniqueId);
    } catch (error) {
        console.error('Pranayama error:', error);
        alert('❌ Error starting pranayama. Check console for details.');
    }
}

/**
 * Update Wim Hof best time display
 */
function updateWimHofBest() {
    const best = parseInt(localStorage.getItem('wimHofBest') || '0');
    const display = document.getElementById('wimHofBest');
    if (display) {
        display.textContent = best;
    }
}

// Update best time on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateWimHofBest);
} else {
    updateWimHofBest();
}

// Listen for updates
window.addEventListener('wimhof-update', (e) => {
    if (e.detail && e.detail.best) {
        updateWimHofBest();
    }
});

console.log('🧘 Advanced breathwork helpers loaded');
