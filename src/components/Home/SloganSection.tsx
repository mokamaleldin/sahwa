import React from 'react';

const SloganSection: React.FC = () => {
  return (
    <section className="py-20 sm:py-28 bg-[#FFFEFD] relative overflow-hidden">
      <div className="absolute inset-0 hidden sm:flex items-center justify-center opacity-5">
        <span className="text-[210px] lg:text-[300px] font-bold text-[#7F373B] select-none">صحوة</span>
      </div>
      
      <div className="relative z-10 page-container max-w-4xl text-center">
        <div className="section-card p-6 sm:p-10">
          <p className="text-2xl sm:text-4xl lg:text-5xl font-bold text-[#7F373B] leading-relaxed">
          صحوة
          <span className="text-[#C79250] mx-2 sm:mx-4">—</span>
          صحوة لشباب أمتنا
          </p>
        </div>
      </div>
    </section>
  );
};

export default SloganSection;
