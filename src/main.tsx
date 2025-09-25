import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.tsx';
import MembershipCardPage from './pages/MembershipCard.tsx';
import MembersPage from './pages/Members.tsx';
import ProgramsPage from './pages/Programs.tsx';
import ContactAndGroupsPage from './pages/ContactAndGroups.tsx';
import ScrollToTop from './components/ScrollToTop.tsx';
import { Analytics } from "@vercel/analytics/react";
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/membership-card" element={<MembershipCardPage />} />
        <Route path="/members" element={<MembersPage />} />
        <Route path="/programs" element={<ProgramsPage />} />
        <Route path="/contact" element={<ContactAndGroupsPage />} />
      </Routes>
      <Analytics />
    </BrowserRouter>
  </StrictMode>
);
