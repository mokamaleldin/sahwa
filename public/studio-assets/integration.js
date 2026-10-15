(() => {
  const embedded = document.body.classList.contains('is-embedded') && parent !== window;
  if (!embedded) {
    async function checkSession() {
      try {
        const response = await fetch('/api/auth', { cache: 'no-store' });
        if (response.ok && !(await response.json()).authenticated) location.replace('/login?next=/studio');
      } catch { /* Keep the draft during connection failures. */ }
    }
    addEventListener('pageshow', checkSession);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') void checkSession(); });
    return;
  }
  const main = document.querySelector('main');
  let scheduled = false, lastHeight = 0, lastModal = false, previewOffset = 0;
  function measure() {
    scheduled = false;
    if (!main || !main.getBoundingClientRect().width) return;
    const modal = Boolean(document.querySelector('dialog[open]'));
    const height = Math.ceil(main.getBoundingClientRect().bottom + scrollY + 20);
    if (height !== lastHeight || modal !== lastModal) {
      lastHeight = height; lastModal = modal;
      parent.postMessage({ type: 'sahwa:studio:size', height, modal }, location.origin);
    }
  }
  function schedule() { if (!scheduled) { scheduled = true; requestAnimationFrame(measure); } }
  new ResizeObserver(schedule).observe(main);
  new MutationObserver(schedule).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['open'] });
  addEventListener('load', schedule);
  addEventListener('message', event => {
    if (event.origin !== location.origin || event.source !== parent) return;
    if (event.data?.type === 'sahwa:studio:measure') { lastHeight = 0; schedule(); }
    if (event.data?.type === 'sahwa:studio:viewport') {
      const toast = document.querySelector('.toast');
      if (toast && Number.isFinite(event.data.bottom)) toast.style.bottom = `${Math.max(25, Math.min(innerHeight - 50, event.data.bottom))}px`;
      const preview = document.querySelector('.preview'), workspace = document.querySelector('.workspace');
      if (!preview || !workspace) return;
      const rect = preview.getBoundingClientRect(), top = rect.top - previewOffset;
      const max = Math.max(0, workspace.getBoundingClientRect().bottom - rect.height - top);
      const target = Number.isFinite(event.data.top) ? event.data.top : 0;
      previewOffset = innerWidth > 700 && !document.querySelector('dialog[open]') ? Math.max(0, Math.min(max, target - top)) : 0;
      preview.style.transform = previewOffset ? `translateY(${previewOffset}px)` : '';
    }
  });
  schedule();
})();
