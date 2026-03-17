import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const CTASection: React.FC = () => {
  return (
    <section className="py-16 sm:py-24 bg-[#7F373B]/[0.03]">
      <div className="page-container max-w-4xl text-center">
        <div className="section-card p-6 sm:p-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#7F373B] mb-4">
          كن جزءًا من صحوة
          </h2>
          <p className="text-gray-600 mb-8 sm:mb-10">
          اكتشف مجتمعنا الطلابي في تركيا
          </p>
        
        {/* Primary CTA */}
          <Link 
            to="/universities" 
            className="tap-target inline-flex items-center gap-3 bg-[#7F373B] text-white px-7 py-3.5 rounded-xl font-medium text-base sm:text-lg hover:bg-[#6a2e31] transition-all duration-300 group mb-7 sm:mb-8"
          >
            اكتشف الجامعات
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          </Link>
        
        {/* Secondary Links - Internal Linking Strategy */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mt-2">
            <Link 
              to="/social" 
              className="tap-target inline-flex items-center text-[#7F373B] hover:text-[#6a2e31] font-medium transition-colors border-b border-transparent hover:border-[#7F373B]"
            >
              تابعنا على السوشيال ميديا
            </Link>
            <span className="text-gray-300 hidden sm:inline">|</span>
            <Link 
              to="/contact" 
              className="tap-target inline-flex items-center text-[#7F373B] hover:text-[#6a2e31] font-medium transition-colors border-b border-transparent hover:border-[#7F373B]"
            >
              تواصل معنا
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
