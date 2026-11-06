'use client';

import React from 'react';
import HeroSection from '../components/Home/HeroSection';
import DefinitionSection from '../components/Home/DefinitionSection';
import VisionSection from '../components/Home/VisionSection';
import PillarsSection from '../components/Home/PillarsSection';
import VolunteerSection from '../components/Home/VolunteerSection';

const Home: React.FC = () => {
  return (
    <>
      <main className="app-shell">
        <HeroSection />
        <DefinitionSection />
        <VisionSection />
        <PillarsSection />
        <VolunteerSection />
      </main>
    </>
  );
};

export default Home;
