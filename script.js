/* =========================================================
   KAPUR ACHARYA — PORTFOLIO SCRIPT
   ========================================================= */
(function () {
  'use strict';

  console.log(
    '%cHey, looking at the code?',
    'color:#FF6347;font-family:monospace;font-size:14px;'
  );
  console.log(
    '%c- built by Kapur, HTML/CSS/JS, no framework. Say hi: kapur.builds@gmail.com',
    'color:#A0A0A0;font-family:monospace;font-size:12px;'
  );

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------
     1. NAV: scroll state + active link highlighting
  --------------------------------------------------------- */
  const nav = document.getElementById('nav');
  const navLinks = document.querySelectorAll('[data-nav]');
  const sections = document.querySelectorAll('main section[id]');

  function onScrollNav() {
    nav.classList.toggle('is-scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', onScrollNav, { passive: true });
  onScrollNav();

  if ('IntersectionObserver' in window && sections.length) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navLinks.forEach((link) => {
              link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`);
            });
          }
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );
    sections.forEach((s) => navObserver.observe(s));
  }

  /* ---------------------------------------------------------
     2. MOBILE MENU
  --------------------------------------------------------- */
  const navToggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileLinks = document.querySelectorAll('[data-nav-mobile]');

  function closeMobileMenu() {
    mobileMenu.classList.remove('is-open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open menu');
    document.body.style.overflow = '';
  }
  function openMobileMenu() {
    mobileMenu.classList.add('is-open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Close menu');
    document.body.style.overflow = 'hidden';
  }
  navToggle.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.contains('is-open');
    isOpen ? closeMobileMenu() : openMobileMenu();
  });
  mobileLinks.forEach((link) => link.addEventListener('click', closeMobileMenu));
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMobileMenu();
  });

  /* ---------------------------------------------------------
     3. SMOOTH SCROLL for scroll cue
  --------------------------------------------------------- */
  const scrollCue = document.getElementById('scrollCue');
  if (scrollCue) {
    scrollCue.addEventListener('click', () => {
      const skills = document.getElementById('skills');
      if (skills) skills.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* ---------------------------------------------------------
     4. SCROLL REVEAL
  --------------------------------------------------------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            // slight stagger for elements revealed together
            const delay = reduceMotion ? 0 : Math.min(i * 40, 200);
            setTimeout(() => entry.target.classList.add('is-visible'), delay);
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------------------------------------------------------
     5. TERMINAL TYPING EFFECT
  --------------------------------------------------------- */
  function typeTerminal(container, lines, opts = {}) {
    if (!container) return;
    if (reduceMotion) {
      container.innerHTML = lines
        .map((l) => (l.type === 'prompt' ? `<span class="term-prompt">${l.text}</span>` : `<span class="term-out">${l.text}</span>`))
        .join('\n');
      return;
    }

    const speed = opts.speed || 28;
    let lineIndex = 0;
    let charIndex = 0;
    container.innerHTML = '';

    const cursor = document.createElement('span');
    cursor.className = 'terminal__cursor';

    function typeNextChar() {
      if (lineIndex >= lines.length) {
        container.appendChild(cursor);
        return;
      }
      const line = lines[lineIndex];
      const span = container.querySelector(`[data-line="${lineIndex}"]`) || (() => {
        const s = document.createElement('div');
        s.setAttribute('data-line', lineIndex);
        s.className = line.type === 'prompt' ? 'term-prompt' : 'term-out';
        container.appendChild(s);
        return s;
      })();

      if (charIndex < line.text.length) {
        span.textContent += line.text.charAt(charIndex);
        charIndex++;
        setTimeout(typeNextChar, speed + Math.random() * 20);
      } else {
        lineIndex++;
        charIndex = 0;
        setTimeout(typeNextChar, line.pause || 220);
      }
    }
    typeNextChar();
  }

  const heroLines = [
    { type: 'prompt', text: '$ whoami' },
    { type: 'out', text: 'Kapur Acharya' },
    { type: 'prompt', text: '$ interests' },
    { type: 'out', text: 'web development, programming, digital art' },
    { type: 'prompt', text: '$ currently' },
    { type: 'out', text: 'building & learning' },
  ];

  const sigLines = [
    { type: 'prompt', text: '$ whoami' },
    { type: 'out', text: 'Kapur Acharya' },
    { type: 'prompt', text: '$ currently_learning' },
    { type: 'out', text: 'React / Node / MongoDB' },
    { type: 'prompt', text: '$ goal' },
    { type: 'out', text: 'Build -> Learn -> Repeat' },
    { type: 'prompt', text: '$ status' },
    { type: 'out', text: '● Online' },
  ];

  function startTerminalWhenVisible(el, lines) {
    if (!el) return;
    if (!('IntersectionObserver' in window)) {
      typeTerminal(el, lines);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            typeTerminal(el, lines);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    obs.observe(el);
  }

  startTerminalWhenVisible(document.getElementById('heroTerminal'), heroLines);
  startTerminalWhenVisible(document.getElementById('sigTerminal'), sigLines);

  /* ---------------------------------------------------------
     6. PARTICLE BACKGROUND (subtle floating dots)
  --------------------------------------------------------- */
  const canvas = document.getElementById('particles');
  const skipParticles = window.innerWidth < 560 || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2);
  if (canvas && !reduceMotion && !skipParticles) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let width, height;
    let animId;

    function resize() {
      width = canvas.width = canvas.offsetWidth * devicePixelRatio;
      height = canvas.height = canvas.offsetHeight * devicePixelRatio;
    }

    function createParticles() {
      const count = Math.min(60, Math.floor((window.innerWidth * window.innerHeight) / 28000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: (Math.random() * 1.4 + 0.4) * devicePixelRatio,
        vx: (Math.random() - 0.5) * 0.15 * devicePixelRatio,
        vy: (Math.random() - 0.5) * 0.15 * devicePixelRatio,
        alpha: Math.random() * 0.4 + 0.1,
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${p.alpha})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    }

    function init() {
      resize();
      createParticles();
      cancelAnimationFrame(animId);
      draw();
    }

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(init, 200);
    });

    init();
  }

  /* ---------------------------------------------------------
     7. CUSTOM CURSOR (desktop only)
  --------------------------------------------------------- */
  const isCoarsePointer = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  if (!isCoarsePointer && !reduceMotion) {
    const dot = document.querySelector('.cursor-dot');
    const ring = document.querySelector('.cursor-ring');
    document.body.classList.add('cursor-ready');

    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
    });

    function animateRing() {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
      requestAnimationFrame(animateRing);
    }
    animateRing();

    const interactiveEls = document.querySelectorAll('a, button, .badge, .do-card, .beyond-card, .explore-card');
    interactiveEls.forEach((el) => {
      el.addEventListener('mouseenter', () => ring.classList.add('is-active'));
      el.addEventListener('mouseleave', () => ring.classList.remove('is-active'));
    });
  }
})();
