import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const CTASection: React.FC = () => {
  return (
    <section className="py-20 sm:py-24 bg-[#7F373B]/[0.02]">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#7F373B] mb-4">
          كن جزءًا من صحوة
        </h2>
        <p className="text-gray-600 mb-10">
          اكتشف مجتمعنا الطلابي في تركيا
        </p>
        
        {/* Primary CTA */}
        <Link 
          to="/universities" 
          className="inline-flex items-center gap-3 bg-[#7F373B] text-white px-8 py-4 rounded-full font-medium text-lg hover:bg-[#6a2e31] transition-all duration-300 group mb-8"
        >
          اكتشف الجامعات
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        </Link>
        
        {/* Secondary Links - Internal Linking Strategy */}
        <div className="flex flex-wrap justify-center gap-4 mt-6">
          <Link 
            to="/social" 
            className="text-[#7F373B] hover:text-[#6a2e31] font-medium transition-colors border-b border-transparent hover:border-[#7F373B]"
          >
            تابعنا على السوشيال ميديا
          </Link>
          <span className="text-gray-300">|</span>
          <Link 
            to="/contact" 
            className="text-[#7F373B] hover:text-[#6a2e31] font-medium transition-colors border-b border-transparent hover:border-[#7F373B]"
          >
            تواصل معنا
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
