/* =========================================================
   KAPUR ACHARYA — INTERACTIVE TERMINAL
   Turns the hero terminal into a real (tiny, safe) command line.
   No dependencies. No network calls. Pure client-side fun.
   ========================================================= */
(function () {
  'use strict';

  const root = document.getElementById('heroTerminal');
  if (!root) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------
     Command definitions
     Each returns an array of output lines (strings).
     Lines can start with "@accent:" to render in accent color.
  --------------------------------------------------------- */
  const COMMANDS = {
    help() {
      return [
        'Available commands:',
        '  about       — who is Kapur',
        '  skills      — tech I use / am learning',
        '  projects    — featured work',
        '  contact     — how to reach me',
        '  socials     — GitHub / LinkedIn / Email',
        '  sudo hire kapur — try it',
        '  clear       — clear the terminal',
        '  help        — show this list again',
      ];
    },
    about() {
      return [
        'Kapur Acharya — BIT student, builder.',
        'Into web dev, DSA, games, and filmmaking.',
        'Currently learning the MERN stack.',
        'Type "projects" to see what I\'ve built.',
      ];
    },
    skills() {
      return [
        'Frontend  : HTML5, CSS3, JavaScript, Responsive Design',
        'Learning  : Node.js, Express.js, MongoDB, REST APIs',
        'Languages : JavaScript, C++',
        'Tools     : Git, GitHub, VS Code',
      ];
    },
    projects() {
      return [
        '01. MoodMatch — mood-based movie recommender',
        '    -> kapur-acharya.github.io/Moodwatch',
        '02. DirectCollab — creator x brand platform (WIP)',
        'Scroll to #project or type "open moodmatch"',
      ];
    },
    contact() {
      return [
        'Email : kapur.builds@gmail.com',
        'Say hi any time — I reply.',
      ];
    },
    socials() {
      return [
        'GitHub   : github.com/kapur-acharya',
        'LinkedIn : linkedin.com/in/kapur-acharya',
        'Email    : kapur.builds@gmail.com',
      ];
    },
    whoami() {
      return ['kapur'];
    },
    date() {
      return [new Date().toString()];
    },
    echo(args) {
      return [args.join(' ') || ''];
    },
    'open moodmatch'() {
      window.open('https://kapur-acharya.github.io/Moodwatch/', '_blank', 'noopener');
      return ['Opening MoodMatch in a new tab...'];
    },
    'sudo hire kapur'() {
      return [
        'Permission granted.',
        '@accent:Redirecting to contact section...',
      ];
    },
  };

  const ALIASES = {
    ls: 'help',
    clear: '__clear__',
    cls: '__clear__',
  };

  /* ---------------------------------------------------------
     DOM setup — build an input line under the typed intro
  --------------------------------------------------------- */
  function buildPrompt() {
    const wrap = document.createElement('div');
    wrap.className = 'term-input-line';
    wrap.innerHTML =
      '<span class="term-prompt">$</span>' +
      '<input type="text" class="term-input" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Terminal command input" placeholder="type help" />';
    return wrap;
  }

  function appendLine(text, cls) {
    const div = document.createElement('div');
    div.className = cls || 'term-out';
    if (text.startsWith('@accent:')) {
      div.classList.add('term-prompt');
      text = text.slice(8);
    }
    div.textContent = text;
    root.insertBefore(div, promptLine);
    root.scrollTop = root.scrollHeight;
  }

  function runCommand(raw) {
    const cmd = raw.trim();
    if (!cmd) return;

    appendLine('$ ' + cmd, 'term-prompt');

    const lower = cmd.toLowerCase();
    let key = lower;
    if (ALIASES[lower]) key = ALIASES[lower];

    if (key === '__clear__') {
      Array.from(root.querySelectorAll('.term-out, .term-prompt')).forEach((el) => {
        if (el !== promptLine.firstElementChild) el.remove();
      });
      return;
    }

    const [first, ...rest] = lower.split(' ');
    let handler = COMMANDS[lower] || COMMANDS[first];
    let args = rest;

    if (!handler) {
      appendLine(`command not found: ${cmd}`, 'term-out');
      appendLine('type "help" for a list of commands', 'term-out');
      return;
    }

    const lines = handler(args) || [];
    lines.forEach((l) => appendLine(l, 'term-out'));

    if (key === 'sudo hire kapur') {
      setTimeout(() => {
        const contact = document.getElementById('contact');
        if (contact) contact.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
      }, 500);
    }

    document.dispatchEvent(new CustomEvent('portfolio:terminal-used', { detail: { cmd: lower } }));
  }

  /* ---------------------------------------------------------
     Attach after the intro typing finishes
  --------------------------------------------------------- */
  let promptLine;
  const history = [];
  let historyIdx = -1;

  function attachInput() {
    if (root.querySelector('.term-input-line')) return;
    promptLine = buildPrompt();
    root.appendChild(promptLine);
    const input = promptLine.querySelector('.term-input');

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = input.value;
        if (val.trim()) {
          history.push(val);
          historyIdx = history.length;
        }
        input.value = '';
        runCommand(val);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (historyIdx > 0) { historyIdx--; input.value = history[historyIdx] || ''; }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIdx < history.length) {
          historyIdx++;
          input.value = history[historyIdx] || '';
        }
      }
    });

    // Clicking anywhere in the terminal focuses the input (feels alive)
    root.addEventListener('click', () => input.focus());
  }

  // Wait for the existing typing effect to finish, then attach.
  // The hero terminal is typed via IntersectionObserver in script.js;
  // we poll briefly for the cursor element it appends when done.
  const observer = new MutationObserver(() => {
    if (root.querySelector('.terminal__cursor') || root.children.length > 2) {
      attachInput();
    }
  });
  observer.observe(root, { childList: true });

  // Fallback: if reduced motion, script.js fills instantly — attach soon after.
  setTimeout(attachInput, reduceMotion ? 300 : 4000);
})();
