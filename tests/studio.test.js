import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';

const { createCanvas, GlobalFonts, loadImage } = createRequire(import.meta.url)('@napi-rs/canvas');
const scope = {}; scope.window = scope; vm.createContext(scope);
for (const file of ['arabic-joining.js', 'engine.js', 'template-assets.js', 'matting-core.js', 'portrait.js']) {
  vm.runInContext(fs.readFileSync(new URL(`../public/studio-assets/${file}`, import.meta.url), 'utf8'), scope);
}
const Engine = scope.SahwaEngine, Core = scope.SahwaMatting, Assets = scope.SAHWA_ASSETS;
for (const [file, family] of [['Bold', 'SahwaTitle'], ['Regular', 'SahwaBodyRegular'], ['Thin', 'SahwaBodyThin']]) {
  GlobalFonts.registerFromPath(new URL(`../public/studio-assets/assets/IBMPlexSansArabic-${file}.ttf`, import.meta.url).pathname, family);
}
const templates = [Engine.BASIC_TEMPLATE, ...Assets.templates];
function pixelBounds(canvas) {
  const { data } = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
  let left = canvas.width, top = canvas.height, right = -1, bottom = -1;
  for (let y = 0; y < canvas.height; y++) for (let x = 0; x < canvas.width; x++) {
    if (data[(y * canvas.width + x) * 4 + 3] < 16) continue;
    left = Math.min(left, x); right = Math.max(right, x); top = Math.min(top, y); bottom = Math.max(bottom, y);
  }
  return { left, right, top, bottom };
}
for (const template of templates) for (const kashida of [true, false]) {
  test(`${template.id}: real Arabic pixels stay separated and inside the title frame, kashida=${kashida}`, () => {
    const ctx = createCanvas(1080, 1300).getContext('2d'); ctx.direction = 'rtl';
    for (const title of ['في مصر\nالرئيس', 'لقاء في\nالعلم', 'فِي مِصْرَ\nالرَّئِيس', 'محمد كمال\nاللقاء']) {
      const spec = template.layout.title, fitted = Engine.layoutTitle(ctx, title, spec, 'SahwaTitle', kashida);
      assert.ok(fitted, title); assert.equal(fitted.lines.length, 2);
      const bounds = fitted.lines.map((line, i) => {
        const raster = createCanvas(1080, 1300), ink = raster.getContext('2d');
        ink.direction = 'rtl'; ink.textAlign = spec.align || 'right'; ink.font = `700 ${fitted.size}px "SahwaTitle"`;
        ink.fillText(line, spec.right, fitted.baselines[i]); return pixelBounds(raster);
      });
      assert.ok(bounds[1].top - bounds[0].bottom >= 14, `${title}: ${JSON.stringify(bounds)}`);
      const top = spec.y, bottom = top + spec.height;
      assert.ok(bounds[0].top >= top - 2 && bounds[1].bottom <= bottom + 2, `${title}: title exceeds its frame`);
      for (const line of bounds) assert.ok(line.right - line.left <= spec.width + 2);
    }
  });
}
test('titles with three explicit lines are rejected', () => {
  const ctx = createCanvas(1080, 1300).getContext('2d');
  for (const template of templates) assert.equal(Engine.layoutTitle(ctx, 'واحد\nاثنان\nثلاثة', template.layout.title, 'SahwaTitle'), null);
});
test('maximum PNG export keeps all three poster sizes and the fixed subtitle size', async () => {
  for (const template of templates) {
    const sources = template.assets || { background: Assets.background, originalTitle: Assets.originalTitle, badge: Assets.badge, symbol: Assets.symbol };
    const images = Object.fromEntries(await Promise.all(Object.entries(sources).map(async ([key, value]) => [key, await loadImage(value)])));
    const output = createCanvas(3240, 3900);
    const result = Engine.render(output.getContext('2d'), { ...template.defaults, title: 'في مصر\nالرئيس' }, { template, images, renderScale: 3 });
    assert.ok(result.valid, JSON.stringify(result.errors));
    assert.equal(result.subtitleSize, template.layout.subtitle.max);
    const png = output.toBuffer('image/png');
    assert.equal(png.readUInt32BE(16), 3240); assert.equal(png.readUInt32BE(20), 3900);
  }
});
test('matting preserves fractional hair alpha without thresholding or squaring', () => {
  const alpha = [0, 0.02, 0.1, 0.25, 0.5, 0.75, 1, NaN];
  assert.deepEqual(Array.from(Core.alphaBytes(alpha)), [0, 5, 26, 64, 128, 191, 255, 0]);
  assert.deepEqual(Array.from(scope.SahwaPortrait.confidenceAlpha(alpha)), Array.from(Core.alphaBytes(alpha)));
  const pixels = new Uint8ClampedArray(7 * 4).fill(180);
  const result = Core.refineForeground(pixels, Float32Array.from(alpha.slice(0, 7)), 7, 1);
  assert.deepEqual(Array.from(result).filter((_, i) => i % 4 === 3), [0, 5, 26, 64, 128, 191, 255]);
});
test('tensor padding preserves aspect ratio, planar RGB ordering, and normalization', () => {
  const shape = Core.dimensions(5, 3, 1024);
  assert.equal(shape.scaledWidth, 5); assert.equal(shape.scaledHeight, 3); assert.equal(shape.width, 32); assert.equal(shape.height, 32);
  const rgba = new Uint8ClampedArray(5 * 3 * 4);
  for (let i = 0; i < 15; i++) rgba.set([255, 0, 127.5, 255], i * 4);
  const rgb = Core.rgbTensor(rgba, 5, 3, shape), plane = shape.width * shape.height;
  assert.equal(rgb[0], 1); assert.equal(rgb[plane], -1);
  assert.ok(Math.abs(rgb[plane * 2]) < 0.005); assert.equal(rgb[plane - 1], 1);
  const mask = Float32Array.from({ length: plane }, (_, i) => i % 32 < 5 && Math.floor(i / 32) < 3 ? 0.5 : 0);
  assert.ok(Array.from(Core.resizeAlpha(mask, shape, 10, 6)).every(value => value === 0.5), 'padded area must not enter the matte');
});
test('automatic transparent-margin crop retains very faint hair outside the opaque body', () => {
  const rgba = new Uint8ClampedArray(100 * 100 * 4);
  for (let y = 20; y < 80; y++) for (let x = 20; x < 80; x++) rgba[(y * 100 + x) * 4 + 3] = 255;
  for (let y = 18; y < 38; y++) rgba[(y * 100 + 5) * 4 + 3] = 5;
  const bounds = scope.SahwaPortrait.alphaBounds(rgba, 100, 100);
  assert.equal(bounds.left, 5); assert.equal(bounds.top, 18);
});
test('RGB edge cleanup removes white fringe while keeping opaque pixels and alpha', () => {
  const width = 121, rgba = new Uint8ClampedArray(width * 4), alpha = new Float32Array(width);
  for (let x = 0; x < width; x++) {
    const a = x < 50 ? 1 : x > 70 ? 0 : (70 - x) / 20;
    alpha[x] = a; const value = Math.round(30 * a + 255 * (1 - a));
    rgba.set([value, value, value, 255], x * 4);
  }
  const result = Core.refineForeground(rgba, alpha, width, 1);
  assert.equal(result[10 * 4], 30); assert.equal(result[10 * 4 + 3], 255);
  assert.equal(result[60 * 4 + 3], 128);
  assert.ok(result[60 * 4] < rgba[60 * 4] - 25, 'semi-transparent RGB should recover darker foreground');
  assert.equal(result[100 * 4 + 3], 0);
});
test('edge brush erases and restores smoothly; one stroke undo recovers the exact original matte', () => {
  const alpha = new Float32Array(20 * 20).fill(0.7), original = new Float32Array(alpha), before = new Map();
  Core.paintAlpha(alpha, 20, 20, 10.5, 10.5, 5, 'erase', before);
  assert.equal(alpha[10 * 20 + 10], 0); assert.equal(alpha[0], original[0]);
  Core.paintAlpha(alpha, 20, 20, 11.5, 10.5, 5, 'erase', before);
  Core.undoStroke(alpha, before); assert.deepEqual(alpha, original);
  const restore = new Map(); Core.paintAlpha(alpha, 20, 20, 10.5, 10.5, 5, 'restore', restore);
  assert.equal(alpha[10 * 20 + 10], 1); Core.undoStroke(alpha, restore); assert.deepEqual(alpha, original);
});
