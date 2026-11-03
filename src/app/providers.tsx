"use client";

import { Suspense, type ReactNode } from "react";
import { HelmetProvider } from "react-helmet-async";
import { Analytics } from "@vercel/analytics/react";
import SessionProvider from "../auth/SessionProvider";
import SiteLayout from "../components/shared/SiteLayout";
import ScrollToTop from "../components/shared/ScrollToTop";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <HelmetProvider>
      <SessionProvider>
        <Suspense>
          <ScrollToTop />
        </Suspense>
        <SiteLayout>{children}</SiteLayout>
        <Analytics />
      </SessionProvider>
    </HelmetProvider>
  );
}
