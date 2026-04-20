// ===== NAVIGATION =====
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle?.addEventListener('click', () => navLinks.classList.toggle('open'));

// ===== SCROLL STATE (RAF-based) =====
let scrollY = 0;
let rafScheduled = false;

function onScroll() {
  scrollY = window.scrollY;
  if (!rafScheduled) {
    rafScheduled = true;
    requestAnimationFrame(processScroll);
  }
}

function processScroll() {
  rafScheduled = false;
  navbar.classList.toggle('scrolled', scrollY > 20);
  applyParallax();
}

window.addEventListener('scroll', onScroll, { passive: true });

// ===== PARALLAX HERO =====
const heroContent = document.querySelector('.hero-content');
const heroVisual = document.querySelector('.hero-visual');
const blob1 = document.querySelector('.blob-1');
const blob2 = document.querySelector('.blob-2');

function applyParallax() {
  if (isMobile()) return;
  const y = scrollY;
  if (heroContent) heroContent.style.transform = `translateY(${y * 0.28}px)`;
  if (heroVisual) heroVisual.style.transform = `translateY(${y * 0.14}px)`;
  if (blob1) blob1.style.transform = `translateY(${y * 0.07}px)`;
  if (blob2) blob2.style.transform = `translateY(${y * -0.04}px)`;
}

// ===== TYPEWRITER HERO =====
const phrases = [
  'Créez du contenu viral',
  'Captez l\'attention en 2s',
  'Explosez votre engagement'
];
let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;
const heroText = document.getElementById('heroText');

function typeWriter() {
  if (!heroText) return;
  const current = phrases[phraseIndex];
  heroText.textContent = isDeleting
    ? current.substring(0, charIndex - 1)
    : current.substring(0, charIndex + 1);
  if (isDeleting) charIndex--; else charIndex++;

  let delay = isDeleting ? 50 : 80;
  if (!isDeleting && charIndex === current.length) { delay = 2200; isDeleting = true; }
  else if (isDeleting && charIndex === 0) { isDeleting = false; phraseIndex = (phraseIndex + 1) % phrases.length; delay = 400; }
  setTimeout(typeWriter, delay);
}
setTimeout(typeWriter, 600);

// ===== CANVAS PARTICULES (z-depth) =====
const canvas = document.getElementById('particleCanvas');
const ctx = canvas?.getContext('2d');

if (canvas && ctx) {
  const COUNT = isMobile() ? 40 : 80;
  let particles = [];

  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  class Particle {
    constructor() { this.reset(true); }
    reset(random = false) {
      this.x = Math.random() * canvas.width;
      this.y = random ? Math.random() * canvas.height : canvas.height + 10;
      this.z = Math.random(); // 0 = far, 1 = near
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = -(Math.random() * 0.3 + 0.1) * (0.5 + this.z * 0.5);
      this.radius = 0.5 + this.z * 1.5;
      this.alpha = 0.08 + this.z * 0.45;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.y < -10) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(59,130,246,${this.alpha})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < COUNT; i++) particles.push(new Particle());

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          const depthAlpha = (particles[i].z + particles[j].z) / 2;
          const alpha = (1 - dist / 120) * 0.1 * depthAlpha;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(59,130,246,${alpha})`;
          ctx.lineWidth = 0.6 + depthAlpha * 0.4;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.sort((a, b) => a.z - b.z);
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    requestAnimationFrame(animate);
  }
  animate();
}

// ===== 3D TILT ON CARDS =====
function isMobile() { return window.innerWidth < 768; }

const TILT_SELECTORS = '.feature-card, .mode-card, .pricing-card, .preview-card';

function applyTilt(el, e) {
  const rect = el.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const dx = (e.clientX - cx) / (rect.width / 2);
  const dy = (e.clientY - cy) / (rect.height / 2);
  const rotX = -dy * 10;
  const rotY = dx * 10;
  el.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(8px)`;
}

function resetTilt(el) {
  el.style.transform = '';
  el.style.transition = 'transform 0.6s cubic-bezier(0.16,1,0.3,1), border-color 0.3s, box-shadow 0.3s';
  setTimeout(() => { el.style.transition = ''; }, 650);
}

if (!isMobile()) {
  document.querySelectorAll(TILT_SELECTORS).forEach(el => {
    el.addEventListener('mousemove', e => applyTilt(el, e), { passive: true });
    el.addEventListener('mouseleave', () => resetTilt(el));
  });
}

window.addEventListener('resize', () => {
  if (isMobile()) {
    document.querySelectorAll(TILT_SELECTORS).forEach(el => {
      el.style.transform = '';
    });
  }
}, { passive: true });

// ===== SCROLL REVEAL =====
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
