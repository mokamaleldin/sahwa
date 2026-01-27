import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Home from './pages/Home.tsx';
import Universities from './pages/Universities.tsx';
import UniversityPage from './pages/UniversityPage.tsx';
import Contact from './pages/Contact.tsx';
import SocialMedia from './pages/SocialMedia.tsx';
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
          <Route path="/" element={<Home />} />
          <Route path="/universities" element={<Universities />} />
          <Route path="/universities/:universityId" element={<UniversityPage />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/social" element={<SocialMedia />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <Analytics />
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>
);
