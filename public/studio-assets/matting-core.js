(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SahwaMatting = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const clamp = value => Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
  function dimensions(width, height, longest = 1024) {
    const scale = Math.min(1, longest / Math.max(width, height));
    const scaledWidth = Math.max(1, Math.round(width * scale));
    const scaledHeight = Math.max(1, Math.round(height * scale));
    return { scaledWidth, scaledHeight, width: Math.max(32, Math.ceil(scaledWidth / 32) * 32), height: Math.max(32, Math.ceil(scaledHeight / 32) * 32) };
  }
  function sample(data, width, height, x, y, stride = 1, channel = 0) {
    x = Math.max(0, Math.min(width - 1, x)); y = Math.max(0, Math.min(height - 1, y));
    const x0 = Math.floor(x), y0 = Math.floor(y), x1 = Math.min(width - 1, x0 + 1), y1 = Math.min(height - 1, y0 + 1);
    const dx = x - x0, dy = y - y0;
    const at = (px, py) => data[(py * width + px) * stride + channel];
    return (at(x0, y0) * (1 - dx) + at(x1, y0) * dx) * (1 - dy) + (at(x0, y1) * (1 - dx) + at(x1, y1) * dx) * dy;
  }
  function rgbTensor(rgba, width, height, shape) {
    const plane = shape.width * shape.height, data = new Float32Array(plane * 3);
    for (let y = 0; y < shape.height; y++) for (let x = 0; x < shape.width; x++) {
      // Pad by replicating the edge, preserving the photograph's aspect ratio.
      const sx = (Math.min(x, shape.scaledWidth - 1) + 0.5) * width / shape.scaledWidth - 0.5;
      const sy = (Math.min(y, shape.scaledHeight - 1) + 0.5) * height / shape.scaledHeight - 0.5;
      for (let c = 0; c < 3; c++) data[c * plane + y * shape.width + x] = sample(rgba, width, height, sx, sy, 4, c) / 127.5 - 1;
    }
    return data;
  }
  function resizeAlpha(values, shape, width, height) {
    const alpha = new Float32Array(width * height);
    for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
      const sx = Math.max(0, Math.min(shape.scaledWidth - 1, (x + 0.5) * shape.scaledWidth / width - 0.5));
      const sy = Math.max(0, Math.min(shape.scaledHeight - 1, (y + 0.5) * shape.scaledHeight / height - 0.5));
      alpha[y * width + x] = clamp(sample(values, shape.width, shape.height, sx, sy));
    }
    return alpha;
  }
  function alphaBytes(values) {
    return Uint8ClampedArray.from(values, value => Math.round(clamp(value) * 255));
  }
  // Linear-time separable box blur. Input and output may share a buffer.
  function boxBlur(input, width, height, radius, temp = new Float32Array(input.length), output = new Float32Array(input.length)) {
    for (let y = 0; y < height; y++) {
      let sum = 0;
      for (let x = 0; x <= Math.min(width - 1, radius); x++) sum += input[y * width + x];
      for (let x = 0; x < width; x++) {
        temp[y * width + x] = sum / (Math.min(width - 1, x + radius) - Math.max(0, x - radius) + 1);
        if (x - radius >= 0) sum -= input[y * width + x - radius];
        if (x + radius + 1 < width) sum += input[y * width + x + radius + 1];
      }
    }
    for (let x = 0; x < width; x++) {
      let sum = 0;
      for (let y = 0; y <= Math.min(height - 1, radius); y++) sum += temp[y * width + x];
      for (let y = 0; y < height; y++) {
        output[y * width + x] = sum / (Math.min(height - 1, y + radius) - Math.max(0, y - radius) + 1);
        if (y - radius >= 0) sum -= temp[(y - radius) * width + x];
        if (y + radius + 1 < height) sum += temp[(y + radius + 1) * width + x];
      }
    }
    return output;
  }
  function refineForeground(rgba, alpha, width, height) {
    const count = width * height;
    if (rgba.length !== count * 4 || alpha.length !== count) throw new Error('Invalid matte dimensions');
    const output = new Uint8ClampedArray(rgba.length), temp = new Float32Array(count);
    const radii = [45, 3];
    const alphaBlur = radii.map(radius => boxBlur(alpha, width, height, radius, temp));
    const foreground = new Float32Array(count), background = new Float32Array(count);
    const fMean = new Float32Array(count), bMean = new Float32Array(count);
    for (let c = 0; c < 3; c++) {
      for (let i = 0; i < count; i++) foreground[i] = background[i] = rgba[i * 4 + c] / 255;
      for (let pass = 0; pass < radii.length; pass++) {
        for (let i = 0; i < count; i++) { fMean[i] = foreground[i] * alpha[i]; bMean[i] = background[i] * (1 - alpha[i]); }
        boxBlur(fMean, width, height, radii[pass], temp, fMean);
        boxBlur(bMean, width, height, radii[pass], temp, bMean);
        for (let i = 0; i < count; i++) {
          const a = alpha[i], abar = alphaBlur[pass][i];
          const f = fMean[i] / Math.max(0.00001, abar), b = bMean[i] / Math.max(0.00001, 1 - abar);
          const residual = rgba[i * 4 + c] / 255 - a * f - (1 - a) * b;
          foreground[i] = clamp(f + a * residual); background[i] = clamp(b + (1 - a) * residual);
        }
      }
      for (let i = 0; i < count; i++) output[i * 4 + c] = alpha[i] > 0 ? Math.round(foreground[i] * 255) : 0;
    }
    // Straight RGBA: never composite this mask a second time, which squares alpha.
    for (let i = 0; i < count; i++) output[i * 4 + 3] = Math.round(clamp(alpha[i]) * 255);
    return output;
  }
  function paintAlpha(alpha, width, height, x, y, radius, mode, before) {
    const erase = mode === 'erase'; radius = Math.max(0.5, radius);
    for (let py = Math.max(0, Math.floor(y - radius)); py <= Math.min(height - 1, Math.ceil(y + radius)); py++) {
      for (let px = Math.max(0, Math.floor(x - radius)); px <= Math.min(width - 1, Math.ceil(x + radius)); px++) {
        const distance = Math.hypot(px + 0.5 - x, py + 0.5 - y) / radius;
        if (distance >= 1) continue;
        const i = py * width + px, amount = Math.min(1, (1 - distance) / 0.25);
        if (before && !before.has(i)) before.set(i, alpha[i]);
        alpha[i] = clamp(erase ? alpha[i] * (1 - amount) : alpha[i] + (1 - alpha[i]) * amount);
      }
    }
  }
  function undoStroke(alpha, before) { for (const [i, value] of before) alpha[i] = value; }
  return { dimensions, rgbTensor, resizeAlpha, alphaBytes, boxBlur, refineForeground, paintAlpha, undoStroke };
});
