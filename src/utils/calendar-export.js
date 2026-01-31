// Calendar Export - Generate .ics files for practice sessions
// Universal calendar format compatible with Google Calendar, Apple Calendar, Outlook

class CalendarExport {
    /**
     * Generate .ics file from session data
     */
    generateICS(session) {
        const startDate = new Date(session.date);
        const endDate = new Date(startDate.getTime() + (session.duration || 10) * 60 * 1000);

        const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Sacred Sound//Practice Session//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
DTSTART:${this.formatDate(startDate)}
DTEND:${this.formatDate(endDate)}
SUMMARY:${this.getSessionTitle(session)}
DESCRIPTION:${this.getSessionDescription(session)}
LOCATION:Sacred Sound App
STATUS:CONFIRMED
SEQUENCE:0
BEGIN:VALARM
TRIGGER:-PT1H
DESCRIPTION:Practice session reminder
ACTION:DISPLAY
END:VALARM
END:VEVENT
END:VCALENDAR`;

        return ics;
    }

    /**
     * Format date for iCalendar (YYYYMMDDTHHMMSSZ)
     */
    formatDate(date) {
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        const hours = String(date.getUTCHours()).padStart(2, '0');
        const minutes = String(date.getUTCMinutes()).padStart(2, '0');
        const seconds = String(date.getUTCSeconds()).padStart(2, '0');

        return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
    }

    /**
     * Get session title for calendar event
     */
    getSessionTitle(session) {
        if (session.type === 'breathwork') {
            return `Breathwork: ${session.pattern || 'Practice'}`;
        } else if (session.type === 'sound') {
            return `Sound Healing Session`;
        } else if (session.type === 'guided') {
            return `Guided Session: ${session.guidedSession || 'Meditation'}`;
        }
        return 'Sacred Sound Practice';
    }

    /**
     * Get detailed description
     */
    getSessionDescription(session) {
        let desc = `Practice Type: ${session.type}\\n`;

        if (session.pattern) {
            desc += `Pattern: ${session.pattern}\\n`;
        }

        if (session.sounds && session.sounds.length > 0) {
            desc += `Sounds: ${session.sounds.join(', ')}\\n`;
        }

        if (session.duration) {
            desc += `Duration: ${session.duration} minutes\\n`;
        }

        if (session.moodBefore && session.moodAfter) {
            desc += `Mood: ${session.moodBefore} → ${session.moodAfter} (+${session.moodAfter - session.moodBefore})\\n`;
        }

        desc += `\\nCompleted via Sacred Sound App`;

        return desc;
    }

    /**
     * Download .ics file
     */
    downloadICS(session) {
        const icsContent = this.generateICS(session);
        const blob = new Blob([icsContent], { type: 'text/calendar' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `sacred-sound-${new Date(session.date).toISOString().split('T')[0]}.ics`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Export multiple sessions
     */
    exportMultipleSessions(sessions) {
        sessions.forEach(session => {
            setTimeout(() => this.downloadICS(session), 100);
        });
    }
}

// Create global instance
window.calendarExport = new CalendarExport();

console.log('📅 Calendar Export module loaded');
