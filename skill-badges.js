/* =========================================================
   KAPUR ACHARYA — SKILL BADGE INTERACTION
   Click a badge to cycle its level indicator. Purely cosmetic,
   purely client-side, no state persisted beyond the session tab.
   ========================================================= */
(function () {
  'use strict';

  const LEVELS = ['', 'is-lv1', 'is-lv2', 'is-lv3'];
  const LEVEL_LABELS = ['', 'Familiar', 'Comfortable', 'Confident'];

  const badges = document.querySelectorAll('.skill-badges .badge');
  if (!badges.length) return;

  badges.forEach((badge) => {
    let level = 0;
    badge.setAttribute('role', 'button');
    badge.setAttribute('tabindex', '0');
    badge.setAttribute('aria-label', badge.textContent.trim() + ' — click to rate familiarity');

    const bump = () => {
      LEVELS.forEach((c) => c && badge.classList.remove(c));
      level = (level + 1) % LEVELS.length;
      if (LEVELS[level]) badge.classList.add(LEVELS[level]);
      badge.setAttribute(
        'aria-label',
        badge.textContent.trim() + (LEVEL_LABELS[level] ? ' — ' + LEVEL_LABELS[level] : ' — click to rate familiarity')
      );

      if (level > 0) {
        badge.classList.add('is-bumped');
        setTimeout(() => badge.classList.remove('is-bumped'), 260);
      }
    };

    badge.addEventListener('click', bump);
    badge.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        bump();
      }
    });
  });
})();
