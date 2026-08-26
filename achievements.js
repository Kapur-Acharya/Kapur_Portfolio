/* =========================================================
   KAPUR ACHARYA — ACHIEVEMENTS & EASTER EGGS
   A tiny, dependency-free "you found something" layer.
   Unlocks are session-only (sessionStorage) so repeat visits
   in the same session don't re-fire toasts.
   ========================================================= */
(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const unlocked = new Set();
  try {
    const saved = JSON.parse(sessionStorage.getItem('kapur_achievements') || '[]');
    saved.forEach((id) => unlocked.add(id));
  } catch (e) { /* storage unavailable, ignore */ }

  function persist() {
    try {
      sessionStorage.setItem('kapur_achievements', JSON.stringify([...unlocked]));
    } catch (e) { /* ignore */ }
  }

  /* ---------------------------------------------------------
     Toast UI
  --------------------------------------------------------- */
  let toastHost = document.querySelector('.achv-host');
  if (!toastHost) {
    toastHost = document.createElement('div');
    toastHost.className = 'achv-host';
    toastHost.setAttribute('aria-live', 'polite');
    document.body.appendChild(toastHost);
  }

  function unlock(id, title, desc) {
    if (unlocked.has(id)) return;
    unlocked.add(id);
    persist();

    const toast = document.createElement('div');
    toast.className = 'achv-toast';
    toast.innerHTML =
      '<span class="achv-toast__icon">✓</span>' +
      '<span class="achv-toast__body">' +
      '<span class="achv-toast__label">Achievement unlocked</span>' +
      '<span class="achv-toast__title">' + title + '</span>' +
      '<span class="achv-toast__desc">' + desc + '</span>' +
      '</span>';
    toastHost.appendChild(toast);

    if (reduceMotion) {
      toast.classList.add('is-visible');
    } else {
      requestAnimationFrame(() => toast.classList.add('is-visible'));
    }

    setTimeout(() => {
      toast.classList.remove('is-visible');
      setTimeout(() => toast.remove(), 400);
    }, 4200);
  }

  /* ---------------------------------------------------------
     1. Full scroll — reached the footer
  --------------------------------------------------------- */
  const footer = document.querySelector('.footer');
  if (footer && 'IntersectionObserver' in window) {
    const footerObs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          unlock('scrolled', 'The Full Scroll', 'You made it to the footer. Respect.');
          footerObs.disconnect();
        }
      });
    }, { threshold: 0.1 });
    footerObs.observe(footer);
  }

  /* ---------------------------------------------------------
     2. Used the terminal
  --------------------------------------------------------- */
  document.addEventListener('portfolio:terminal-used', (e) => {
    unlock('terminal', 'Command Line Curious', 'You typed a real command into the terminal.');
    if (e.detail && e.detail.cmd === 'sudo hire kapur') {
      setTimeout(() => unlock('sudo', 'Root Access', 'sudo hire kapur — bold move.'), 600);
    }
  });

  /* ---------------------------------------------------------
     3. Konami code
  --------------------------------------------------------- */
  const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let konamiPos = 0;
  window.addEventListener('keydown', (e) => {
    const key = e.key;
    const expected = KONAMI[konamiPos];
    if (key === expected || key.toLowerCase() === expected) {
      konamiPos++;
      if (konamiPos === KONAMI.length) {
        konamiPos = 0;
        triggerKonami();
      }
    } else {
      konamiPos = key === KONAMI[0] ? 1 : 0;
    }
  });

  function triggerKonami() {
    unlock('konami', 'Old-School', 'The Konami code still works. Nice.');
    if (reduceMotion) return;
    burstConfetti();
  }

  function burstConfetti() {
    const colors = ['#ff6347', '#ffffff', '#a0a0a0'];
    const count = 60;
    const host = document.createElement('div');
    host.className = 'confetti-host';
    document.body.appendChild(host);

    for (let i = 0; i < count; i++) {
      const piece = document.createElement('span');
      piece.className = 'confetti-piece';
      const size = 6 + Math.random() * 6;
      piece.style.width = size + 'px';
      piece.style.height = size * 0.4 + 'px';
      piece.style.left = Math.random() * 100 + 'vw';
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.animationDuration = 2.2 + Math.random() * 1.6 + 's';
      piece.style.animationDelay = Math.random() * 0.3 + 's';
      piece.style.transform = `rotate(${Math.random() * 360}deg)`;
      host.appendChild(piece);
    }

    setTimeout(() => host.remove(), 4200);
  }

  /* ---------------------------------------------------------
     4. Clicked every "beyond code" card (curiosity)
  --------------------------------------------------------- */
  const beyondCards = document.querySelectorAll('.beyond-card');
  const clickedBeyond = new Set();
  beyondCards.forEach((card) => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => {
      clickedBeyond.add(card.className);
      card.classList.add('is-poked');
      if (clickedBeyond.size >= beyondCards.length) {
        unlock('beyond', 'Well Rounded', 'You checked out everything beyond code too.');
      }
    });
  });

  /* ---------------------------------------------------------
     5. Console message → matches the flavor already in script.js
  --------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    console.log(
      '%cPsst — try the Konami code: ↑ ↑ ↓ ↓ ← → ← → b a',
      'color:#FF6347;font-family:monospace;font-size:12px;'
    );
  });
})();
