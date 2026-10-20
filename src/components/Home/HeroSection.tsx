import React from 'react';
import { PageEmblem } from '../shared/PageIdentity';

const HeroSection: React.FC = () => {
  return (
    <section className="sahwa-page-surface min-h-[60vh] sm:min-h-[72vh] flex items-center justify-center pt-28 sm:pt-36 pb-14 sm:pb-20 relative">
      <PageEmblem />
      <div className="px-4 sm:px-8 max-w-4xl mx-auto text-center relative z-10">
        <img
          src="/sahwa-icon.png"
          alt=""
          width="112"
          height="112"
          className="sahwa-page-heading-icon w-20 h-20 sm:w-28 sm:h-28 mx-auto mb-4 object-contain"
        />
        <span className="sahwa-page-heading-rule block w-12 h-0.5 bg-brand-gold mx-auto mb-6" aria-hidden="true" />
        
        <h1 className="font-heading font-bold text-brand-primary text-5xl sm:text-7xl lg:text-8xl tracking-normal mb-6">
          صحوة
        </h1>


        <p className="font-sans text-brand-dark/80 text-base sm:text-lg leading-[2] max-w-2xl mx-auto font-normal">
          مساحة شبابية تجمع الشباب على الصحبة الصالحة، والقرآن، ومعنى الأمة الواحدة، وتساعدهم على النمو في إيمانهم ووعيهم ومسؤوليتهم، ليكونوا أنفع لأنفسهم ومجتمعهم وأمتهم.
        </p>
      </div>
    </section>
  );
};

export default HeroSection;
