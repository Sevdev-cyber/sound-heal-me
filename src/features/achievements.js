// Achievements UI - Display and unlock system
// Gamification features with achievement cards and progress

class AchievementsUI {
    constructor() {
        this.containerId = 'achievements-container';
        this.achievements = [];
        this.initialized = false;
    }

    /**
     * Initialize achievements UI
     */
    async init(containerId = 'achievements-container') {
        this.containerId = containerId;
        await this.loadAchievements();
        await this.render();
        this.initialized = true;
    }

    /**
     * Load achievements from API or define locally
     */
    async loadAchievements() {
        try {
            if (window.apiClient && window.storageManager.backendAvailable) {
                const response = await window.apiClient.getAchievements();
                this.achievements = response.achievements;
            } else {
                //Fallback: Show achievement definitions even offline
                this.achievements = this.getAllAchievements().map(a => ({
                    ...a,
                    unlocked: false
                }));
            }
        } catch (error) {
            console.warn('Failed to load achievements:', error);
            this.achievements = this.getAllAchievements().map(a => ({
                ...a,
                unlocked: false
            }));
        }
    }

    /**
     * Get all achievement definitions
     */
    getAllAchievements() {
        return [
            // Beginner
            { id: 'first_session', name: 'First Steps', icon: '🌱', requirement: 1, type: 'sessions', description: 'Complete your first practice session' },
            { id: 'early_bird', name: 'Early Bird', icon: '🌅', requirement: 'special', type: 'time', description: 'Practice before 7 AM' },
            { id: 'night_owl', name: 'Night Owl', icon: '🦉', requirement: 'special', type: 'time', description: 'Practice after 10 PM' },

            // Intermediate
            { id: '10_sessions', name: 'Dedicated Beginner', icon: '💪', requirement: 10, type: 'sessions', description: 'Complete 10 practice sessions' },
            { id: '50_sessions', name: 'Practitioner', icon: '🧘', requirement: 50, type: 'sessions', description: 'Complete 50 practice sessions' },
            { id: 'week_streak', name: 'Week Warrior', icon: '🔥', requirement: 7, type: 'streak', description: 'Maintain a 7-day practice streak' },
            { id: 'month_streak', name: 'Dedicated', icon: '💫', requirement: 30, type: 'streak', description: 'Maintain a 30-day practice streak' },

            // Advanced
            { id: '100_sessions', name: 'Master', icon: '🎓', requirement: 100, type: 'sessions', description: 'Complete 100 practice sessions' },
            { id: '500_sessions', name: 'Guru', icon: '🕉️', requirement: 500, type: 'sessions', description: 'Complete 500 practice sessions' },
            { id: 'year_streak', name: 'Enlightened', icon: '✨', requirement: 365, type: 'streak', description: 'Maintain a 365-day practice streak' },

            // Special
            { id: 'wim_hof_complete', name: 'Ice Man', icon: '❄️', requirement: 'special', type: 'breathwork', description: 'Complete full Wim Hof Method session' },
            { id: 'chakra_master', name: 'Chakra Master', icon: '🎵', requirement: 'special', type: 'sound', description: 'Use all 7 chakra frequencies' },
            { id: 'mood_improver', name: 'Mood Improver', icon: '😊', requirement: 'special', type: 'mood', description: 'Improve mood by 5+ points in 10 sessions' },
            { id: 'variety_seeker', name: 'Variety Seeker', icon: '🎨', requirement: 'special', type: 'variety', description: 'Try all three practice types' },
            { id: 'consistent', name: 'Consistent', icon: '📅', requirement: 'special', type: 'consistency', description: 'Practice 5 days a week for a month' }
        ];
    }

    /**
     * Render achievements grid
     */
    async render() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        const unlocked = this.achievements.filter(a => a.unlocked).length;
        const total = this.achievements.length;

        container.innerHTML = `
      <div class="achievements-section">
        <div class="achievements-header">
          <h2>🏆 Achievements</h2>
          <div class="achievement-progress">
            <span>${unlocked}/${total} unlocked</span>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${(unlocked / total) * 100}%"></div>
            </div>
          </div>
        </div>

        <div class="achievements-grid">
          ${this.achievements.map(achievement => this.renderAchievementCard(achievement)).join('')}
        </div>

        <button class="check-achievements-btn" onclick="window.achievementsUI.checkAchievements()">
          🔍 Check for New Achievements
        </button>
      </div>

      <style>
        .achievements-section {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .achievements-header {
          margin-bottom: 32px;
        }

        .achievements-header h2 {
          font-size: 32px;
          margin-bottom: 16px;
          color: var(--text-primary);
        }

        .achievement-progress {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .achievement-progress span {
          font-size: 16px;
          color: var(--text-secondary);
          min-width: 100px;
        }

        .progress-bar {
          flex: 1;
          height: 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #8b5cf6, #ec4899);
          transition: width 1s ease;
        }

        .achievements-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }

        .achievement-card {
          background: rgba(255, 255, 255, 0.03);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 24px;
          transition: all 0.3s;
          position: relative;
          overflow: hidden;
        }

        .achievement-card.unlocked {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(236, 72, 153, 0.1));
          border-color: rgba(139, 92, 246, 0.5);
        }

        .achievement-card.locked {
          opacity: 0.5;
        }

        .achievement-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(139, 92, 246, 0.2);
        }

        .achievement-icon {
          font-size: 48px;
          text-align: center;
          margin-bottom: 12px;
          filter: grayscale(0);
        }

        .achievement-card.locked .achievement-icon {
          filter: grayscale(1);
          opacity: 0.6;
        }

        .achievement-name {
          font-size: 18px;
          font-weight: bold;
          color: var(--text-primary);
          text-align: center;
          margin-bottom: 8px;
        }

        .achievement-description {
          font-size: 14px;
          color: var(--text-secondary);
          text-align: center;
          margin-bottom: 12px;
        }

        .achievement-requirement {
          text-align: center;
          font-size: 12px;
          color: var(--text-secondary);
          padding: 8px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
        }

        .achievement-unlocked-date {
          text-align: center;
          font-size: 12px;
          color: #10b981;
          margin-top: 8px;
        }

        .check-achievements-btn {
          display: block;
          margin: 0 auto;
          padding: 16px 32px;
          background: linear-gradient(135deg, #8b5cf6, #ec4899);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .check-achievements-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(139, 92, 246, 0.4);
        }

        @keyframes unlock {
          0% { transform: scale(0.8); opacity: 0; }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }

        .achievement-card.just-unlocked {
          animation: unlock 0.6s ease;
        }

        @media (max-width: 768px) {
          .achievements-grid {
            grid-template-columns: 1fr;
          }
        }
      </style>
    `;
    }

    /**
     * Render single achievement card
     */
    renderAchievementCard(achievement) {
        const locked = !achievement.unlocked;
        const requirementText = this.getRequirementText(achievement);

        return `
      <div class="achievement-card ${locked ? 'locked' : 'unlocked'}">
        <div class="achievement-icon">${achievement.icon}</div>
        <div class="achievement-name">${achievement.name}</div>
        <div class="achievement-description">${achievement.description}</div>
        <div class="achievement-requirement">
          ${locked ? `🔒 ${requirementText}` : '✅ Unlocked'}
        </div>
        ${!locked && achievement.unlockedAt ? `
          <div class="achievement-unlocked-date">
            ${new Date(achievement.unlockedAt).toLocaleDateString()}
          </div>
        ` : ''}
      </div>
    `;
    }

    /**
     * Get requirement text for achievement
     */
    getRequirementText(achievement) {
        const req = achievement.requirement;

        switch (achievement.type) {
            case 'sessions':
                return `Complete ${req} sessions`;
            case 'streak':
                return `${req}-day streak`;
            case 'time':
                return 'Special condition';
            case 'breathwork':
            case 'sound':
            case 'mood':
            case 'variety':
            case 'consistency':
                return 'Special achievement';
            default:
                return 'Unknown';
        }
    }

    /**
     * Check for new achievements
     */
    async checkAchievements() {
        try {
            if (!window.apiClient || !window.storageManager.backendAvailable) {
                this.showNotification('⚠️ Backend unavailable. Achievements require online connection.');
                return;
            }

            this.showNotification('🔍 Checking achievements...');

            const response = await window.apiClient.checkAchievements();

            if (response.newlyUnlocked > 0) {
                // Show unlock notifications
                response.achievements.forEach(achievement => {
                    this.showUnlockNotification(achievement);
                });

                // Refresh UI
                await this.loadAchievements();
                await this.render();
            } else {
                this.showNotification('✅ No new achievements unlocked');
            }
        } catch (error) {
            console.error('Check achievements error:', error);
            this.showNotification('❌ Failed to check achievements');
        }
    }

    /**
     * Show achievement unlock notification
     */
    showUnlockNotification(achievement) {
        const notification = document.createElement('div');
        notification.className = 'achievement-unlock-toast';
        notification.innerHTML = `
      <div class="unlock-icon">${achievement.icon}</div>
      <div>
        <div class="unlock-title">🎉 Achievement Unlocked!</div>
        <div class="unlock-name">${achievement.name}</div>
        <div class="unlock-xp">+${achievement.xpBonus} XP</div>
      </div>
    `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => notification.classList.add('show'), 10);

        // Remove after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    /**
     * Show simple notification
     */
    showNotification(message) {
        if (window.showNotification) {
            window.showNotification(message);
        } else {
            alert(message);
        }
    }

    /**
     * Refresh achievements
     */
    async refresh() {
        await this.loadAchievements();
        await this.render();
    }
}

// Create global instance
window.achievementsUI = new AchievementsUI();

// Add global CSS for unlock toast
const style = document.createElement('style');
style.textContent = `
  .achievement-unlock-toast {
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #8b5cf6, #ec4899);
    color: white;
    padding: 20px 24px;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(139, 92, 246, 0.4);
    display: flex;
    align-items: center;
    gap: 16px;
    transform: translateX(400px);
    opacity: 0;
    transition: all 0.3s ease;
    z-index: 10000;
    max-width: 320px;
  }

  .achievement-unlock-toast.show {
    transform: translateX(0);
    opacity: 1;
  }

  .unlock-icon {
    font-size: 48px;
  }

  .unlock-title {
    font-size: 12px;
    opacity: 0.9;
    margin-bottom: 4px;
  }

  .unlock-name {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 4px;
  }

  .unlock-xp {
    font-size: 14px;
    opacity: 0.9;
  }

  @media (max-width: 768px) {
    .achievement-unlock-toast {
      right: 10px;
      left: 10px;
      max-width: none;
    }
  }
`;
document.head.appendChild(style);

console.log('🏆 Achievements UI module loaded');
