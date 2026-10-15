import React from 'react';
import PageHeading, { PageEmblem } from '../shared/PageIdentity';

const HeroSection: React.FC = () => {
  return (
    <section className="sahwa-page-surface min-h-[55vh] sm:min-h-[65vh] flex items-center justify-center pt-24 sm:pt-28 pb-8">
      <PageEmblem />
      <div className="px-4 sm:px-8 max-w-2xl mx-auto">
        <PageHeading title="صحوة" description="شباب أمتنا" variant="home" />
      </div>
    </section>
  );
};

export default HeroSection;

