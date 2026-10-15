import { useEffect, useState } from 'react';
import { LogOut, Loader2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { NavLink, Outlet } from 'react-router-dom';
import Header from '../shared/Header';
import Footer from '../shared/Footer';
import { PageEmblem } from '../shared/PageIdentity';
import { SITE_FEATURES } from '../../config/features';

export default function TeamLayout() {
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [leaving, setLeaving] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    async function check() {
      try {
        const response = await fetch('/api/auth', { cache: 'no-store', signal: controller.signal });
        if (!response.ok) throw new Error();
        const result = await response.json();
        if (!result.authenticated) {
          setAuthenticated(false);
          window.location.replace(`/login?next=${encodeURIComponent(window.location.pathname)}`);
          return;
        }
        setAuthenticated(true);
        setError('');
      } catch {
        if (!controller.signal.aborted) {
          setAuthenticated(false);
          setError('تعذر التحقق من الدخول. حاول مجددًا.');
        }
      }
    }
    void check();
    const onVisible = () => { if (document.visibilityState === 'visible') void check(); };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('pageshow', onVisible);
    return () => { controller.abort(); document.removeEventListener('visibilitychange', onVisible); window.removeEventListener('pageshow', onVisible); };
  }, [attempt]);

  async function logout() {
    setLeaving(true);
    try {
      const response = await fetch('/api/auth', { method: 'DELETE' });
      if (!response.ok) throw new Error();
      setAuthenticated(false);
      window.location.replace('/login');
    } catch {
      setError('تعذر تسجيل الخروج. حاول مجددًا.');
      setLeaving(false);
    }
  }

  return (
    <>
      <Helmet><meta name="robots" content="noindex, nofollow" /></Helmet>
      <Header />
      <main className="app-shell sahwa-page-surface pt-24 sm:pt-28 pb-12">
        <PageEmblem />
        <div className="page-container relative z-10">
          {authenticated ? <>
            <div className="team-navigation-row">
              <nav className="team-navigation" aria-label="مساحة الفريق">
                <NavLink to="/team" end>مساحة الفريق</NavLink>
                {SITE_FEATURES.volunteers && <NavLink to="/team/volunteers">المتطوعون</NavLink>}
                <NavLink to="/team/files">الملفات</NavLink>
                <a href="/studio">الاستوديو</a>
              </nav>
              <button className="team-text-button" onClick={logout} disabled={leaving}><LogOut size={16} aria-hidden="true" />{leaving ? 'جارٍ الخروج…' : 'تسجيل الخروج'}</button>
            </div>
            {error && <p className="team-error mb-6" role="alert">{error}</p>}
            <Outlet />
          </> : <div className="team-loading" role="status">
            {error ? <><p>{error}</p><button className="team-button" onClick={() => { setError(''); setAttempt(value => value + 1); }}>إعادة المحاولة</button></> : <><Loader2 className="animate-spin" size={25} aria-hidden="true" /><p>جارٍ فتح مساحة الفريق…</p></>}
          </div>}
        </div>
      </main>
      <Footer />
    </>
  );
}
