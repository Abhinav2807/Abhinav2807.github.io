// ===== Scroll Animations =====
const observer = new IntersectionObserver(
    (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible'); }),
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
);
document.querySelectorAll('.animate-on-scroll').forEach((el) => observer.observe(el));

// ===== Hotbar + Topbar Active Tracking =====
const hotbarSlots = document.querySelectorAll('.hslot[data-label]');
const topbarLinks = document.querySelectorAll('.topbar-link[data-section]');
const hotbarLabel = document.getElementById('hotbarLabel');
const sections = ['hero', 'experience', 'skills', 'education', 'contact'];

function updateActiveSection() {
    let current = 'HOME';
    let currentId = 'hero';
    for (const id of sections) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 200) {
            const slot = document.querySelector(`.hslot[href="#${id}"]`);
            if (slot) { current = slot.dataset.label; currentId = id; }
        }
    }
    hotbarSlots.forEach((s) => s.classList.toggle('active', s.dataset.label === current));
    topbarLinks.forEach((l) => l.classList.toggle('active', l.dataset.section === currentId));
    if (hotbarLabel) hotbarLabel.textContent = `> WORLD: ${current}`;
}

window.addEventListener('scroll', updateActiveSection);
updateActiveSection();

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    const key = parseInt(e.key);
    if (key >= 1 && key <= 6) {
        const slot = document.querySelector(`.hslot[data-key="${key}"]`);
        if (slot) slot.click();
    }
});

// ===== Contact Form =====
(function () {
    const form = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    if (!form) return;

    const RATE_KEY = 'contact_submissions';
    const MAX = 3;
    const WINDOW = 3600000;

    function getSubs() {
        try { return JSON.parse(localStorage.getItem(RATE_KEY) || '[]').filter((t) => Date.now() - t < WINDOW); }
        catch { return []; }
    }

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        if (getSubs().length >= MAX) {
            submitBtn.innerHTML = '[ RATE LIMITED ]';
            setTimeout(() => { submitBtn.innerHTML = '[ <span>SEND</span> ]'; }, 3000);
            return;
        }
        submitBtn.disabled = true;
        submitBtn.innerHTML = '[ SENDING... ]';

        try {
            const res = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: new FormData(form) });
            const data = await res.json();
            if (data.success) {
                const subs = getSubs(); subs.push(Date.now());
                localStorage.setItem(RATE_KEY, JSON.stringify(subs));
                submitBtn.innerHTML = '[ SENT! ]';
                form.reset();
                setTimeout(() => { submitBtn.innerHTML = '[ <span>SEND</span> ]'; submitBtn.disabled = false; }, 4000);
            } else throw new Error();
        } catch {
            submitBtn.innerHTML = '[ FAILED — RETRY ]';
            submitBtn.disabled = false;
        }
    });
})();

// ===== Hero Canvas — Falling Blocks =====
(function () {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, blocks;
    const SZ = 16;
    const COLORS = [
        'rgba(0, 255, 65, 0.08)',
        'rgba(0, 255, 255, 0.06)',
        'rgba(255, 170, 0, 0.05)',
        'rgba(255, 107, 157, 0.04)',
        'rgba(255, 255, 255, 0.03)',
    ];

    function resize() {
        const r = canvas.parentElement.getBoundingClientRect();
        w = canvas.width = r.width; h = canvas.height = r.height;
    }
    function initBlocks() {
        blocks = [];
        for (let i = 0; i < Math.floor((w * h) / 8000); i++) {
            blocks.push({
                x: Math.floor(Math.random() * (w / SZ)) * SZ,
                y: Math.random() * h,
                speed: 0.2 + Math.random() * 0.5,
                color: COLORS[Math.floor(Math.random() * COLORS.length)],
            });
        }
    }
    function draw() {
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = 'rgba(0, 255, 65, 0.012)';
        for (let x = 0; x < w; x += SZ) for (let y = 0; y < h; y += SZ) ctx.fillRect(x, y, 1, 1);
        for (const b of blocks) {
            b.y += b.speed;
            if (b.y > h) { b.y = -SZ; b.x = Math.floor(Math.random() * (w / SZ)) * SZ; }
            ctx.fillStyle = b.color;
            ctx.fillRect(b.x, b.y, SZ - 1, SZ - 1);
        }
        requestAnimationFrame(draw);
    }
    resize(); initBlocks(); draw();
    window.addEventListener('resize', () => { resize(); initBlocks(); });
})();
