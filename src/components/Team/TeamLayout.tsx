import { Helmet } from 'react-helmet-async';
import { Outlet } from 'react-router-dom';
import { PageEmblem } from '../shared/PageIdentity';
import RequireSession from '../../auth/RequireSession';
import TeamNavigation from './TeamNavigation';

export default function TeamLayout() {
  return <RequireSession>
    <Helmet><meta name="robots" content="noindex, nofollow" /></Helmet>
    <main className="app-shell sahwa-page-surface pt-24 sm:pt-28 pb-12">
      <PageEmblem />
      <div className="page-container relative z-10">
        <TeamNavigation />
        <Outlet />
      </div>
    </main>
  </RequireSession>;
}
