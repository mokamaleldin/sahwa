import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const HeroSection: React.FC = () => {
  return (
    <section className="min-h-[88vh] sm:min-h-screen flex items-center justify-center relative overflow-hidden pt-12">
      {/* Subtle decorative elements */}
      <div className="absolute top-16 right-2 sm:right-10 w-48 sm:w-72 h-48 sm:h-72 bg-[#7F373B]/8 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 left-2 sm:left-10 w-56 sm:w-96 h-56 sm:h-96 bg-[#C79250]/10 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 text-center px-4 sm:px-8 max-w-4xl mx-auto pt-20 sm:pt-24">
        {/* Main Title */}
        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold text-[#7F373B] mb-5 sm:mb-6 animate-fade-in-up tracking-tight">
          صحوة
        </h1>
        
        {/* Slogan */}
        <p className="text-lg sm:text-2xl text-[#C79250] font-medium mb-4 animate-fade-in-up animation-delay-200">
          شباب أمتنا
        </p>

        <p className="text-sm sm:text-lg text-gray-600 max-w-2xl mx-auto leading-8 mb-12 sm:mb-16 animate-fade-in-up animation-delay-300">
          مساحة طلابية إسلامية في جامعات تركيا
        </p>
        
        {/* Scroll hint */}
        <button 
          onClick={() => document.getElementById('definition')?.scrollIntoView({ behavior: 'smooth' })}
          className="animate-fade-in-up animation-delay-500 group tap-target"
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
