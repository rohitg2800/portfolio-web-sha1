document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Parallax scroll effect
const parallaxLayer = document.getElementById('parallaxLayer');
window.addEventListener('scroll', function() {
    const scrollY = window.scrollY;
    parallaxLayer.style.transform = `translateY(${scrollY * 0.5}px)`;
});

// Scroll trigger animation - 20% visibility threshold
const observerOptions = {
    threshold: 0.2,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all scroll-reveal elements
document.querySelectorAll('.scroll-reveal').forEach(el => {
    observer.observe(el);
});

// Navigation blur on scroll
const nav = document.querySelector('nav');
window.addEventListener('scroll', function() {
    if (window.scrollY > 50) {
        nav.style.background = 'rgba(0, 0, 0, 0.85)';
        nav.style.borderBottomColor = 'rgba(255, 255, 255, 0.15)';
    } else {
        nav.style.background = 'rgba(0, 0, 0, 0.7)';
        nav.style.borderBottomColor = 'rgba(255, 255, 255, 0.1)';
    }
});
