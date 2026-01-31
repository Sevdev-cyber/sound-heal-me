# Sacred Sound - Healing & Breathwork App

A beautiful, feature-rich web application for sound healing, breathwork practices, and personal wellness tracking.

## 🚀 Version 2.0 - Major Update!

### 👤 User Experience & Personalization
- **User Profiles**: Track your journey with persistent stats and preferences (IndexedDB)
- **Session History**: Calendar view with visual streak indicators
- **XP & Levels**: Progress from Beginner → Guru with achievements
- **Smart Recommendations**: AI-powered suggestions based on time and history
- **Mood Tracking**: Rate your mood before/after to see improvement trends

### 🫁 Advanced Breathwork
**Wim Hof Method**: Complete 3-round protocol
- 30-40 rapid breaths (hyperventilation)
- Breath retention tracking with personal bests  
- Recovery breath (15-second hold)
- Audio cues and visual guidance

**Pranayama Collection**: 4 Classic yogic techniques
- **Nadi Shodhana** (Alternate Nostril) - Balance energy
- **Kapalabhati** (Skull Shining) - Energizing cleanse
- **Bhastrika** (Bellows Breath) - Powerful activation
- **Ujjayi** (Ocean Breath) - Calming practice

**Original Patterns**: Box, 4-7-8, Coherent, Energizing

### 🎵 Extended Sound Library
**13 Chakra & Healing Frequencies**:
- 7 Chakra Bowls (396-963 Hz) - Root through Crown
- Solfeggio Frequencies (174 Hz, 285 Hz)
- Planetary Tones (Earth Om 136.1 Hz, Moon, Sun)

**Vocal Mantras** (NEW):
- **Om** - Earth frequency with rich harmonics
- **Aum** - 3-phase sacred sound (A-U-M)
- **So Hum** - Breath-synchronized mantra

**Original Sounds**:
- Singers Bowls, Nature ambience, Binaural beats, Ambient scapes

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
├── breathwork.js          # Original breathwork engine
├── sound-player.js        # Original sound synthesis
├── sessions.js            # Guided session orchestrator
├── manifest.json          # PWA manifest
├── service-worker.js      # Offline capability
├── package.json           # NPM scripts
├── railway.json           # Railway deployment config
├── README.md             # This file
└── src/                   # NEW: Extended features
    ├── core/
    │   ├── storage-manager.js    # IndexedDB wrapper
    │   ├── user-profile.js       # User profiles & stats
    │   └── analytics.js          # Session tracking & insights
    └── features/
        ├── breathwork/
        │   ├── wim-hof.js        # Wim Hof Method
        │   └── pranayama.js      # Yogic breathing techniques
        └── sound/
            ├── chakra-bowls.js   # 13 healing frequencies
            └── mantras.js        # Vocal synthesis (Om, Aum, So Hum)
```

## Quick Start

### Local Development
```bash
# Option 1: Direct file open
open index.html

# Option 2: HTTP server required for PWA features)
npm run dev
# Or:
python3 -m http.server 8000
```

### Deploy to Railway

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template)

1. Click the button above or:
2. Create Railway account at railway.app
3. Connect your GitHub repository
4. Railway will auto-deploy using `railway.json` config
5. Your app will be live at a custom Railway URL

### Deploy to GitHub Pages

1. Push code to GitHub repository
2. Go to Settings → Pages
3. Select branch and root directory
4. App live at `https://username.github.io/repo-name`


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
