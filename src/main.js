/**
 * Sacred Sound - Main Application Entry Point
 * Vite build system entry
 */

import '../index.css';
import '../wim-hof-modal.css';

// Core modules
import './core/storage-manager.js';
import './core/user-profile.js';
import './core/analytics.js';
import './core/api-client.js';

// Features
import './features/analytics-charts.js';
import './features/analytics-dashboard.js';
import './features/achievements.js';

// Utilities
import './utils/calendar-export.js';
import './utils/share-generator.js';
import './utils/data-export.js';
import './utils/advanced-helpers.js';

// UI Controller (must load after other modules)
import './core/ui-controller.js';

// Feature modules (breathwork, sound)
import './features/breathwork/wim-hof.js';
import './features/breathwork/pranayama.js';
import './features/sound/chakra-bowls.js';
import './features/sound/mantras.js';

// Breathwork components
import './components/breathwork/BasicBreathwork.js';

// Sound components
import './components/sound/SoundPlayer.js';

// Session components
import './components/sessions/SessionManager.js';

console.log('🎨 Sacred Sound loaded via Vite');
console.log('Environment:', import.meta.env.MODE);
console.log('API URL:', import.meta.env.VITE_API_URL || 'Using default');

// Hot Module Replacement (HMR) for development
if (import.meta.hot) {
    import.meta.hot.accept(() => {
        console.log('🔄 HMR Update received');
    });
}
