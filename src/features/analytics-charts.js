// Analytics Charts - Visualization Components
// Uses Chart.js for beautiful, interactive charts

class AnalyticsCharts {
    constructor() {
        this.charts = {};
        this.chartColors = {
            primary: '#8b5cf6',
            secondary: '#ec4899',
            success: '#10b981',
            info: '#3b82f6',
            warning: '#f59e0b'
        };
    }

    /**
     * Initialize Chart.js library
     */
    async init() {
        // Check if Chart.js is loaded
        if (typeof Chart === 'undefined') {
            console.error('Chart.js not loaded. Please include CDN in HTML.');
            return false;
        }

        // Set global Chart.js defaults
        Chart.defaults.font.family = "'Inter', sans-serif";
        Chart.defaults.color = '#e5e7eb';
        Chart.defaults.plugins.legend.labels.usePointStyle = true;

        return true;
    }

    /**
     * Create 30-day session trend chart
     */
    async createSessionTrendChart(canvasId, sessions) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        // Prepare data: last 30 days
        const last30Days = this.getLast30Days();
        const sessionsByDay = this.groupSessionsByDay(sessions, last30Days);

        const data = {
            labels: last30Days.map(d => this.formatDateShort(d)),
            datasets: [{
                label: 'Sessions',
                data: last30Days.map(d => sessionsByDay[d] || 0),
                borderColor: this.chartColors.primary,
                backgroundColor: this.hexToRgba(this.chartColors.primary, 0.1),
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        };

        const config = {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        titleFont: { size: 14 },
                        bodyFont: { size: 13 },
                        callbacks: {
                            title: (items) => this.formatDateLong(new Date(items[0].label)),
                            label: (item) => `${item.parsed.y} session${item.parsed.y !== 1 ? 's' : ''}`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1,
                            precision: 0
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            maxRotation: 45,
                            minRotation: 45
                        }
                    }
                }
            }
        };

        // Destroy existing chart if any
        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        this.charts[canvasId] = new Chart(canvas.getContext('2d'), config);
    }

    /**
     * Create session type distribution chart (donut)
     */
    async createSessionTypeChart(canvasId, sessions) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        // Count sessions by type
        const typeCount = {
            breathwork: 0,
            sound: 0,
            guided: 0
        };

        sessions.forEach(session => {
            if (typeCount.hasOwnProperty(session.type)) {
                typeCount[session.type]++;
            }
        });

        const data = {
            labels: ['Breathwork', 'Sound Healing', 'Guided Sessions'],
            datasets: [{
                data: [typeCount.breathwork, typeCount.sound, typeCount.guided],
                backgroundColor: [
                    this.chartColors.primary,
                    this.chartColors.secondary,
                    this.chartColors.success
                ],
                borderWidth: 0
            }]
        };

        const config = {
            type: 'doughnut',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            font: { size: 12 }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        callbacks: {
                            label: (item) => {
                                const total = item.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((item.parsed / total) * 100).toFixed(1);
                                return `${item.label}: ${item.parsed} (${percentage}%)`;
                            }
                        }
                    }
                },
                cutout: '70%'
            }
        };

        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        this.charts[canvasId] = new Chart(canvas.getContext('2d'), config);
    }

    /**
     * Create mood improvement chart
     */
    async createMoodChart(canvasId, sessions) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        // Filter sessions with mood data
        const sessionsWithMood = sessions.filter(s => s.moodBefore && s.moodAfter);

        if (sessionsWithMood.length === 0) {
            // Show "no data" message
            canvas.parentElement.innerHTML = '<p style="text-align: center; color: #9ca3af;">Complete sessions with mood tracking to see trends</p>';
            return;
        }

        // Get last 10 sessions with mood data
        const recentMoodSessions = sessionsWithMood.slice(-10);

        const data = {
            labels: recentMoodSessions.map((s, i) => `Session ${i + 1}`),
            datasets: [
                {
                    label: 'Before',
                    data: recentMoodSessions.map(s => s.moodBefore),
                    borderColor: this.chartColors.warning,
                    backgroundColor: this.hexToRgba(this.chartColors.warning, 0.1),
                    borderWidth: 2,
                    pointRadius: 5
                },
                {
                    label: 'After',
                    data: recentMoodSessions.map(s => s.moodAfter),
                    borderColor: this.chartColors.success,
                    backgroundColor: this.hexToRgba(this.chartColors.success, 0.1),
                    borderWidth: 2,
                    pointRadius: 5
                }
            ]
        };

        const config = {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12
                    }
                },
                scales: {
                    y: {
                        min: 1,
                        max: 10,
                        ticks: {
                            stepSize: 1
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        };

        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        this.charts[canvasId] = new Chart(canvas.getContext('2d'), config);
    }

    /**
     * Create weekly minutes bar chart
     */
    async createWeeklyMinutesChart(canvasId, sessions) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        // Get last 4 weeks
        const weeks = this.getLast4Weeks();
        const minutesByWeek = weeks.map(week => {
            const weekSessions = sessions.filter(s => {
                const sessionDate = new Date(s.date);
                return sessionDate >= week.start && sessionDate <= week.end;
            });

            return weekSessions.reduce((total, s) => total + (s.duration || 0), 0);
        });

        const data = {
            labels: weeks.map(w => w.label),
            datasets: [{
                label: 'Minutes',
                data: minutesByWeek,
                backgroundColor: this.chartColors.info,
                borderRadius: 8
            }]
        };

        const config = {
            type: 'bar',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        callbacks: {
                            label: (item) => `${item.parsed.y} minutes`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        };

        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        this.charts[canvasId] = new Chart(canvas.getContext('2d'), config);
    }

    // ========== UTILITY METHODS ==========

    getLast30Days() {
        const days = [];
        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            days.push(date.getTime());
        }
        return days;
    }

    getLast4Weeks() {
        const weeks = [];
        for (let i = 3; i >= 0; i--) {
            const end = new Date();
            end.setDate(end.getDate() - (i * 7));
            end.setHours(23, 59, 59, 999);

            const start = new Date(end);
            start.setDate(start.getDate() - 6);
            start.setHours(0, 0, 0, 0);

            weeks.push({
                start: start,
                end: end,
                label: `Week ${4 - i}`
            });
        }
        return weeks;
    }

    groupSessionsByDay(sessions, days) {
        const grouped = {};
        days.forEach(day => {
            grouped[day] = 0;
        });

        sessions.forEach(session => {
            const sessionDay = new Date(session.date);
            sessionDay.setHours(0, 0, 0, 0);
            const dayTimestamp = sessionDay.getTime();

            if (grouped.hasOwnProperty(dayTimestamp)) {
                grouped[dayTimestamp]++;
            }
        });

        return grouped;
    }

    formatDateShort(timestamp) {
        const date = new Date(timestamp);
        return `${date.getMonth() + 1}/${date.getDate()}`;
    }

    formatDateLong(date) {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    /**
     * Destroy all charts (cleanup)
     */
    destroyAll() {
        Object.keys(this.charts).forEach(key => {
            if (this.charts[key]) {
                this.charts[key].destroy();
            }
        });
        this.charts = {};
    }
}

// Create global instance
window.analyticsCharts = new AnalyticsCharts();

console.log('📊 Analytics Charts module loaded');
