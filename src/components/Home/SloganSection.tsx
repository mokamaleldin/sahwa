import React from 'react';

const SloganSection: React.FC = () => {
  return (
    <section className="py-32 sm:py-40 bg-[#FFFEFD] relative">
      <div className="absolute inset-0 flex items-center justify-center opacity-5">
        <span className="text-[200px] sm:text-[300px] font-bold text-[#7F373B] select-none">صحوة</span>
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-8 text-center">
        <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#7F373B] leading-relaxed">
          صحوة
          <span className="text-[#C79250] mx-4">—</span>
          صحوة لشباب أمتنا
        </p>
      </div>
    </section>
  );
};

export default SloganSection;
