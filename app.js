// ============================================
// MAIN APP CONTROLLER
// Theme switching, navigation, utilities
// ============================================

class App {
    constructor() {
        this.theme = localStorage.getItem('theme') || 'light';
        this.init();
    }

    init() {
        this.applyTheme();
        this.initThemeToggle();
        this.initNavigation();
        this.initScrollEffects();
    }

    // Theme Management
    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
        const themeIcon = document.getElementById('themeIcon');
        if (themeIcon) {
            themeIcon.textContent = this.theme === 'dark' ? '☀️' : '🌙';
        }
    }

    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', this.theme);
        this.applyTheme();
    }

    initThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
    }

    // Navigation
    initNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();

                // Update active state
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');

                // Scroll to section
                const sectionId = link.dataset.section;
                const section = document.getElementById(sectionId);
                if (section) {
                    const navHeight = document.getElementById('nav').offsetHeight;
                    const sectionTop = section.offsetTop - navHeight - 20;
                    window.scrollTo({
                        top: sectionTop,
                        behavior: 'smooth'
                    });
                }
            });
        });

        // Update active link on scroll
        this.initScrollSpy();
    }

    initScrollSpy() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');

        const observerOptions = {
            threshold: 0.3,
            rootMargin: '-80px 0px -80% 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.dataset.section === id) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }, observerOptions);

        sections.forEach(section => observer.observe(section));
    }

    // Scroll Effects
    initScrollEffects() {
        const nav = document.getElementById('nav');
        let lastScroll = 0;

        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;

            if (currentScroll > 100) {
                nav.style.boxShadow = 'var(--shadow-lg)';
            } else {
                nav.style.boxShadow = 'var(--shadow-sm)';
            }

            lastScroll = currentScroll;
        });
    }
}

// Global scroll function
window.scrollToSection = function (sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const navHeight = document.getElementById('nav').offsetHeight;
        const sectionTop = section.offsetTop - navHeight - 20;
        window.scrollTo({
            top: sectionTop,
            behavior: 'smooth'
        });
    }
};

// Initialize app
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.app = new App();
    });
} else {
    window.app = new App();
}

// Service Worker Registration for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('SW registered:', registration);
            })
            .catch(error => {
                console.log('SW registration failed:', error);
            });
    });
}
