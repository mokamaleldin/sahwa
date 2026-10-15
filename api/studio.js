import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { hasSession, privateHeaders } from '../server/auth.js';

export async function GET(request) {
  const embedded = new URL(request.url).searchParams.get('embed') === '1';
  const headers = { ...privateHeaders, 'Content-Type': 'text/html; charset=utf-8', 'X-Frame-Options': 'SAMEORIGIN', 'Content-Security-Policy': "frame-ancestors 'self'" };
  try {
    if (!hasSession(request)) {
      if (embedded) return new Response('<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><p>انتهت الجلسة. سجّل الدخول مجددًا.</p><script>parent.postMessage({type:"sahwa:studio:expired"},location.origin)</script></html>', { status: 401, headers });
      return new Response(null, { status: 303, headers: { ...privateHeaders, Location: '/login' } });
    }
    let html = await readFile(join(process.cwd(), 'studio/index.html'), 'utf8');
    if (embedded) html = html.replace('class="has-brand-heading"', 'class="has-brand-heading is-embedded"');
    return new Response(html, { headers });
  } catch {
    console.error('Studio could not be served');
    return new Response('تعذر فتح الاستوديو مؤقتًا. يرجى المحاولة لاحقًا.', {
      status: 503, headers: { ...privateHeaders, 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}

export async function HEAD(request) {
  const response = await GET(request);
  return new Response(null, { status: response.status, headers: response.headers });
}
