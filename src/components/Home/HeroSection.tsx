import React from 'react';

const HeroSection: React.FC = () => {
  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Subtle decorative elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-[#7F373B]/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-[#C79250]/5 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 text-center px-6 sm:px-8 max-w-4xl mx-auto pt-24">
        {/* Main Title */}
        <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold text-[#7F373B] mb-6 animate-fade-in-up">
          صحوة
        </h1>
        
        {/* Slogan */}
        <p className="text-xl sm:text-2xl text-[#C79250] font-medium mb-16 animate-fade-in-up animation-delay-200">
          صحوة لشباب أمتنا
        </p>
        
        {/* Scroll hint */}
        <button 
          onClick={() => document.getElementById('definition')?.scrollIntoView({ behavior: 'smooth' })}
          className="animate-fade-in-up animation-delay-400 group"
          aria-label="اكتشف المزيد"
        >
          <div className="w-8 h-14 border-2 border-[#7F373B]/30 rounded-full flex justify-center mx-auto hover:border-[#7F373B]/60 transition-colors">
            <div className="w-1.5 h-4 bg-[#7F373B]/40 rounded-full mt-3 animate-bounce"></div>
          </div>
        </button>
      </div>
    </section>
  );
};

export default HeroSection;
