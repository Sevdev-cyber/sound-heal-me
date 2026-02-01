// Global helper functions for advanced breathwork

/**
 * Start Wim Hof Method
 */
async function startWimHofMethod() {
    if (!window.wimHofMethod) {
        alert('⚠️ Wim Hof module is loading...\n\nPlease wait a moment and try again.');
        return;
    }

    const confirmed = confirm(
        '🎉 Starting Wim Hof Method!\n\n' +
        'This will guide you through 3 rounds of:\n' +
        '- 30-40 rapid breaths\n' +
        '- Breath retention (as long as you can)\n' +
        '- Recovery breath (15s hold)\n\n' +
        'Ready to start?'
    );

    if (!confirmed) return;

    try {
        await window.wimHofMethod.start();
    } catch (error) {
        console.error('Wim Hof error:', error);
        alert('❌ Error starting Wim Hof Method. Check console for details.');
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
