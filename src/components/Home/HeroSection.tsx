import React from 'react';

const HeroSection: React.FC = () => {
  return (
    <section className="min-h-[55vh] sm:min-h-[65vh] flex items-center justify-center relative overflow-hidden pt-24 sm:pt-28 pb-8">
      {/* Subtle side decorative emblem */}
      <div 
        className="absolute top-1/2 -left-16 sm:-left-12 -translate-y-1/2 pointer-events-none opacity-5 select-none"
        aria-hidden="true"
      >
        <img
          src="/sahwa-icon.png"
          alt=""
          className="w-72 h-72 sm:w-96 sm:h-96 object-contain"
        />
      </div>

      <div className="relative z-10 text-center px-4 sm:px-8 max-w-2xl mx-auto flex flex-col items-center">
        {/* Secondary Golden Geometric Icon */}
        <div className="mb-6 sm:mb-8 animate-fade-in">
          <img
            src="/sahwa-icon.png"
            alt="أيقونة صحوة"
            className="w-20 h-20 sm:w-28 sm:h-28 object-contain mx-auto drop-shadow-sm transition-transform duration-300 hover:scale-105"
            width="112"
            height="112"
            loading="eager"
          />
        </div>

        {/* Brand Name in Milan Display Black */}
        <h1 className="text-5xl sm:text-7xl font-heading font-bold text-[#752026] mb-4 tracking-normal">
          صحوة
        </h1>

        <span className="inline-block w-12 h-0.5 bg-[#D6AD63] my-3"></span>

        <p className="text-base sm:text-lg text-[#350E15]/80 font-medium">
          شباب أمتنا
        </p>
      </div>
    </section>
  );
};

export default HeroSection;

