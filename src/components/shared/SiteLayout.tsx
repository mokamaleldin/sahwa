import { Suspense, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useSession } from '../../auth/useSession';
import Header from './Header';
import Footer from './Footer';
import StudioWorkspace from '../Studio/StudioWorkspace';

export default function SiteLayout() {
  const { pathname } = useLocation();
  const { status } = useSession();
  const isStudio = pathname.replace(/\/$/, '') === '/studio';
  const [openedStudio, setOpenedStudio] = useState(isStudio);
  useEffect(() => { if (isStudio) setOpenedStudio(true); }, [isStudio]);
  useEffect(() => { if (status === 'anonymous') setOpenedStudio(false); }, [status]);
  return <>
    <Header />
    <Suspense fallback={<main className="app-shell pt-28 team-loading" role="status">جارٍ فتح الصفحة…</main>}><Outlet /></Suspense>
    {status === 'authenticated' && (isStudio || openedStudio) && <StudioWorkspace active={isStudio} />}
    <Footer />
  </>;
}
