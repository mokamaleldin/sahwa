import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { hasSession, privateHeaders } from '../server/auth.js';

export async function GET(request) {
  try {
    if (!hasSession(request)) {
      return new Response(null, { status: 303, headers: { ...privateHeaders, Location: '/login' } });
    }
    const html = await readFile(join(process.cwd(), 'studio/index.html'), 'utf8');
    return new Response(html, { headers: { ...privateHeaders, 'Content-Type': 'text/html; charset=utf-8' } });
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
