/* =============================================
   XENOS | SPACE — script.js
   Structured: init collection → logic → DOMContentLoaded
   ============================================= */

'use strict';

/* ═══════════════════════════════════════════════
   ██████╗  INIT COLLECTION  ██████╗
   All init() calls are gathered here.
   Called once from DOMContentLoaded below.
═══════════════════════════════════════════════ */
function initAll() {
  initStarCanvas();
  initNavbar();
  initHamburger();
  initTypingEffect();
  initCounterAnimation();
  initScrollReveal();
  initTiltEffect();
  initPlanetScroll();
  initActiveNavLink();
  initParallaxHero();
}


/* ═══════════════════════════════════════════════
   ██  INIT LOGIC FUNCTIONS  ██
   Each init function contains its full logic.
═══════════════════════════════════════════════ */

/* ─── 1. STAR CANVAS ─────────────────────────── */
function initStarCanvas() {
  const canvas = document.getElementById('starCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let stars = [];
  let shootingStars = [];
  let animFrameId = null;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    buildStars();
  }

  function buildStars() {
    stars = [];
    const count = Math.floor((canvas.width * canvas.height) / 4000);
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.4 + 0.2,
        a: Math.random() * 0.8 + 0.2,
        speed: Math.random() * 0.3 + 0.05,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinkleDir: 1,
      });
    }
  }

  function spawnShootingStar() {
    if (Math.random() < 0.003) {
      shootingStars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * 0.5,
        len: Math.random() * 120 + 60,
        speed: Math.random() * 10 + 8,
        a: 1,
        angle: Math.PI / 4 + (Math.random() - 0.5) * 0.4,
      });
    }
  }

  function drawStars() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw stars
    stars.forEach(s => {
      s.a += s.twinkleSpeed * s.twinkleDir;
      if (s.a >= 1) { s.a = 1; s.twinkleDir = -1; }
      if (s.a <= 0.1) { s.a = 0.1; s.twinkleDir = 1; }

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(180, 210, 255, ${s.a})`;
      ctx.fill();
    });

    // Draw shooting stars
    spawnShootingStar();
    shootingStars = shootingStars.filter(ss => ss.a > 0);
    shootingStars.forEach(ss => {
      const dx = Math.cos(ss.angle) * ss.len;
      const dy = Math.sin(ss.angle) * ss.len;
      const grad = ctx.createLinearGradient(ss.x, ss.y, ss.x - dx, ss.y - dy);
      grad.addColorStop(0, `rgba(100, 170, 255, ${ss.a})`);
      grad.addColorStop(1, 'rgba(100, 170, 255, 0)');
      ctx.beginPath();
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5;
      ctx.moveTo(ss.x, ss.y);
      ctx.lineTo(ss.x - dx, ss.y - dy);
      ctx.stroke();

      ss.x += Math.cos(ss.angle) * ss.speed;
      ss.y += Math.sin(ss.angle) * ss.speed;
      ss.a -= 0.02;
    });

    animFrameId = requestAnimationFrame(drawStars);
  }

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 200);
  });

  resize();
  drawStars();
}


/* ─── 2. NAVBAR SCROLL ───────────────────────── */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  let lastY = 0;
  let ticking = false;

  function onScroll() {
    const y = window.scrollY;
    if (!ticking) {
      requestAnimationFrame(() => {
        navbar.classList.toggle('scrolled', y > 20);
        lastY = y;
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // initial check
}


/* ─── 3. HAMBURGER MENU ──────────────────────── */
function initHamburger() {
  const btn = document.getElementById('hamburger');
  const menu = document.getElementById('mobileMenu');
  const mobLinks = document.querySelectorAll('.mob-link');
  if (!btn || !menu) return;

  let isOpen = false;

  function openMenu() {
    isOpen = true;
    btn.classList.add('open');
    menu.classList.add('open');
    document.body.style.overflow = 'hidden';
    btn.setAttribute('aria-expanded', 'true');
  }

  function closeMenu() {
    isOpen = false;
    btn.classList.remove('open');
    menu.classList.remove('open');
    document.body.style.overflow = '';
    btn.setAttribute('aria-expanded', 'false');
  }

  function toggleMenu() {
    isOpen ? closeMenu() : openMenu();
  }

  btn.addEventListener('click', toggleMenu);

  // Close on mobile link tap
  mobLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });

  // Close on overlay click (clicking the dark area behind menu)
  menu.addEventListener('click', (e) => {
    if (e.target === menu || e.target.classList.contains('mobile-menu-bg')) {
      closeMenu();
    }
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) closeMenu();
  });
}


/* ─── 4. TYPING EFFECT ───────────────────────── */
function initTypingEffect() {
  const el = document.getElementById('typingText');
  if (!el) return;

  const phrases = [
    'EXPLORE THE COSMOS',
    'CHART THE GALAXIES',
    'DISCOVER DEEP SPACE',
    'UNRAVEL THE UNIVERSE',
    'STUDY THE STARS',
  ];

  let phraseIdx = 0;
  let charIdx = 0;
  let isDeleting = false;
  let delay = 100;
  let pauseAfterType = 2200;
  let pauseAfterDelete = 500;

  function type() {
    const current = phrases[phraseIdx];

    if (isDeleting) {
      el.textContent = current.substring(0, charIdx - 1);
      charIdx--;
      delay = 55;
    } else {
      el.textContent = current.substring(0, charIdx + 1);
      charIdx++;
      delay = 90;
    }

    if (!isDeleting && charIdx === current.length) {
      isDeleting = true;
      delay = pauseAfterType;
    } else if (isDeleting && charIdx === 0) {
      isDeleting = false;
      phraseIdx = (phraseIdx + 1) % phrases.length;
      delay = pauseAfterDelete;
    }

    setTimeout(type, delay);
  }

  // Small initial delay
  setTimeout(type, 400);
}


/* ─── 5. COUNTER ANIMATION ───────────────────── */
function initCounterAnimation() {
  const counters = document.querySelectorAll('.stat-num[data-target]');
  if (!counters.length) return;

  let started = false;

  function animateCounters() {
    counters.forEach(counter => {
      const target = parseInt(counter.getAttribute('data-target'), 10);
      const duration = 2000;
      const step = target / (duration / 16);
      let current = 0;

      function update() {
        current = Math.min(current + step, target);
        counter.textContent = Math.floor(current).toLocaleString();
        if (current < target) requestAnimationFrame(update);
      }

      requestAnimationFrame(update);
    });
  }

  // Trigger only when hero stats are visible
  const heroStats = document.querySelector('.hero-stats');
  if (!heroStats) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !started) {
        started = true;
        animateCounters();
        observer.disconnect();
      }
    });
  }, { threshold: 0.5 });

  observer.observe(heroStats);
}


/* ─── 6. SCROLL REVEAL ───────────────────────── */
function initScrollReveal() {
  // Add reveal class to eligible elements
  const targets = [
    '.dash-card',
    '.gal-card',
    '.planet-item',
    '.mission-card',
    '.obs-feature',
    '.section-header',
  ];

  targets.forEach(selector => {
    document.querySelectorAll(selector).forEach((el, i) => {
      el.classList.add('reveal');
      el.style.transitionDelay = `${i * 0.07}s`;
    });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px',
  });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}


/* ─── 7. TILT EFFECT ─────────────────────────── */
function initTiltEffect() {
  const cards = document.querySelectorAll('[data-tilt]');
  if (!cards.length) return;

  // Skip tilt on touch devices (performance)
  if (window.matchMedia('(hover: none)').matches) return;

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const rotX = ((y - cy) / cy) * -8;
      const rotY = ((x - cx) / cx) * 8;

      card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-4px)`;
      card.style.transition = 'transform 0.1s ease';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0)';
      card.style.transition = 'transform 0.4s ease';
    });
  });
}


/* ─── 8. PLANET SCROLL ───────────────────────── */
function initPlanetScroll() {
  const track = document.getElementById('planetScroll');
  if (!track) return;

  let isDown = false;
  let startX;
  let scrollLeft;

  // Mouse drag scroll
  track.addEventListener('mousedown', (e) => {
    isDown = true;
    track.style.cursor = 'grabbing';
    startX = e.pageX - track.offsetLeft;
    scrollLeft = track.scrollLeft;
  });

  track.addEventListener('mouseleave', () => {
    isDown = false;
    track.style.cursor = '';
  });

  track.addEventListener('mouseup', () => {
    isDown = false;
    track.style.cursor = '';
  });

  track.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - track.offsetLeft;
    const walk = (x - startX) * 1.5;
    track.scrollLeft = scrollLeft - walk;
  });

  // Touch momentum is handled natively by -webkit-overflow-scrolling: touch
}


/* ─── 9. ACTIVE NAV LINK (SCROLL SPY) ───────── */
function initActiveNavLink() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  if (!sections.length || !navLinks.length) return;

  function setActive() {
    const scrollY = window.scrollY + 120;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollY >= top && scrollY < top + height) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', setActive, { passive: true });
  setActive();
}


/* ─── 10. PARALLAX HERO ──────────────────────── */
function initParallaxHero() {
  const heroVisual = document.querySelector('.hero-visual');
  if (!heroVisual) return;

  // Only on desktop
  if (window.matchMedia('(max-width: 900px)').matches) return;

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const y = window.scrollY;
        heroVisual.style.transform = `translateY(${y * 0.12}px)`;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}


/* ═══════════════════════════════════════════════
   ██  DOM CONTENT LOADED  ██
   Entry point — waits for DOM, then runs initAll()
═══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initAll();
});