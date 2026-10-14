import { settings, hasSession, verifyCredentials, createSession, sessionCookie, expiredCookie, privateHeaders, sameOrigin } from '../server/auth.js';

const json = (data, status = 200, headers = {}) => Response.json(data, {
  status, headers: { ...privateHeaders, ...headers },
});

export function GET(request) {
  try {
    const config = settings();
    const authenticated = hasSession(request, config);
    return json({ authenticated });
  } catch {
    console.error('Shared login configuration is unavailable');
    return json({ authenticated: false, error: 'الدخول غير متاح مؤقتًا. حاول لاحقًا.' }, 503);
  }
}

export async function POST(request) {
  if (!sameOrigin(request)) return json({ error: 'تعذر تسجيل الدخول. أعد تحميل الصفحة.' }, 403);
  if (!request.headers.get('content-type')?.startsWith('application/json')) return json({ error: 'طلب غير صالح.' }, 415);
  if (Number(request.headers.get('content-length')) > 2048) return json({ error: 'طلب غير صالح.' }, 413);
  let input;
  try {
    const body = await request.text();
    if (body.length > 2048) return json({ error: 'طلب غير صالح.' }, 413);
    input = JSON.parse(body);
    if (!input || typeof input !== 'object') return json({ error: 'طلب غير صالح.' }, 400);
  } catch {
    return json({ error: 'طلب غير صالح.' }, 400);
  }
  try {
    const config = settings();
    if (!await verifyCredentials(input.email, input.password, config)) {
      return json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' }, 401);
    }
    const remember = input.remember !== false;
    const session = createSession(remember, config);
    return json({ authenticated: true }, 200, {
      'Set-Cookie': sessionCookie(session.token, session.lifetime, remember),
    });
  } catch {
    console.error('Shared login could not complete');
    return json({ error: 'الدخول غير متاح مؤقتًا. حاول لاحقًا.' }, 503);
  }
}

export function DELETE(request) {
  if (!sameOrigin(request)) return json({ error: 'تعذر تسجيل الخروج. أعد تحميل الصفحة.' }, 403);
  return json({ authenticated: false }, 200, { 'Set-Cookie': expiredCookie() });
}
