export type SessionStatus = 'loading' | 'authenticated' | 'anonymous' | 'error';
export interface SessionSnapshot { status: SessionStatus; error: string }
const INITIAL: SessionSnapshot = { status: 'loading', error: '' };
const RECHECK_MS = 30_000;

export function createSessionClient(request: typeof fetch = (...args) => fetch(...args), notifyChange = () => {}) {
  let snapshot = INITIAL;
  let version = 0;
  let lastChecked = 0;
  let pending: { version: number; promise: Promise<void> } | null = null;
  const listeners = new Set<() => void>();
  function publish(next: SessionSnapshot) {
    if (snapshot.status === next.status && snapshot.error === next.error) return;
    snapshot = next;
    listeners.forEach(listener => listener());
  }
  async function authRequest(options: RequestInit = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12_000);
    try { return await request('/api/auth', { cache: 'no-store', credentials: 'same-origin', ...options, signal: controller.signal }); }
    catch { throw new Error('تعذر الاتصال. تحقق من الإنترنت وحاول مجددًا.'); }
    finally { clearTimeout(timer); }
  }
  async function responseData(response: Response) {
    const data = await response.json().catch(() => null);
    if (!response.ok || typeof data?.authenticated !== 'boolean') throw new Error(data?.error || 'تعذر التحقق من الدخول. حاول مجددًا.');
    return data as { authenticated: boolean };
  }
  function anonymous() {
    version++;
    lastChecked = Date.now();
    publish({ status: 'anonymous', error: '' });
  }
  function refresh({ force = false } = {}): Promise<void> {
    if (pending?.version === version) return pending.promise;
    if (!force && lastChecked && Date.now() - lastChecked < RECHECK_MS) return Promise.resolve();
    const requestVersion = version;
    const promise = (async () => {
      try {
        const data = await responseData(await authRequest());
        if (version === requestVersion) {
          lastChecked = Date.now();
          publish({ status: data.authenticated ? 'authenticated' : 'anonymous', error: '' });
        }
      } catch (error) {
        if (version === requestVersion) {
          lastChecked = Date.now();
          // A connection failure must not sign somebody out or destroy their draft.
          publish({ status: snapshot.status === 'loading' ? 'error' : snapshot.status, error: error instanceof Error ? error.message : 'تعذر الاتصال. حاول مجددًا.' });
        }
      }
    })();
    const operation = { version: requestVersion, promise };
    pending = operation;
    void promise.finally(() => { if (pending === operation) pending = null; });
    return promise;
  }
  async function signIn(input: { email: string; password: string; remember: boolean }) {
    const requestVersion = ++version;
    const data = await responseData(await authRequest({
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input),
    }));
    if (!data.authenticated) throw new Error('تعذر تسجيل الدخول. حاول مجددًا.');
    if (version !== requestVersion) return;
    lastChecked = Date.now();
    publish({ status: 'authenticated', error: '' });
    notifyChange();
  }
  async function signOut() {
    const requestVersion = ++version;
    const data = await responseData(await authRequest({ method: 'DELETE' }));
    if (data.authenticated) throw new Error('تعذر تسجيل الخروج. حاول مجددًا.');
    if (version !== requestVersion) return;
    anonymous();
    notifyChange();
  }
  return {
    getSnapshot: () => snapshot, getServerSnapshot: () => INITIAL,
    subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
    refresh, signIn, signOut, anonymous,
  };
}

export type SessionClient = ReturnType<typeof createSessionClient>;
export const SESSION_CHANGE_KEY = 'sahwa:session-change:v1';
export const sessionClient = createSessionClient(undefined, () => {
  try { window.localStorage.setItem(SESSION_CHANGE_KEY, `${Date.now()}:${Math.random()}`); } catch { /* Storage is optional; focus still rechecks the server. */ }
});
