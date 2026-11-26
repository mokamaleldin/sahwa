 'use client';

import type { ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';
import RequireSession from '../../auth/RequireSession';

export default function TeamLayout({ children }: { children: ReactNode }) {
  return <RequireSession>
    <Helmet><meta name="robots" content="noindex, nofollow" /></Helmet>
    <main className="app-shell sahwa-page-surface internal-page pb-12">
      <div className="page-container relative z-10">
        {children}
      </div>
    </main>
  </RequireSession>;
}
