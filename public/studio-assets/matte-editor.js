(function () {
  'use strict';
  const Core = window.SahwaMatting, Portrait = window.SahwaPortrait;
  const dialog = document.getElementById('matte-dialog');
  const canvas = document.getElementById('matte-canvas'), ctx = canvas.getContext('2d');
  const stage = document.getElementById('matte-stage');
  const undo = document.getElementById('matte-undo'), save = document.getElementById('matte-save');
  const message = document.getElementById('matte-message'), size = document.getElementById('matte-size');
  const zoom = document.getElementById('matte-zoom');
  let current = null, mode = 'erase', activeStroke = null, lastPoint = null, painting = false;
  function selectMode(value) {
    mode = value;
    document.querySelectorAll('[data-matte-mode]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.matteMode === mode)));
  }
  function layout() {
    if (!current) return;
    const fit = Math.min((stage.clientWidth - 24) / canvas.width, 520 / canvas.height, 1);
    canvas.style.width = `${Math.max(1, canvas.width * fit * Number(zoom.value))}px`;
    canvas.style.height = 'auto';
    document.getElementById('matte-zoom-value').textContent = `${Math.round(Number(zoom.value) * 100)}%`;
  }
  function draw(region) {
    if (!current) return;
    const left = region ? Math.max(0, Math.floor(region.left)) : 0, top = region ? Math.max(0, Math.floor(region.top)) : 0;
    const right = region ? Math.min(canvas.width, Math.ceil(region.right)) : canvas.width, bottom = region ? Math.min(canvas.height, Math.ceil(region.bottom)) : canvas.height;
    if (right <= left || bottom <= top) return;
    for (let y = top; y < bottom; y++) for (let x = left; x < right; x++) {
      const i = y * canvas.width + x;
      current.preview.data[i * 4 + 3] = Math.round(current.alpha[i] * 255);
      const colors = current.alpha[i] > current.baseColors[i * 4 + 3] / 255 + 0.001 ? current.originalPixels.data : current.baseColors;
      for (let c = 0; c < 3; c++) current.preview.data[i * 4 + c] = colors[i * 4 + c];
    }
    ctx.putImageData(current.preview, 0, 0, left, top, right - left, bottom - top);
    undo.disabled = !current.history.length || current.saving;
  }
  function finishStroke() {
    if (!painting) return;
    if (activeStroke?.size) { current.history.push(activeStroke); if (current.history.length > 8) current.history.shift(); }
    painting = false; activeStroke = null; lastPoint = null; undo.disabled = !current.history.length || current.saving;
  }
  function point(event) {
    const rect = canvas.getBoundingClientRect();
    return { x: (event.clientX - rect.left) * canvas.width / rect.width, y: (event.clientY - rect.top) * canvas.height / rect.height, radius: Number(size.value) * canvas.width / rect.width / 2 };
  }
  function paint(event) {
    if (!painting || !current || current.saving) return;
    const p = point(event), start = lastPoint || p;
    const steps = Math.max(1, Math.ceil(Math.hypot(p.x - start.x, p.y - start.y) / Math.max(1, p.radius * 0.3)));
    for (let step = 1; step <= steps; step++) Core.paintAlpha(current.alpha, canvas.width, canvas.height,
      start.x + (p.x - start.x) * step / steps, start.y + (p.y - start.y) * step / steps, p.radius, mode, activeStroke);
    lastPoint = p; draw({ left: Math.min(start.x, p.x) - p.radius - 1, top: Math.min(start.y, p.y) - p.radius - 1,
      right: Math.max(start.x, p.x) + p.radius + 1, bottom: Math.max(start.y, p.y) + p.radius + 1 });
  }
  canvas.addEventListener('pointerdown', event => {
    if (!current || current.saving || (event.pointerType === 'mouse' && event.button !== 0)) return;
    event.preventDefault(); painting = true; activeStroke = new Map(); lastPoint = null;
    canvas.setPointerCapture(event.pointerId); paint(event);
  });
  canvas.addEventListener('pointermove', paint);
  canvas.addEventListener('pointerup', finishStroke);
  canvas.addEventListener('pointercancel', finishStroke);
  document.querySelectorAll('[data-matte-mode]').forEach(button => button.addEventListener('click', () => selectMode(button.dataset.matteMode)));
  undo.addEventListener('click', () => {
    if (!current || current.saving) return;
    finishStroke(); const before = current.history.pop(); if (before) Core.undoStroke(current.alpha, before); draw();
  });
  zoom.addEventListener('input', layout);
  size.addEventListener('input', () => { document.getElementById('matte-size-value').textContent = `${size.value} px`; });
  document.getElementById('matte-background').addEventListener('change', event => { stage.dataset.background = event.target.value; });
  window.addEventListener('resize', layout);
  function finish(blob = null) {
    if (!current) return;
    const resolve = current.resolve; current = null; painting = false; activeStroke = null; lastPoint = null;
    dialog.close(); canvas.width = canvas.height = 1; resolve(blob);
  }
  dialog.addEventListener('cancel', event => { event.preventDefault(); if (!current?.saving) finish(); });
  document.getElementById('matte-cancel').addEventListener('click', () => { if (!current?.saving) finish(); });
  save.addEventListener('click', async () => {
    if (!current || current.saving) return;
    finishStroke(); current.saving = true; save.disabled = true;
    dialog.querySelectorAll('button,input,select').forEach(control => { control.disabled = true; });
    try {
      const blob = await Portrait.refinePersonBackground(current.original, canvas.width, canvas.height, current.alpha,
        text => { message.textContent = text; });
      finish(blob);
    } catch (error) { message.textContent = error.message || 'تعذّر حفظ الحواف. جرّب مجددًا.'; }
    finally {
      dialog.querySelectorAll('button,input,select').forEach(control => { control.disabled = false; });
      if (current) { current.saving = false; draw(); }
    }
  });
  window.SahwaMatteEditor = {
    edit(original, cutout) {
      if (current) return Promise.reject(new Error('أغلق مراجعة الحواف الحالية أولًا.'));
      const originalPixels = Portrait.imagePixels(original);
      const preview = Portrait.imagePixels(cutout, originalPixels.width, originalPixels.height);
      const alpha = Float32Array.from({ length: originalPixels.width * originalPixels.height }, (_, i) => preview.data[i * 4 + 3] / 255);
      canvas.width = preview.width; canvas.height = preview.height; zoom.value = '1';
      message.textContent = 'كبّر الحواف، ثم امسح الزائد أو استعد الجزء الناقص. حفظ التعديلات ينقّي ألوان الحواف.';
      return new Promise(resolve => {
        current = { original, originalPixels, preview, baseColors: new Uint8ClampedArray(preview.data), alpha, history: [], resolve, saving: false };
        selectMode('erase'); dialog.showModal(); layout(); draw();
      });
    }
  };
})();
