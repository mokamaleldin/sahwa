(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SahwaPortrait = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const scriptUrl = typeof document !== 'undefined' ? document.currentScript?.src || location.href : '';
  let worker = null, nextJob = 0;
  const jobs = new Map();
  function canvas(width, height, createCanvas) {
    const output = createCanvas ? createCanvas(width, height) : document.createElement('canvas');
    output.width = width; output.height = height; return output;
  }
  function alphaBounds(data, width, height) {
    let left = width, top = height, right = -1, bottom = -1, transparent = 0;
    for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha < 240) transparent++;
      if (alpha <= 1) continue;
      left = Math.min(left, x); top = Math.min(top, y); right = Math.max(right, x); bottom = Math.max(bottom, y);
    }
    if (right < 0) return null;
    return { left, top, right: right + 1, bottom: bottom + 1, hasTransparency: transparent > width * height * 0.001 };
  }
  function trimPhoto(image, createCanvas) {
    const ratio = Math.min(1, 512 / Math.max(image.width, image.height));
    const sample = canvas(Math.max(1, Math.round(image.width * ratio)), Math.max(1, Math.round(image.height * ratio)), createCanvas);
    const ctx = sample.getContext('2d', { willReadFrequently: true }); ctx.drawImage(image, 0, 0, sample.width, sample.height);
    const bounds = alphaBounds(ctx.getImageData(0, 0, sample.width, sample.height).data, sample.width, sample.height);
    if (!bounds) throw new Error('الصورة شفافة بالكامل. اختر صورة يظهر فيها محتوى.');
    if (!bounds.hasTransparency) return { image, hasTransparency: false };
    // Leave a small margin so antialiasing and hair at the alpha boundary remain.
    const left = Math.max(0, Math.floor((bounds.left - 2) / ratio));
    const top = Math.max(0, Math.floor((bounds.top - 2) / ratio));
    const right = Math.min(image.width, Math.ceil((bounds.right + 2) / ratio));
    const bottom = Math.min(image.height, Math.ceil((bounds.bottom + 2) / ratio));
    const width = right - left, height = bottom - top, scale = Math.min(1, 3000 / Math.max(width, height));
    const cropped = canvas(Math.max(1, Math.round(width * scale)), Math.max(1, Math.round(height * scale)), createCanvas);
    cropped.getContext('2d').drawImage(image, left, top, width, height, 0, 0, cropped.width, cropped.height);
    return { image: cropped, hasTransparency: true };
  }
  function confidenceAlpha(values) {
    return Uint8ClampedArray.from(values, value => Math.round(Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0)) * 255));
  }
  function failWorker() {
    worker?.terminate(); worker = null;
    for (const job of jobs.values()) { clearTimeout(job.timer); job.reject(new Error('تعذّر تشغيل أداة التفريغ. أعد المحاولة أو استخدم صورة PNG مفرغة.')); }
    jobs.clear();
  }
  function runWorker(payload, onStatus) {
    if (!globalThis.WebAssembly || !globalThis.Worker) return Promise.reject(new Error('التفريغ غير مدعوم في هذا المتصفح. استخدم إصدارًا حديثًا أو ارفع صورة PNG مفرغة.'));
    if (!worker) {
      worker = new Worker(new URL('matting-worker.js?v=1.5.0', scriptUrl), { type: 'module' });
      worker.onerror = failWorker;
      worker.onmessage = ({ data }) => {
        const job = jobs.get(data.id); if (!job) return;
        if (data.status) { job.onStatus(data.status); return; }
        clearTimeout(job.timer); jobs.delete(data.id);
        if (data.error) job.reject(new Error(data.error)); else job.resolve(data);
      };
    }
    return new Promise((resolve, reject) => {
      const id = ++nextJob;
      jobs.set(id, { resolve, reject, onStatus, timer: setTimeout(failWorker, 180000) });
      const transfer = [payload.rgba]; if (payload.alpha) transfer.push(payload.alpha);
      worker.postMessage({ ...payload, id }, transfer);
    });
  }
  function imagePixels(image, width, height) {
    if (!width || !height) {
      const ratio = Math.min(1, 2048 / Math.max(image.width, image.height));
      width = Math.max(1, Math.round(image.width * ratio)); height = Math.max(1, Math.round(image.height * ratio));
    }
    const picture = canvas(width, height), ctx = picture.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(image, 0, 0, width, height);
    return ctx.getImageData(0, 0, width, height);
  }
  function pngBlob(output) {
    const picture = canvas(output.width, output.height), ctx = picture.getContext('2d');
    const pixels = ctx.createImageData(output.width, output.height); pixels.data.set(new Uint8ClampedArray(output.rgba));
    ctx.putImageData(pixels, 0, 0);
    return new Promise((resolve, reject) => picture.toBlob(blob => {
      picture.width = picture.height = 1;
      if (blob) resolve(blob); else reject(new Error('تعذّر تجهيز الصورة المفرغة.'));
    }, 'image/png'));
  }
  async function removePersonBackground(image, onStatus = () => {}) {
    const pixels = imagePixels(image);
    return pngBlob(await runWorker({ action: 'remove', width: pixels.width, height: pixels.height, rgba: pixels.data.buffer }, onStatus));
  }
  async function refinePersonBackground(original, width, height, alpha, onStatus = () => {}) {
    const pixels = imagePixels(original, width, height);
    return pngBlob(await runWorker({ action: 'refine', width, height, rgba: pixels.data.buffer, alpha: new Float32Array(alpha).buffer }, onStatus));
  }
  return { alphaBounds, trimPhoto, confidenceAlpha, imagePixels, removePersonBackground, refinePersonBackground };
});
