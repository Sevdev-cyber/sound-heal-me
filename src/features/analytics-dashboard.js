// Analytics Dashboard UI - Full analytics section with charts and reports
// Integrates with analytics-charts.js and backend API

class AnalyticsDashboard {
    constructor() {
        this.containerId = 'analytics-dashboard';
        this.initialized = false;
    }

    /**
     * Initialize and render analytics dashboard
     */
    async init(containerId = 'analytics-dashboard') {
        this.containerId = containerId;

        // Wait for dependencies
        if (!window.analyticsCharts) {
            console.error('AnalyticsCharts not loaded');
            return;
        }

        await window.analyticsCharts.init();
        await this.render();

        this.initialized = true;
    }

    /**
     * Render full analytics dashboard
     */
    async render() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        // Fetch data
        const sessions = await window.storageManager.getAll('sessions');
        const weeklyReport = await this.getWeeklyReport();

        container.innerHTML = `
      <div class="analytics-dashboard">
        <h2 style="font-size: 28px; margin-bottom: 24px; color: var(--text-primary);">
          📊 Your Analytics
        </h2>

        <!-- Summary Cards -->
        <div class="analytics-summary">
          <div class="stat-card">
            <div class="stat-icon">🔥</div>
            <div class="stat-value">${weeklyReport.sessions}</div>
            <div class="stat-label">Sessions This Week</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">⏱️</div>
            <div class="stat-value">${weeklyReport.totalMinutes}</div>
            <div class="stat-label">Minutes This Week</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">😊</div>
            <div class="stat-value">+${weeklyReport.avgMoodImprovement.toFixed(1)}</div>
            <div class="stat-label">Avg Mood Improvement</div>
          </div>
        </div>

        <!-- 30-Day Trend Chart -->
        <div class="chart-container">
          <h3>30-Day Session Trend</h3>
          <div class="chart-wrapper">
            <canvas id="sessionTrendChart"></canvas>
          </div>
        </div>

        <!-- Session Type Distribution -->
        <div class="chart-container">
          <h3>Session Type Distribution</h3>
          <div class="chart-wrapper">
            <canvas id="sessionTypeChart"></canvas>
          </div>
        </div>

        <!-- Mood Improvement Chart -->
        <div class="chart-container">
          <h3>Mood Improvement Trends</h3>
          <div class="chart-wrapper">
            <canvas id="moodChart"></canvas>
          </div>
        </div>

        <!-- Weekly Minutes Chart -->
        <div class="chart-container">
          <h3>Minutes by Week</h3>
          <div class="chart-wrapper">
            <canvas id="weeklyMinutesChart"></canvas>
          </div>
        </div>

        <!-- Export Section -->
        <div class="export-section">
          <h3>Export Your Data</h3>
          <div class="export-buttons">
            <button class="export-btn" onclick="window.analyticsDashboard.exportCSV()">
              📥 Download CSV
            </button>
            <button class="export-btn" onclick="window.analyticsDashboard.exportJSON()">
              💾 Download JSON
            </button>
          </div>
        </div>
      </div>

      <style>
        .analytics-dashboard {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .analytics-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }

        .stat-card {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(236, 72, 153, 0.1));
          border: 1px solid rgba(139, 92, 246, 0.2);
          border-radius: 16px;
          padding: 24px;
          text-align: center;
          transition: transform 0.2s;
        }

        .stat-card:hover {
          transform: translateY(-4px);
        }

        .stat-icon {
          font-size: 40px;
          margin-bottom: 12px;
        }

        .stat-value {
          font-size: 32px;
          font-weight: bold;
          color: var(--text-primary);
          margin-bottom: 8px;
        }

        .stat-label {
          font-size: 14px;
          color: var(--text-secondary);
        }

        .chart-container {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 24px;
        }

        .chart-container h3 {
          font-size: 18px;
          margin-bottom: 20px;
          color: var(--text-primary);
        }

        .chart-wrapper {
          position: relative;
          height: 300px;
        }

        .export-section {
          margin-top: 40px;
          padding: 24px;
          background: rgba(139, 92, 246, 0.05);
          border: 1px solid rgba(139, 92, 246, 0.2);
          border-radius: 16px;
        }

        .export-section h3 {
          font-size: 18px;
          margin-bottom: 16px;
          color: var(--text-primary);
        }

        .export-buttons {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .export-btn {
          padding: 12px 24px;
          background: linear-gradient(135deg, #8b5cf6, #ec4899);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .export-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(139, 92, 246, 0.3);
        }

        @media (max-width: 768px) {
          .analytics-summary {
            grid-template-columns: 1fr;
          }
          
          .chart-wrapper {
            height: 250px;
          }
        }
      </style>
    `;

        // Render charts
        await this.renderCharts(sessions);
    }

    /**
     * Render all charts
     */
    async renderCharts(sessions) {
        // Session trend chart
        await window.analyticsCharts.createSessionTrendChart('sessionTrendChart', sessions);

        // Session type distribution
        await window.analyticsCharts.createSessionTypeChart('sessionTypeChart', sessions);

        // Mood improvement chart
        await window.analyticsCharts.createMoodChart('moodChart', sessions);

        // Weekly minutes chart
        await window.analyticsCharts.createWeeklyMinutesChart('weeklyMinutesChart', sessions);
    }

    /**
     * Get weekly report (from API or calculate locally)
     */
    async getWeeklyReport() {
        try {
            if (window.apiClient && window.storageManager.backendAvailable) {
                return await window.apiClient.getWeeklyReport();
            }
        } catch (error) {
            console.warn('Failed to get weekly report from API, calculating locally:', error);
        }

        // Fallback: calculate locally
        const sessions = await window.storageManager.getAll('sessions');
        const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        const weekSessions = sessions.filter(s => s.date >= oneWeekAgo);

        const totalMinutes = weekSessions.reduce((sum, s) => sum + (s.duration || 0), 0);
        const sessionsWithMood = weekSessions.filter(s => s.moodBefore && s.moodAfter);
        const avgMoodImprovement = sessionsWithMood.length > 0
            ? sessionsWithMood.reduce((sum, s) => sum + (s.moodAfter - s.moodBefore), 0) / sessionsWithMood.length
            : 0;

        return {
            sessions: weekSessions.length,
            totalMinutes: totalMinutes,
            avgMoodImprovement: avgMoodImprovement
        };
    }

    /**
     * Export data to CSV
     */
    async exportCSV() {
        const sessions = await window.storageManager.getAll('sessions');

        // CSV header
        let csv = 'Date,Type,Pattern/Session,Duration (min),Mood Before,Mood After,Sounds\n';

        // CSV rows
        sessions.forEach(session => {
            const date = new Date(session.date).toLocaleDateString();
            const type = session.type || '';
            const pattern = session.pattern || session.guidedSession || '';
            const duration = Math.round((session.duration || 0) / 60);
            const moodBefore = session.moodBefore || '';
            const moodAfter = session.moodAfter || '';
            const sounds = (session.sounds || []).join('; ');

            csv += `${date},${type},${pattern},${duration},${moodBefore},${moodAfter},"${sounds}"\n`;
        });

        // Download
        this.downloadFile(csv, 'sacred-sound-data.csv', 'text/csv');
    }

    /**
     * Export data to JSON
     */
    async exportJSON() {
        const data = await window.storageManager.exportData();
        const json = JSON.stringify(data, null, 2);
        this.downloadFile(json, 'sacred-sound-data.json', 'application/json');
    }

    /**
     * Helper: download file
     */
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Refresh dashboard data
     */
    async refresh() {
        if (this.initialized) {
            await this.render();
        }
    }
}

// Create global instance
window.analyticsDashboard = new AnalyticsDashboard();

console.log('📊 Analytics Dashboard module loaded');
