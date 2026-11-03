 'use client';

import type { ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';
import { PageEmblem } from '../shared/PageIdentity';
import RequireSession from '../../auth/RequireSession';
import TeamNavigation from './TeamNavigation';

export default function TeamLayout({ children }: { children: ReactNode }) {
  return <RequireSession>
    <Helmet><meta name="robots" content="noindex, nofollow" /></Helmet>
    <main className="app-shell sahwa-page-surface pt-24 sm:pt-28 pb-12">
      <PageEmblem />
      <div className="page-container relative z-10">
        <TeamNavigation />
        {children}
      </div>
    </main>
  </RequireSession>;
}
