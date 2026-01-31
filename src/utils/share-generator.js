// Share Generator - Create shareable images and social media content
// Generates achievement cards and progress graphics using HTML Canvas

class ShareGenerator {
    constructor() {
        this.canvas = null;
        this.ctx = null;
    }

    /**
     * Initialize canvas
     */
    initCanvas(width = 800, height = 600) {
        if (!this.canvas) {
            this.canvas = document.createElement('canvas');
            this.ctx = this.canvas.getContext('2d');
        }

        this.canvas.width = width;
        this.canvas.height = height;

        return this.canvas;
    }

    /**
     * Generate achievement unlock card
     */
    async generateAchievementCard(achievement) {
        const canvas = this.initCanvas(800, 600);
        const ctx = this.ctx;

        // Background gradient
        const gradient = ctx.createLinearGradient(0, 0, 800, 600);
        gradient.addColorStop(0, '#8b5cf6');
        gradient.addColorStop(1, '#ec4899');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 800, 600);

        // Achievement icon (large emoji)
        ctx.font = 'bold 120px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(achievement.icon, 400, 200);

        // "Achievement Unlocked!" text
        ctx.font = 'bold 48px Inter, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('Achievement Unlocked!', 400, 300);

        // Achievement name
        ctx.font = 'bold 64px Inter, sans-serif';
        ctx.fillText(achievement.name, 400, 400);

        // Description
        ctx.font = '32px Inter, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillText(achievement.description, 400, 480);

        // Branding
        ctx.font = 'italic 24px Inter, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fillText('Sacred Sound - Sound Healing & Breathwork', 400, 560);

        return canvas;
    }

    /**
     * Generate streak card
     */
    async generateStreakCard(streak, longestStreak) {
        const canvas = this.initCanvas(800, 600);
        const ctx = this.ctx;

        // Background
        const gradient = ctx.createLinearGradient(0, 0, 0, 600);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#16213e');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 800, 600);

        // Fire emoji
        ctx.font = 'bold 100px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🔥', 400, 150);

        // Streak number
        ctx.font = 'bold 120px Inter, sans-serif';
        ctx.fillStyle = '#f59e0b';
        ctx.fillText(streak, 400, 320);

        // "Day Streak" text
        ctx.font = 'bold 48px Inter, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('Day Streak!', 400, 400);

        // Longest streak badge
        if (longestStreak > streak) {
            ctx.font = '32px Inter, sans-serif';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.fillText(`Personal Best: ${longestStreak} days`, 400, 480);
        } else {
            ctx.font = 'bold 36px Inter, sans-serif';
            ctx.fillStyle = '#10b981';
            ctx.fillText('🏆 New Record!', 400, 480);
        }

        // Branding
        ctx.font = '24px Inter, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fillText('Sacred Sound', 400, 560);

        return canvas;
    }

    /**
     * Generate progress summary card
     */
    async generateProgressCard(stats) {
        const canvas = this.initCanvas(1200, 630); // Twitter/OG image size
        const ctx = this.ctx;

        // Background
        ctx.fillStyle = '#1e1b4b';
        ctx.fillRect(0, 0, 1200, 630);

        // Title
        ctx.font = 'bold 60px Inter, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'left';
        ctx.fillText('My Sacred Sound Journey', 60, 100);

        // Stats grid
        const statsData = [
            { icon: '🧘', label: 'Total Sessions', value: stats.totalSessions },
            { icon: '⏱️', label: 'Total Minutes', value: stats.totalMinutes },
            { icon: '🔥', label: 'Current Streak', value: `${stats.currentStreak} days` },
            { icon: '💫', label: 'Level', value: stats.level || 1 }
        ];

        let yPos = 200;
        statsData.forEach((stat, i) => {
            const xPos = 60 + (i % 2) * 550;
            if (i === 2) yPos = 400;

            // Icon
            ctx.font = '48px sans-serif';
            ctx.fillText(stat.icon, xPos, yPos);

            // Label
            ctx.font = '28px Inter, sans-serif';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.fillText(stat.label, xPos + 70, yPos);

            // Value
            ctx.font = 'bold 48px Inter, sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.fillText(stat.value, xPos + 70, yPos + 50);
        });

        // Logo/branding
        ctx.font = 'italic 24px Inter, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.textAlign = 'right';
        ctx.fillText('Sacred Sound - Sound Healing & Breathwork', 1140, 590);

        return canvas;
    }

    /**
     * Download image as PNG
     */
    downloadImage(canvas, filename = 'sacred-sound-share.png') {
        canvas.toBlob(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    }

    /**
     * Copy share text to clipboard
     */
    copyShareText(type, data) {
        let text = '';

        switch (type) {
            case 'achievement':
                text = `🎉 I just unlocked "${data.name}" in Sacred Sound! ${data.description} #SacredSound #Mindfulness`;
                break;
            case 'streak':
                text = `🔥 ${data.streak}-day practice streak! Staying consistent with Sacred Sound. #MindfulnessJourney #SacredSound`;
                break;
            case 'progress':
                text = `My Sacred Sound journey: ${data.totalSessions} sessions, ${data.totalMinutes} minutes of practice. Join me! #SacredSound #Wellness`;
                break;
        }

        navigator.clipboard.writeText(text).then(() => {
            if (window.showNotification) {
                window.showNotification('📋 Share text copied to clipboard!');
            }
        });
    }

    /**
     * Open share dialog (Web Share API)
     */
    async shareNative(title, text, files = []) {
        if (navigator.share) {
            try {
                await navigator.share({
                    title,
                    text,
                    files
                });
            } catch (error) {
                console.log('Share cancelled or failed:', error);
            }
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(`${title}\n\n${text}`);
            if (window.showNotification) {
                window.showNotification('📋 Copied to clipboard! (Share not supported)');
            }
        }
    }
}

// Create global instance
window.shareGenerator = new ShareGenerator();

console.log('🎨 Share Generator module loaded');
