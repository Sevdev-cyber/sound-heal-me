# Sacred Sound - Healing & Breathwork App

A beautiful, modern web application for sound healing and breathwork practices. Built with zen aesthetics and calm technology principles.

## Features

### 🫁 Breathwork Practice
- **Multiple Breathing Patterns**
  - Box Breathing (4-4-4-4) for balanced calm
  - 4-7-8 Relaxation for stress relief
  - Coherent Breathing (5-5) for heart-rate variability
  - Energizing Breath (2-1-4-1) for morning practice
- **Visual Guide**: Animated breathing circle that expands and contracts
- **Audio Cues**: Gentle chimes to mark breath transitions
- **Customizable Sessions**: 1-20 minute duration
- **Progress Tracking**: Breath counter and time remaining

### 🎵 Sound Healing
- **Singing Bowls**: Tibetan and Crystal bowl frequencies
- **Nature Sounds**: Rain, Ocean, Forest ambience
- **Binaural Beats**: Theta (meditation) and Alpha (relaxation) waves
- **Ambient Soundscapes**: Ethereal pads and wind chimes
- **Multi-Track Mixing**: Play multiple sounds simultaneously with individual volume controls
- **Real-Time Visualizer**: Beautiful frequency visualization

### 🧘 Guided Sessions
Pre-programmed wellness journeys combining breathwork and sound:
- **Morning Energizer** (10 min): Start your day with energy
- **Stress Relief** (15 min): Release tension and anxiety
- **Deep Relaxation** (20 min): Profound rest and recovery
- **Sleep Preparation** (30 min): Drift into peaceful slumber

### 🌙 Additional Features
- **Dark Mode**: Eye-friendly for evening practice
- **Responsive Design**: Works beautifully on all devices
- **PWA Support**: Install on your device for offline use
- **No External Dependencies**: All sounds generated using Web Audio API

## Technology Stack

- **Pure HTML/CSS/JavaScript** - No frameworks needed
- **Web Audio API** - Procedural sound synthesis
- **Canvas API** - Audio visualization
- **PWA** - Progressive Web App with offline support
- **Mobile-First** - Responsive design from 320px and up

## Quick Start

1. Open `index.html` in a modern web browser
2. Grant audio permissions when prompted
3. Start with a breathwork session or explore sounds
4. Try a guided session for a complete experience

### Local Development

Simply open the `index.html` file in your browser:

```bash
# Option 1: Direct file open
open index.html

# Option 2: Simple HTTP server
python3 -m http.server 8000
# Then visit http://localhost:8000
```

### Deploy to GitHub Pages

1. Create a new GitHub repository
2. Push this code to the repository
3. Enable GitHub Pages in repository settings
4. Your app will be live at `https://username.github.io/repo-name`

## Design Philosophy

This app follows **calm technology** principles inspired by the Sacred Forest project:

- **Minimalist Interface**: Distraction-free, focusing on the practice
- **Calming Colors**: Soft purples, blues, and earth tones for relaxation
- **Smooth Animations**: 60fps breathing animations that feel natural
- **Generous Spacing**: Room to breathe, visually and mentally
- **Touch-Friendly**: Minimum 48px touch targets for mobile use

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

**Note**: Web Audio API requires user interaction to start. Click buttons to activate sounds.

## File Structure

```
/
├── index.html              # Main application
├── index.css              # Design system and styles
├── app.js                 # Main controller, navigation, theme
├── breathwork.js          # Breathwork engine and animations
├── sound-player.js        # Sound synthesis and mixing
├── sessions.js            # Guided session orchestrator
├── manifest.json          # PWA manifest
├── service-worker.js      # Offline capability
├── README.md             # This file
└── assets/
    ├── audio/            # (Optional) Custom audio files
    ├── images/           # (Optional) Custom images
    └── icons/            # (Optional) Custom icons
```

## Customization

### Add New Breathing Patterns

Edit `breathwork.js` and add to the `patterns` object:

```javascript
myPattern: {
  inhale: 4,
  hold1: 2,
  exhale: 6,
  hold2: 0,
  name: 'My Custom Pattern'
}
```

### Add New Sounds

Edit `sound-player.js` and add to the `soundDefinitions` object with your synthesis parameters.

### Create Custom Sessions

Edit `sessions.js` and add to the `guidedSessions` object with your combination of breathwork, sounds, and instructions.

## Credits

Made with 💜 for wellness and inner peace.

Inspired by:
- Sacred Forest zen design principles
- Modern meditation apps (Calm, Headspace)
- Ancient sound healing practices
- Breathwork teachings from various traditions

## License

Free to use for personal wellness practice. 🙏
