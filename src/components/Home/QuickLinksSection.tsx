import React from 'react';
import { Link } from 'react-router-dom';

const QuickLinksSection: React.FC = () => {
  return (
    <section className="py-16 bg-[#FFFEFD]">
      <div className="max-w-4xl mx-auto px-6 sm:px-8">
        <nav className="grid grid-cols-2 md:grid-cols-4 gap-4" aria-label="روابط سريعة">
          <Link 
            to="/universities/istinye" 
            className="text-center p-4 rounded-xl bg-[#7F373B]/[0.03] hover:bg-[#7F373B]/[0.08] transition-colors group"
          >
            <h3 className="font-bold text-[#7F373B] group-hover:text-[#6a2e31] mb-1">جامعة استنيا</h3>
            <p className="text-xs text-gray-500">Istinye University</p>
          </Link>
          <Link 
            to="/universities/bilgi" 
            className="text-center p-4 rounded-xl bg-[#7F373B]/[0.03] hover:bg-[#7F373B]/[0.08] transition-colors group"
          >
            <h3 className="font-bold text-[#7F373B] group-hover:text-[#6a2e31] mb-1">جامعة بلجي</h3>
            <p className="text-xs text-gray-500">Bilgi University</p>
          </Link>
          <Link 
            to="/social" 
            className="text-center p-4 rounded-xl bg-[#7F373B]/[0.03] hover:bg-[#7F373B]/[0.08] transition-colors group"
          >
            <h3 className="font-bold text-[#7F373B] group-hover:text-[#6a2e31] mb-1">تابعنا</h3>
            <p className="text-xs text-gray-500">Social Media</p>
          </Link>
          <Link 
            to="/contact" 
            className="text-center p-4 rounded-xl bg-[#7F373B]/[0.03] hover:bg-[#7F373B]/[0.08] transition-colors group"
          >
            <h3 className="font-bold text-[#7F373B] group-hover:text-[#6a2e31] mb-1">تواصل معنا</h3>
            <p className="text-xs text-gray-500">Contact Us</p>
          </Link>
        </nav>
      </div>
    </section>
  );
};

export default QuickLinksSection;
