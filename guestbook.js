/* =========================================================
   KAPUR ACHARYA — WALL OF PIXELS
   16x16 pixel drawing tool -> submits to Supabase (status:
   pending) -> approved pieces are fetched and rendered in
   the gallery.
   Requires supabase-config.js loaded first.
   ========================================================= */
(function () {
  'use strict';

  const GRID_SIZE = 16;
  const PALETTE = [
    '#ffffff', '#080808', '#ff6347', '#ffb347',
    '#ffe066', '#6fcf97', '#56ccf2', '#9b51e0',
    '#f28fb1', '#a0a0a0'
  ];

  const canvas = document.getElementById('pixelCanvas');
  const paletteHost = document.getElementById('wallPalette');
  const eraserBtn = document.getElementById('wallEraser');
  const clearBtn = document.getElementById('wallClear');
  const nameInput = document.getElementById('wallName');
  const submitBtn = document.getElementById('wallSubmit');
  const statusEl = document.getElementById('wallStatus');
  const galleryGrid = document.getElementById('wallGallery');
  const galleryEmpty = document.getElementById('wallGalleryEmpty');

  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const cell = canvas.width / GRID_SIZE; // 160/16 = 10px per cell

  // grid[y][x] = hex color string or null (empty)
  let grid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));
  let activeColor = PALETTE[2];
  let erasing = false;
  let isDrawing = false;

  /* ---------------------------------------------------------
     Palette UI
  --------------------------------------------------------- */
  function buildPalette() {
    PALETTE.forEach((color, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'wall__swatch';
      btn.style.background = color;
      btn.setAttribute('aria-label', 'Color ' + color);
      if (i === 2) btn.classList.add('is-active');
      btn.addEventListener('click', () => {
        activeColor = color;
        erasing = false;
        eraserBtn.setAttribute('aria-pressed', 'false');
        paletteHost.querySelectorAll('.wall__swatch').forEach((s) => s.classList.remove('is-active'));
        btn.classList.add('is-active');
      });
      paletteHost.appendChild(btn);
    });
  }
  buildPalette();

  /* ---------------------------------------------------------
     Canvas rendering
  --------------------------------------------------------- */
  function renderGrid(targetCtx, sourceGrid, size) {
    const c = size / GRID_SIZE;
    targetCtx.clearRect(0, 0, size, size);
    targetCtx.fillStyle = '#0d0d0d';
    targetCtx.fillRect(0, 0, size, size);
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const color = sourceGrid[y][x];
        if (color) {
          targetCtx.fillStyle = color;
          targetCtx.fillRect(x * c, y * c, c, c);
        }
      }
    }
  }

  function paintCell(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.floor((clientX - rect.left) * scaleX / cell);
    const y = Math.floor((clientY - rect.top) * scaleY / cell);
    if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return;
    grid[y][x] = erasing ? null : activeColor;
    renderGrid(ctx, grid, canvas.width);
  }

  function pointerPos(e) {
    if (e.touches && e.touches[0]) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    return { x: e.clientX, y: e.clientY };
  }

  canvas.addEventListener('pointerdown', (e) => {
    isDrawing = true;
    const p = pointerPos(e);
    paintCell(p.x, p.y);
  });
  window.addEventListener('pointermove', (e) => {
    if (!isDrawing) return;
    const p = pointerPos(e);
    paintCell(p.x, p.y);
  });
  window.addEventListener('pointerup', () => { isDrawing = false; });
  canvas.addEventListener('pointerleave', () => {}); // keep drawing on drag-out, stop on pointerup

  renderGrid(ctx, grid, canvas.width);

  /* ---------------------------------------------------------
     Tools
  --------------------------------------------------------- */
  eraserBtn.addEventListener('click', () => {
    erasing = !erasing;
    eraserBtn.setAttribute('aria-pressed', String(erasing));
  });

  clearBtn.addEventListener('click', () => {
    grid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));
    renderGrid(ctx, grid, canvas.width);
  });

  /* ---------------------------------------------------------
     Submit
  --------------------------------------------------------- */
  function setStatus(msg, type) {
    statusEl.textContent = msg;
    statusEl.classList.remove('is-success', 'is-error');
    if (type) statusEl.classList.add(type);
  }

  function isGridEmpty() {
    return grid.every((row) => row.every((c) => c === null));
  }

  submitBtn.addEventListener('click', async () => {
    const name = nameInput.value.trim();
    if (!name) {
      setStatus('Add your name first.', 'is-error');
      nameInput.focus();
      return;
    }
    if (isGridEmpty()) {
      setStatus('Draw something before submitting.', 'is-error');
      return;
    }
    if (typeof supabaseClient === 'undefined') {
      setStatus('Submission is unavailable right now.', 'is-error');
      return;
    }

    submitBtn.disabled = true;
    setStatus('Submitting…');

    const { error } = await supabaseClient.from('submissions').insert({
      name: name.slice(0, 24),
      pixel_data: grid,
      status: 'pending'
    });

    submitBtn.disabled = false;

    if (error) {
      setStatus('Something went wrong. Try again.', 'is-error');
      console.error(error);
      return;
    }

    setStatus('Sent! Your piece will appear once approved.', 'is-success');
    grid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));
    renderGrid(ctx, grid, canvas.width);
    nameInput.value = '';

    document.dispatchEvent(new CustomEvent('portfolio:wall-submitted'));
  });

  /* ---------------------------------------------------------
     Gallery — load approved pieces
  --------------------------------------------------------- */
  async function loadGallery() {
    if (typeof supabaseClient === 'undefined') {
      galleryEmpty.textContent = 'Gallery unavailable right now.';
      return;
    }

    const { data, error } = await supabaseClient
      .from('submissions')
      .select('name, pixel_data, created_at')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(60);

    if (error) {
      galleryEmpty.textContent = 'Could not load the wall right now.';
      console.error(error);
      return;
    }

    if (!data || data.length === 0) {
      galleryEmpty.textContent = 'No pieces yet — be the first!';
      return;
    }

    galleryEmpty.remove();
    galleryGrid.innerHTML = '';

    data.forEach((item) => {
      const card = document.createElement('div');
      card.className = 'wall__piece';

      const pieceCanvas = document.createElement('canvas');
      pieceCanvas.width = 96;
      pieceCanvas.height = 96;
      const pieceCtx = pieceCanvas.getContext('2d');
      renderGrid(pieceCtx, item.pixel_data, 96);

      const nameEl = document.createElement('span');
      nameEl.className = 'wall__piece-name';
      nameEl.textContent = item.name;

      card.appendChild(pieceCanvas);
      card.appendChild(nameEl);
      galleryGrid.appendChild(card);
    });
  }

  loadGallery();
})();
