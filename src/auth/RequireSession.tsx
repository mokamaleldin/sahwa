import type { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSession } from './useSession';

export default function RequireSession({ children }: { children: ReactNode }) {
  const { status, error, refresh } = useSession();
  const location = useLocation();
  if (status === 'authenticated') return children;
  if (status === 'anonymous') return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />;
  return <main className="app-shell pt-28 team-loading" role="status">
    {status === 'error' ? <><p role="alert">{error}</p><button className="team-button" onClick={() => void refresh({ force: true })}>إعادة المحاولة</button></> : <><Loader2 className="animate-spin" size={25} aria-hidden="true" /><p>جارٍ التحقق من الدخول…</p></>}
  </main>;
}
