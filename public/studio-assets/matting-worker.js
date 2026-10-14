import './matting-core.js?v=1.5.0';

const Core = globalThis.SahwaMatting;
const RUNTIME = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.23.2/dist/';
const MODEL = 'https://huggingface.co/Xenova/modnet/resolve/7aaa8a27c987ae9452a60443a7afeb6b2a52843a/onnx/model.onnx';
const MODEL_HASH = '07c308cf0fc7e6e8b2065a12ed7fc07e1de8febb7dc7839d7b7f15dd66584df9';
let sessionPromise;
function status(id, message) { postMessage({ id, status: message }); }
async function modelBytes(id) {
  const cache = typeof caches !== 'undefined' ? await caches.open('sahwa-matting-v1').catch(() => null) : null;
  let response = cache && await cache.match(MODEL).catch(() => null);
  if (!response) {
    response = await fetch(MODEL);
    if (!response.ok) throw new Error('MODEL_DOWNLOAD');
    if (cache) await cache.put(MODEL, response.clone()).catch(() => {});
  }
  status(id, 'جارٍ تجهيز أداة التفريغ…');
  const bytes = await response.arrayBuffer();
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  const hex = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
  if (hex !== MODEL_HASH) { if (cache) await cache.delete(MODEL); throw new Error('MODEL_INTEGRITY'); }
  return new Uint8Array(bytes);
}
function session(id) {
  if (!sessionPromise) {
    status(id, 'جارٍ تحميل أداة التفريغ الدقيق لأول مرة…');
    sessionPromise = (async () => {
      const ort = await import(`${RUNTIME}ort.wasm.min.mjs`);
      ort.env.wasm.numThreads = 1;
      ort.env.wasm.wasmPaths = RUNTIME;
      const tool = await ort.InferenceSession.create(await modelBytes(id), { executionProviders: ['wasm'], graphOptimizationLevel: 'all' });
      return { ort, tool };
    })();
    sessionPromise.catch(() => { sessionPromise = null; });
  }
  return sessionPromise;
}
async function infer(id, rgba, width, height) {
  const { ort, tool } = await session(id);
  let lastError;
  for (const resolution of [1024, 768, 512]) {
    let tensor, output;
    try {
      status(id, 'جارٍ تفريغ الشخص والشعر على جهازك…');
      const shape = Core.dimensions(width, height, resolution);
      tensor = new ort.Tensor('float32', Core.rgbTensor(rgba, width, height, shape), [1, 3, shape.height, shape.width]);
      ({ output } = await tool.run({ input: tensor }));
      // MODNet already returns alpha. Do not apply sigmoid or threshold the hair.
      return Core.resizeAlpha(output.data, shape, width, height);
    } catch (error) {
      lastError = error;
      if (!/memory|allocation|alloc|out of bounds|size|resource/i.test(String(error))) throw error;
      status(id, 'جارٍ ضبط الدقة لتناسب ذاكرة الجهاز…');
    } finally { tensor?.dispose(); output?.dispose(); }
  }
  throw lastError;
}
let queue = Promise.resolve();
self.onmessage = ({ data }) => {
  queue = queue.catch(() => {}).then(async () => {
    const { id, action, width, height } = data;
    try {
      if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1 || width * height > 2048 * 2048) throw new Error('IMAGE_SIZE');
      const rgba = new Uint8ClampedArray(data.rgba);
      const alpha = action === 'refine' ? new Float32Array(data.alpha) : await infer(id, rgba, width, height);
      let personPixels = 0;
      for (const value of alpha) if (value > 0.6) personPixels++;
      if (personPixels < alpha.length * 0.001 && action !== 'refine') throw new Error('NO_PERSON');
      status(id, 'جارٍ تنقية ألوان حواف الشعر…');
      const output = Core.refineForeground(rgba, alpha, width, height);
      postMessage({ id, rgba: output.buffer, width, height }, [output.buffer]);
    } catch (error) {
      const message = String(error).includes('NO_PERSON') ? 'لم يظهر شخص واضح في الصورة. استخدم وضع الدائرة.' : 'تعذّر التفريغ الدقيق. تحقق من الإنترنت وجرّب مجددًا أو استخدم صورة PNG مفرغة.';
      postMessage({ id, error: message });
    }
  });
};
