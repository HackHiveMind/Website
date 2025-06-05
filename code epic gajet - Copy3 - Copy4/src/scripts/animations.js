// Parallax Scrolling Effect
class ParallaxEffect {
    constructor() {
        this.items = document.querySelectorAll('.parallax');
        this.scrollY = window.scrollY;
        
        // Verificare existență elemente
        if (this.items.length > 0) {
            this.bindEvents();
        }
    }

    bindEvents() {
        window.addEventListener('scroll', () => this.onScroll());
        window.addEventListener('resize', () => this.onResize());
    }

    onScroll() {
        this.scrollY = window.scrollY;
        window.requestAnimationFrame(() => this.update());
    }

    onResize() {
        window.requestAnimationFrame(() => this.update());
    }

    update() {
        this.items.forEach(element => {
            // Validare data-speed
            const speedRaw = element.dataset.speed || '0.5';
            const speed = parseFloat(speedRaw) || 0.5;
            
            const yPos = -(this.scrollY * speed);
            element.style.transform = `translate3d(0, ${yPos}px, 0)`;
        });
    }
}

// Smooth Scroll Animation
class SmoothScroll {
    constructor() {
        this.links = document.querySelectorAll('a[href^="#"]');
        this.bindEvents();
    }

    bindEvents() {
        this.links.forEach(link => {
            const href = link.getAttribute('href');
            // Evităm linkurile fără destinație validă
            if (href && href !== '#') {
                link.addEventListener('click', (e) => this.onClick(e));
            }
        });
    }

    onClick(e) {
        e.preventDefault();
        const href = e.currentTarget.getAttribute('href');
        
        try {
            // Validare URL fragment
            const hash = href.split('#')[1];
            if (!hash) return;
            
            const target = document.getElementById(hash);
            
            if (target) {
                this.scrollToTarget(target);
                
                // Actualizare URL fără recărcare pagină
                history.pushState(null, '', `#${hash}`);
            }
        } catch (error) {
            console.error('SmoothScroll error:', error);
        }
    }

    scrollToTarget(target) {
        const startPosition = window.pageYOffset;
        const targetPosition = target.getBoundingClientRect().top + startPosition;
        const distance = targetPosition - startPosition;
        const duration = 1000;
        let start = null;

        const animation = (currentTime) => {
            if (start === null) start = currentTime;
            const timeElapsed = currentTime - start;
            const progress = Math.min(timeElapsed / duration, 1);
            const easeProgress = this.easeInOutCubic(progress);
            
            window.scrollTo(0, startPosition + (distance * easeProgress));

            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            }
        };

        requestAnimationFrame(animation);
    }

    easeInOutCubic(t) {
        return t < 0.5 
            ? 4 * t * t * t 
            : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    }
}

// Product Card Animation
class ProductCardAnimation {
    constructor() {
        this.cards = document.querySelectorAll('.product-card');
        this.bindEvents();
    }

    bindEvents() {
        if (this.cards.length === 0) return;
        
        this.cards.forEach(card => {
            card.addEventListener('mousemove', (e) => this.onMouseMove(e));
            card.addEventListener('mouseleave', (e) => this.onMouseLeave(e));
            // Adăugare suport pentru ecrane tactile
            if ('ontouchstart' in window) {
                card.addEventListener('touchmove', (e) => this.handleTouch(e), { passive: true });
                card.addEventListener('touchend', (e) => this.onMouseLeave(e));
            }
        });
    }

    onMouseMove(e) {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        
        // Calculare poziție relativă
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Limitare unghiuri maxime
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        // Calculare rotații
        const rotateX = Math.max(-5, Math.min(5, (y - centerY) / 20));
        const rotateY = Math.max(-5, Math.min(5, (centerX - x) / 20));

        // Aplicare transformare optimizată
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
    }

    onMouseLeave(e) {
        const card = e.currentTarget;
        // Resetare transformare cu tranzitie
        card.style.transition = 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)';
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        
        // Resetare tranzitie după aplicare
        setTimeout(() => {
            card.style.transition = '';
        }, 400);
    }

    handleTouch(e) {
        if (e.touches && e.touches[0]) {
            this.onMouseMove({
                clientX: e.touches[0].clientX,
                clientY: e.touches[0].clientY,
                currentTarget: e.currentTarget
            });
        }
    }
}

// Hero Section Animation
class HeroAnimation {
    constructor() {
        this.hero = document.querySelector('.hero');
        this.content = document.querySelector('.hero-content');
        this.image = document.querySelector('.hero-image');
        this.init();
    }

    init() {
        // Verificare existență elemente
        if (!this.content && !this.image) return;
        
        // Inițializare stiluri
        if (this.content) {
            this.content.style.opacity = '0';
            this.content.style.transform = 'translateY(20px)';
        }
        
        if (this.image) {
            this.image.style.opacity = '0';
            this.image.style.transform = 'scale(0.95)';
        }

        // Animare după timeout
        window.requestAnimationFrame(() => {
            setTimeout(() => {
                this.animate();
            }, 100);
        });
    }

    animate() {
        // Animare conținut
        if (this.content) {
            this.content.style.transition = 'all 1s cubic-bezier(0.4, 0, 0.2, 1)';
            this.content.style.opacity = '1';
            this.content.style.transform = 'translateY(0)';
        }

        // Animare imagine
        if (this.image) {
            setTimeout(() => {
                this.image.style.transition = 'all 1.2s cubic-bezier(0.4, 0, 0.2, 1)';
                this.image.style.opacity = '1';
                this.image.style.transform = 'scale(1)';
            }, 400);
        }
    }
}

// Navigation Animation
class NavigationAnimation {
    constructor() {
        this.nav = document.querySelector('.nav-wrapper');
        this.links = document.querySelectorAll('.nav-links a');
        this.lastScrollY = window.scrollY;
        this.isMobile = window.innerWidth <= 768;
        this.bindEvents();
    }

    bindEvents() {
        // Verificare existență nav
        if (!this.nav) return;
        
        // Animare pe scroll
        window.addEventListener('scroll', () => this.onScroll());
        
        // Animare pe hover
        this.links.forEach(link => {
            if (!link) return;
            
            link.addEventListener('mouseenter', (e) => this.onLinkHover(e));
            link.addEventListener('mouseleave', (e) => this.onLinkLeave(e));
            link.setAttribute('aria-haspopup', 'true');
        });
    }

    onScroll() {
        const currentScrollY = window.scrollY;
        
        // Evitare animare pe mobile pentru performanță
        if (this.isMobile) return;
        
        // Animare nav
        if (currentScrollY > this.lastScrollY) {
            this.nav.style.transform = 'translateY(-100%)';
        } else {
            this.nav.style.transform = 'translateY(0)';
        }

        this.lastScrollY = currentScrollY;
    }

    onLinkHover(e) {
        const link = e.currentTarget;
        link.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        link.style.opacity = '1';
        link.setAttribute('aria-expanded', 'true');
    }

    onLinkLeave(e) {
        const link = e.currentTarget;
        link.style.opacity = '0.8';
        link.setAttribute('aria-expanded', 'false');
    }
}

// Initialize all animations
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Inițializare animații doar dacă elementele există
        new ParallaxEffect();
        new SmoothScroll();
        new ProductCardAnimation();
        new HeroAnimation();
        new NavigationAnimation();
        
        // Activare animații la scroll
        const scrollElements = document.querySelectorAll('.scroll-reveal');
        if (scrollElements.length > 0) {
            window.addEventListener('scroll', handleScrollReveal);
            window.dispatchEvent(new Event('scroll'));
        }
    } catch (error) {
        console.error('Error initializing animations:', error);
    }
});

// Funcție pentru animații la scroll
function handleScrollReveal() {
    const scrollY = window.scrollY + window.innerHeight * 0.8;
    
    document.querySelectorAll('.scroll-reveal').forEach(element => {
        const elementY = element.getBoundingClientRect().top + window.scrollY;
        
        if (scrollY > elementY) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
            element.classList.add('visible');
        }
    });
}

// Observer pentru încărcare imagini
if ('IntersectionObserver' in window) {
    const imgObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                imgObserver.unobserve(img);
            }
        });
    }, { rootMargin: '0px 0px 200px 0px' });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imgObserver.observe(img);
    });
}