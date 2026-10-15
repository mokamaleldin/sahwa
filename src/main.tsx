import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Home from './pages/Home.tsx';
import Universities from './pages/Universities.tsx';
import UniversityPage from './pages/UniversityPage.tsx';
import Login from './pages/Login.tsx';
import SocialMedia from './pages/SocialMedia.tsx';
import Library from './pages/Library.tsx';
import NotFoundPage from './pages/NotFound.tsx';
import ScrollToTop from './components/shared/ScrollToTop.tsx';
import TeamLayout from './components/Team/TeamLayout.tsx';
import { SITE_FEATURES } from './config/features';
import { Analytics } from "@vercel/analytics/react";
import './index.css';
import './team.css';

const Team = lazy(() => import('./pages/Team.tsx'));
const TeamFiles = lazy(() => import('./pages/TeamFiles.tsx'));
const TeamVolunteers = lazy(() => import('./pages/TeamVolunteers.tsx'));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Suspense fallback={<main className="app-shell team-loading" role="status">جارٍ تحميل الصفحة…</main>}><Routes>
          <Route path="/" element={<Home />} />
          <Route path="/universities" element={<Universities />} />
          <Route path="/universities/:universityId" element={<UniversityPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/contact" element={<Navigate to="/social" replace />} />
          <Route path="/social" element={<SocialMedia />} />
          <Route path="/library" element={SITE_FEATURES.library ? <Library /> : <Navigate to="/" replace />} />
          <Route path="/team" element={<TeamLayout />}>
            <Route index element={<Team />} />
            <Route path="volunteers" element={SITE_FEATURES.volunteers ? <TeamVolunteers /> : <Navigate to="/team" replace />} />
            <Route path="files" element={<TeamFiles />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes></Suspense>
        <Analytics />
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>
);
