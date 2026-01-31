// ============================================
// BREATHWORK ENGINE
// Handles breathing patterns, animations, and timing
// ============================================

class BreathworkEngine {
  constructor() {
    this.patterns = {
      box: { inhale: 4, hold1: 4, exhale: 4, hold2: 4, name: 'Box Breathing' },
      '478': { inhale: 4, hold1: 7, exhale: 8, hold2: 0, name: '4-7-8 Relaxation' },
      coherent: { inhale: 5, hold1: 0, exhale: 5, hold2: 0, name: 'Coherent Breathing' },
      energize: { inhale: 2, hold1: 1, exhale: 4, hold2: 1, name: 'Energizing Breath' }
    };
    
    this.currentPattern = this.patterns.box;
    this.isActive = false;
    this.isPaused = false;
    this.breathCount = 0;
    this.totalTime = 300; // 5 minutes in seconds
    this.elapsedTime = 0;
    this.currentPhase = 'ready';
    
    this.audioContext = null;
    this.timer = null;
    this.phaseTimer = null;
    
    this.initElements();
    this.initEventListeners();
  }
  
  initElements() {
    this.circle = document.getElementById('breathCircle');
    this.breathText = document.getElementById('breathText').querySelector('div');
    this.patternSelect = document.getElementById('breathPattern');
    this.durationSlider = document.getElementById('breathDuration');
    this.durationLabel = document.getElementById('durationLabel');
    this.progressDiv = document.getElementById('breathProgress');
    this.breathCountEl = document.getElementById('breathCount');
    this.timeRemainingEl = document.getElementById('timeRemaining');
    this.startBtn = document.getElementById('breathStart');
    this.pauseBtn = document.getElementById('breathPause');
    this.stopBtn = document.getElementById('breathStop');
  }
  
  initEventListeners() {
    this.patternSelect.addEventListener('change', (e) => {
      this.currentPattern = this.patterns[e.target.value];
    });
    
    this.durationSlider.addEventListener('input', (e) => {
      this.totalTime = parseInt(e.target.value) * 60;
      this.durationLabel.textContent = e.target.value;
    });
    
    this.startBtn.addEventListener('click', () => this.start());
    this.pauseBtn.addEventListener('click', () => this.togglePause());
    this.stopBtn.addEventListener('click', () => this.stop());
  }
  
  start() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    this.isActive = true;
    this.isPaused = false;
    this.breathCount = 0;
    this.elapsedTime = 0;
    
    this.startBtn.classList.add('hidden');
    this.pauseBtn.classList.remove('hidden');
    this.stopBtn.classList.remove('hidden');
    this.progressDiv.style.display = 'block';
    
    this.runCycle();
    this.startTimer();
  }
  
  togglePause() {
    this.isPaused = !this.isPaused;
    this.pauseBtn.textContent = this.isPaused ? 'Resume' : 'Pause';
    
    if (!this.isPaused) {
      this.runCycle();
    } else {
      clearTimeout(this.phaseTimer);
    }
  }
  
  stop() {
    this.isActive = false;
    this.isPaused = false;
    clearTimeout(this.phaseTimer);
    clearInterval(this.timer);
    
    this.startBtn.classList.remove('hidden');
    this.pauseBtn.classList.add('hidden');
    this.stopBtn.classList.add('hidden');
    this.progressDiv.style.display = 'none';
    
    this.resetVisuals();
    this.breathText.textContent = 'Ready';
  }
  
  runCycle() {
    if (!this.isActive || this.isPaused) return;
    
    const phases = [
      { name: 'Breathe In', duration: this.currentPattern.inhale, scale: 1.6, color: 'hsl(240, 60%, 65%)' },
      { name: 'Hold', duration: this.currentPattern.hold1, scale: 1.6, color: 'hsl(200, 70%, 65%)' },
      { name: 'Breathe Out', duration: this.currentPattern.exhale, scale: 1, color: 'hsl(280, 55%, 65%)' },
      { name: 'Hold', duration: this.currentPattern.hold2, scale: 1, color: 'hsl(200, 70%, 65%)' }
    ].filter(phase => phase.duration > 0);
    
    let phaseIndex = 0;
    
    const runPhase = () => {
      if (!this.isActive || this.isPaused) return;
      
      const phase = phases[phaseIndex];
      this.currentPhase = phase.name;
      
      this.animateBreath(phase.scale, phase.duration, phase.color);
      this.breathText.textContent = phase.name;
      
      // Play chime at phase start
      if (phase.name === 'Breathe In') {
        this.playChime(440); // A4
        this.breathCount++;
        this.breathCountEl.textContent = this.breathCount;
      } else if (phase.name === 'Breathe Out') {
        this.playChime(330); // E4
      }
      
      this.phaseTimer = setTimeout(() => {
        phaseIndex = (phaseIndex + 1) % phases.length;
        runPhase();
      }, phase.duration * 1000);
    };
    
    runPhase();
  }
  
  animateBreath(scale, duration, color) {
    const r = 80 * scale;
    this.circle.style.transition = `r ${duration}s ease-in-out, fill ${duration}s ease-in-out`;
    this.circle.setAttribute('r', r);
    this.circle.style.fill = color;
  }
  
  resetVisuals() {
    this.circle.style.transition = 'r 0.5s ease, fill 0.5s ease';
    this.circle.setAttribute('r', '80');
    this.circle.style.fill = 'url(#breathGradient)';
  }
  
  playChime(frequency) {
    if (!this.audioContext) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.5);
  }
  
  startTimer() {
    this.timer = setInterval(() => {
      if (!this.isPaused) {
        this.elapsedTime++;
        const remaining = this.totalTime - this.elapsedTime;
        
        if (remaining <= 0) {
          this.stop();
          this.breathText.textContent = 'Complete! 🎉';
          return;
        }
        
        const minutes = Math.floor(remaining / 60);
        const seconds = remaining % 60;
        this.timeRemainingEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      }
    }, 1000);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.breathworkEngine = new BreathworkEngine();
  });
} else {
  window.breathworkEngine = new BreathworkEngine();
}
