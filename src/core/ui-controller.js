// UI Controller - Connects all new modules to the interface
// Handles initialization, event listeners, and UI updates

class SacredSoundUI {
    constructor() {
        this.profile = null;
        this.initialized = false;
    }

    /**
     * Initialize the UI
     */
    async init() {
        console.log('🎨 Initializing Sacred Sound UI...');

        // Initialize all modules
        await this.initializeModules();

        // Set up event listeners
        this.setupEventListeners();

        // Load and display profile
        await this.loadProfile();

        // Inject new sections  
        this.injectSections();

        //Update UI with data
        this.updateAllUI();

        this.initialized = true;
        console.log('✅ UI initialized successfully');
    }

    /**
     * Initialize core modules
     */
    async initializeModules() {
        // Check if modules are loaded
        if (!window.storageManager) {
            console.error('❌ Storage manager not loaded');
            return;
        }

        await window.storageManager.init();
        await window.userProfile.init();
        await window.sessionAnalytics.init();

        console.log('✓ Core modules initialized');
    }

    /**
     * Load user profile
     */
    async loadProfile() {
        this.profile = await window.userProfile.getProfile();
        console.log('✓ Profile loaded:', this.profile);
    }

    /**
     * Inject new HTML sections dynamically
     */
    injectSections() {
        const homeSection = document.querySelector('#home');

        // Profile section after home
        if (!document.querySelector('#profile')) {
            const profileHTML = this.generateProfileSection();
            homeSection.insertAdjacentHTML('afterend', profileHTML);
        }

        // Advanced section  after breathwork
        const breathworkSection = document.querySelector('#breathwork');
        if (!document.querySelector('#advanced')) {
            const advancedHTML = this.generateAdvancedSection();
            breathworkSection.insertAdjacentHTML('afterend', advancedHTML);
        }

        // Chakra bowls in sound section
        this.enhanceSoundSection();

        console.log('✓ Sections injected');
    }

    /**
     * Generate profile section HTML
     */
    generateProfileSection() {
        const levelNames = ['', 'Beginner', 'Initiate', 'Practitioner', 'Adept', 'Master', 'Guru'];
        const level = this.profile?.level || 1;
        const xp = this.profile?.xp || 0;
        const totalSessions = this.profile?.stats?.totalSessions || 0;
        const totalMinutes = this.profile?.stats?.totalMinutes || 0;
        const currentStreak = this.profile?.stats?.currentStreak || 0;
        const longestStreak = this.profile?.stats?.longestStreak || 0;

        // Calculate XP progress to next level
        const xpLevels = [0, 100, 300, 700, 1500, 3000, 10000];
        const currentLevelXP = xpLevels[level - 1] || 0;
        const nextLevelXP = xpLevels[level] || 10000;
        const xpProgress = ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

        return `
    <section id="profile" class="section">
      <div class="container">
        <h2 class="text-center mb-xl">Your Wellness Journey</h2>
        
        <div style="max-width: 1000px; margin: 0 auto;">
          <div class="grid" style="gap: var(--space-xl);">
            
            <!-- Profile Card -->
            <div class="card card-glass">
              <div class="flex-between mb-lg">
                <div>
                  <h3>Welcome Back</h3>
                  <p class="text-muted" style="font-size: var(--font-size-sm);">
                    Level ${level} • ${levelNames[level]}
                  </p>
                </div>
                <div style="text-align: right;">
                  <div style="font-size: var(--font-size-2xl);">🔥</div>
                  <p class="text-muted" style="font-size: var(--font-size-sm); margin-top: var(--space-xs);">
                    ${currentStreak} day streak
                  </p>
                </div>
              </div>
              
              <!-- XP Progress -->
              <div class="mb-lg">
                <div class="flex-between mb-sm" style="font-size: var(--font-size-sm);">
                  <span class="text-muted">Experience</span>
                  <span>${xp} XP / ${nextLevelXP} XP</span>
                </div>
                <div style="background: var(--color-surface); border-radius: var(--radius-full); height: 8px; overflow: hidden;">
                  <div style="background: linear-gradient(90deg, var(--color-primary), var(--color-accent)); height: 100%; width: ${Math.min(xpProgress, 100)}%; transition: width 0.5s ease;"></div>
                </div>
              </div>
              
              <!-- Quick Stats -->
              <div class="grid grid-3" style="gap: var(--space-md);">
                <div style="text-align: center;">
                  <div style="font-size: var(--font-size-2xl); margin-bottom: var(--space-xs);">${totalSessions}</div>
                  <div class="text-muted" style="font-size: var(--font-size-sm);">Sessions</div>
                </div>
                <div style="text-align: center;">
                  <div style="font-size: var(--font-size-2xl); margin-bottom: var(--space-xs);">${totalMinutes}</div>
                  <div class="text-muted" style="font-size: var(--font-size-sm);">Minutes</div>
                </div>
                <div style="text-align: center;">
                  <div style="font-size: var(--font-size-2xl); margin-bottom: var(--space-xs);">${longestStreak}</div>
                  <div class="text-muted" style="font-size: var(--font-size-sm);">Best Streak</div>
                </div>
              </div>
            </div>
            
            <!-- Recommendations -->
            <div class="card">
              <h4 class="mb-lg">✨ Recommended for You</h4>
              <div id="recommendationsContainer"></div>
            </div>
            
            <!-- Recent Sessions -->
            <div class="card">
              <h4 class="mb-lg">📝 Recent Sessions</h4>
              <div id="recentSessions"></div>
            </div>
            
          </div>
        </div>
      </div>
    </section>
    `;
    }

    /**
     * Generate advanced breathwork section
     */
    generateAdvancedSection() {
        const wimHofBest = parseInt(localStorage.getItem('wimHofBest') || '0');

        return `
    <section id="advanced" class="section" style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%);">
      <div class="container">
        <h2 class="text-center mb-xl">Advanced Breathwork</h2>
        
        <div style="max-width: 1000px; margin: 0 auto;">
          <div class="grid" style="gap: var(--space-xl);">
            
            <!-- Wim Hof Method -->
            <div class="card card-gradient">
              <div class="flex-between mb-md">
                <div>
                  <h3>❄️ Wim Hof Method</h3>
                  <p style="opacity: 0.9;">3-round protocol with breath retention</p>
                </div>
                <div style="text-align: right; font-size: var(--font-size-sm);">
                  <div style="opacity: 0.8;">Your Best:</div>
                  <div style="font-size: var(--font-size-xl); font-weight: 600;">${wimHofBest}s</div>
                </div>
              </div>
              <button class="btn btn-primary btn-lg" onclick="window.uiController.startWimHof()" style="width: 100%;">
                Start Wim Hof Protocol
              </button>
            </div>
            
            <!-- Pranayama Collection -->
            <div class="card">
              <h3 class="mb-lg">🧘 Pranayama Collection</h3>
              <div class="grid grid-2" style="gap: var(--space-md);">
                
                <div class="card" style="background: var(--color-surface-elevated); cursor: pointer;" onclick="window.uiController.startPranayama('nadi-shodhana')">
                  <h4>Nadi Shodhana</h4>
                  <p style="font-size: var(--font-size-sm); opacity: 0.8; margin: var(--space-sm) 0;">
                    Alternate Nostril
                  </p>
                  <div style="font-size: var(--font-size-xs); opacity: 0.7;">
                    Balance • 10 min
                  </div>
                </div>
                
                <div class="card" style="background: var(--color-surface-elevated); cursor: pointer;" onclick="window.uiController.startPranayama('kapalabhati')">
                  <h4>Kapalabhati ⚠️</h4>
                  <p style="font-size: var(--font-size-sm); opacity: 0.8; margin: var(--space-sm) 0;">
                    Skull Shining
                  </p>
                  <div style="font-size: var(--font-size-xs); opacity: 0.7;">
                    Energizing • 3 rounds
                  </div>
                </div>
                
                <div class="card" style="background: var(--color-surface-elevated); cursor: pointer;" onclick="window.uiController.startPranayama('bhastrika')">
                  <h4>Bhastrika ⚠️</h4>
                  <p style="font-size: var(--font-size-sm); opacity: 0.8; margin: var(--space-sm) 0;">
                    Bellows Breath
                  </p>
                  <div style="font-size: var(--font-size-xs); opacity: 0.7;">
                    Advanced • Powerful
                  </div>
                </div>
                
                <div class="card" style="background: var(--color-surface-elevated); cursor: pointer;" onclick="window.uiController.startPranayama('ujjayi')">
                  <h4>Ujjayi</h4>
                  <p style="font-size: var(--font-size-sm); opacity: 0.8; margin: var(--space-sm) 0;">
                    Ocean Breath
                  </p>
                  <div style="font-size: var(--font-size-xs); opacity: 0.7;">
                    Calming • 10 min
                  </div>
                </div>
                
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </section>
    `;
    }

    /**
     * Enhance sound section with chakra bowls and mantras
     */
    enhanceSoundSection() {
        const soundGrid = document.querySelector('#sound .grid-2');
        if (!soundGrid) return;

        // Add Chakra Bowls card
        const chakraCard = `
      <div class="card">
        <h4>🎵 Chakra Bowls</h4>
        <p class="text-muted mb-lg" style="font-size: var(--font-size-sm);">
          Healing frequencies
        </p>
        <div class="flex-column gap-sm">
          <button class="btn btn-secondary btn-sm" onclick="window.uiController.playChakraBowl('root-chakra')">
            Root (396 Hz)
          </button>
          <button class="btn btn-secondary btn-sm" onclick="window.uiController.playChakraBowl('heart-chakra')">
            Heart (639 Hz)
          </button>
          <button class="btn btn-secondary btn-sm" onclick="window.uiController.showAllChakras()">
            View All 13 →
          </button>
        </div>
      </div>
    `;

        // Add Mantras card
        const mantraCard = `
      <div class="card">
        <h4>🕉️ Mantras</h4>
        <p class="text-muted mb-lg" style="font-size: var(--font-size-sm);">
          Sacred vocals
        </p>
        <div class="flex-column gap-sm">
          <button class="btn btn-secondary btn-sm" onclick="window.uiController.playMantra('om')">
            Om
          </button>
          <button class="btn btn-secondary btn-sm" onclick="window.uiController.playMantra('aum')">
            Aum
          </button>
        </div>
      </div>
    `;

        soundGrid.insertAdjacentHTML('beforeend', chakraCard + mantraCard);
    }

    /**
     * Update all UI elements with current data
     */
    async updateAllUI() {
        await this.loadRecommendations();
        await this.loadRecentSessions();
    }

    /**
     * Load and display recommendations
     */
    async loadRecommendations() {
        const container = document.getElementById('recommendationsContainer');
        if (!container) return;

        const recommendations = await window.userProfile.getRecommendations();

        if (recommendations.length === 0) {
            container.innerHTML = '<p class="text-muted" style="font-size: var(--font-size-sm);">Complete a session to get personalized recommendations</p>';
            return;
        }

        container.innerHTML = recommendations.map(rec => `
      <div class="flex-between" style="padding: var(--space-md); background: var(--color-surface-elevated); border-radius: var(--radius-md);">
        <div>
          <div style="font-weight: 500;">${this.getRecommendationTitle(rec)}</div>
          <div class="text-muted" style="font-size: var(--font-size-sm);">${rec.reason}</div>
        </div>
        <button class="btn btn-sm btn-primary" onclick="window.uiController.startRecommendation('${rec.type}', '${rec.pattern || rec.session}')">
          Start
        </button>
      </div>
    `).join('');
    }

    /**
     * Load and display recent sessions
     */
    async loadRecentSessions() {
        const container = document.getElementById('recentSessions');
        if (!container) return;

        const sessions = await window.sessionAnalytics.getAllSessions();
        const recent = sessions.slice(0, 5);

        if (recent.length === 0) {
            container.innerHTML = '<p class="text-muted text-center" style="padding: var(--space-lg);">No sessions yet. Start your journey!</p>';
            return;
        }

        container.innerHTML = recent.map(session => {
            const date = new Date(session.date);
            const moodChange = session.moodAfter && session.moodBefore ?
                (session.moodAfter - session.moodBefore > 0 ? '📈' : session.moodAfter - session.moodBefore < 0 ? '📉' : '➡️') : '';

            return `
        <div class="flex-between" style="padding: var(--space-sm); border-bottom: 1px solid var(--color-border);">
          <div>
            <div style="font-weight: 500; font-size: var(--font-size-sm);">${session.type} • ${session.pattern || session.guidedSession || ''}</div>
            <div class="text-muted" style="font-size: var(--font-size-xs);">${date.toLocaleDateString()} • ${session.duration || 0} min</div>
          </div>
          <div style="font-size: var(--font-size-lg);">${moodChange}</div>
        </div>
      `;
        }).join('');
    }

    /**
     * Get recommendation title
     */
    getRecommendationTitle(rec) {
        if (rec.type === 'breathwork') {
            return `${rec.pattern} Breathing`;
        } else if (rec.type === 'guided') {
            return `${rec.session} Session`;
        }
        return 'Practice';
    }

    /**
     * Start a recommended session
     */
    startRecommendation(type, id) {
        if (type === 'breathwork') {
            scrollToSection('breathwork');
            document.getElementById('breathPattern').value = id;
        } else if (type === 'guided') {
            startSession(id);
        }
    }

    /**
     * Start Wim Hof Method
     */
    async startWimHof() {
        if (!window.wimHofMethod) {
            alert('Wim Hof module not loaded');
            return;
        }

        // Show modal or navigate to dedicated UI
        alert('🎉 Starting Wim Hof Method!\n\nThis will guide you through 3 rounds of:\n- 30-40 rapid breaths\n- Breath retention (as long as you can)\n- Recovery breath (15s hold)\n\nReady to start?');

        await window.wimHofMethod.start();
    }

    /**
     * Start Pranayama technique
     */
    async startPranayama(techniqueId) {
        if (!window.pranayama) {
            alert('Pranayama module not loaded');
            return;
        }

        const technique = window.pranayama.techniques[techniqueId];

        if (technique.safety && technique.safety.includes('Avoid')) {
            const confirmed = confirm(`⚠️ Safety Notice:\n${technique.safety}\n\nDo you want to continue?`);
            if (!confirmed) return;
        }

        alert(`🧘 Starting ${technique.name}\n\n${technique.description}\n\nDuration: ${technique.duration || technique.reps + ' reps'} min`);

        await window.pranayama.start(techniqueId);
    }

    /**
     * Play a chakra bowl
     */
    playChakraBowl(bowlId) {
        if (!window.chakraBowls || !window.audioContext) {
            // Need to initialize audio context
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            window.audioContext = ctx;
        }

        const dest = window.audioContext.destination;
        window.chakraBowls.play(bowlId, 0.3, dest);

        // Show notification
        window.showNotification && window.showNotification(`Playing ${bowlId}`);
    }

    /**
     * Show all chakras modal
     */
    showAllChakras() {
        const bowls = window.chakraBowls.getAllBowls();
        const chakras = bowls.filter(b => b.id.includes('chakra'));

        alert('🌈 ' + chakras.map((b, i) => `${i + 1}. ${b.name} (${b.freq} Hz)`).join('\n'));
    }

    /**
     * Play mantra
     */
    playMantra(mantraId) {
        if (!window.mantraVocals) {
            alert('Mantra module not loaded');
            return;
        }

        const ctx = window.mantraVocals.initAudioContext();

        if (mantraId === 'om') {
            window.mantraVocals.createOm(0.4, ctx.destination);
        } else if (mantraId === 'aum') {
            window.mantraVocals.createAum(0.4, ctx.destination);
        }

        window.showNotification && window.showNotification(`Playing ${mantraId.toUpperCase()}`);
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Listen to Wim Hof events
        window.addEventListener('wimhof-update', (e) => {
            console.log('Wim Hof update:', e.detail);
            // Update UI based on event
        });

        // Listen to Pranayama events
        window.addEventListener('pranayama-update', (e) => {
            console.log('Pranayama update:', e.detail);
        });

        // Listen to level up
        window.addEventListener('level-up', async (e) => {
            await this.loadProfile();
            this.updateAllUI();
        });
    }
}

// Create global instance and initialize
window.uiController = new SacredSoundUI();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.uiController.init();
    });
} else {
    window.uiController.init();
}
