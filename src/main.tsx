import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx';
import MembershipCardPage from './pages/MembershipCard.tsx';
import MembersPage from './pages/Members.tsx';
import ProgramsPage from './pages/Programs.tsx';
import ContactAndGroupsPage from './pages/ContactAndGroups.tsx';
import NotFoundPage from './pages/NotFound.tsx';
import ScrollToTop from './components/ScrollToTop.tsx';
import { Analytics } from "@vercel/analytics/react";
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/membership-card" element={<MembershipCardPage />} />
          <Route path="/members" element={<MembersPage />} />
          <Route path="/programs" element={<ProgramsPage />} />
          <Route path="/contact" element={<ContactAndGroupsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <Analytics />
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>
);
