 'use client';

import type { ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from '../../lib/navigation';
import RequireSession from '../../auth/RequireSession';

export default function TeamLayout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  if (pathname === "/team/workspace/studio") return <RequireSession>{children}</RequireSession>;
  return <RequireSession>
    <Helmet><meta name="robots" content="noindex, nofollow" /></Helmet>
    <main className="app-shell sahwa-page-surface internal-page pb-12">
      <div className="page-container relative z-10">
        {children}
      </div>
    </main>
  </RequireSession>;
}
