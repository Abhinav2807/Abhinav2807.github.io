// Scroll-triggered animations
const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
);

document.querySelectorAll('.animate-on-scroll').forEach((el) => {
    observer.observe(el);
});

// Mobile nav drawer
const navToggle = document.getElementById('navToggle');
const navMobile = document.getElementById('navMobile');
const navOverlay = document.getElementById('navOverlay');
const navClose = document.getElementById('navClose');

function openDrawer() {
    navMobile.classList.add('active');
    navOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeDrawer() {
    navMobile.classList.remove('active');
    navOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

navToggle.addEventListener('click', openDrawer);
navClose.addEventListener('click', closeDrawer);
navOverlay.addEventListener('click', closeDrawer);

// Close drawer on link click
navMobile.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeDrawer);
});

// Navbar background on scroll
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        nav.style.background = 'rgba(19, 19, 19, 0.95)';
    } else {
        nav.style.background = '';
    }
});

// ===== Hero Canvas Animation =====
(function () {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let w, h, particles, gridNodes, scanY;
    const PRIMARY = '#00FF41';
    const SECONDARY = '#00A2FD';
    const DIM = 'rgba(255,255,255,0.03)';

    function resize() {
        const rect = canvas.parentElement.getBoundingClientRect();
        w = canvas.width = rect.width;
        h = canvas.height = rect.height;
    }

    // Floating particles
    function initParticles() {
        particles = [];
        const count = Math.floor((w * h) / 18000);
        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * w,
                y: Math.random() * h,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                r: Math.random() * 1.5 + 0.5,
                color: Math.random() > 0.8 ? PRIMARY : Math.random() > 0.5 ? SECONDARY : 'rgba(255,255,255,0.15)',
            });
        }
    }

    // Grid nodes (stationary dots that particles connect to)
    function initGrid() {
        gridNodes = [];
        const spacing = 80;
        for (let x = spacing; x < w; x += spacing) {
            for (let y = spacing; y < h; y += spacing) {
                if (Math.random() > 0.6) {
                    gridNodes.push({ x, y });
                }
            }
        }
    }

    scanY = 0;

    function draw() {
        ctx.clearRect(0, 0, w, h);

        // Draw sparse grid dots
        ctx.fillStyle = DIM;
        for (const node of gridNodes) {
            ctx.fillRect(node.x, node.y, 1, 1);
        }

        // Draw horizontal scan line
        scanY += 0.4;
        if (scanY > h) scanY = -20;
        const scanGrad = ctx.createLinearGradient(0, scanY - 10, 0, scanY + 10);
        scanGrad.addColorStop(0, 'transparent');
        scanGrad.addColorStop(0.5, 'rgba(0, 255, 65, 0.04)');
        scanGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = scanGrad;
        ctx.fillRect(0, scanY - 10, w, 20);

        // Update and draw particles
        for (const p of particles) {
            p.x += p.vx;
            p.y += p.vy;

            // Wrap around
            if (p.x < 0) p.x = w;
            if (p.x > w) p.x = 0;
            if (p.y < 0) p.y = h;
            if (p.y > h) p.y = 0;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
        }

        // Draw connections between nearby particles
        ctx.lineWidth = 0.5;
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = dx * dx + dy * dy;
                if (dist < 12000) {
                    const alpha = 1 - dist / 12000;
                    ctx.strokeStyle = `rgba(0, 255, 65, ${alpha * 0.08})`;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }

        // Occasional "data stream" vertical lines
        if (Math.random() > 0.97) {
            const lx = Math.random() * w;
            const lh = Math.random() * 100 + 40;
            const ly = Math.random() * h;
            const grad = ctx.createLinearGradient(lx, ly, lx, ly + lh);
            grad.addColorStop(0, 'transparent');
            grad.addColorStop(0.3, 'rgba(0, 162, 253, 0.06)');
            grad.addColorStop(0.7, 'rgba(0, 255, 65, 0.04)');
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.fillRect(lx, ly, 1, lh);
        }

        requestAnimationFrame(draw);
    }

    resize();
    initParticles();
    initGrid();
    draw();

    window.addEventListener('resize', () => {
        resize();
        initParticles();
        initGrid();
    });
})();
