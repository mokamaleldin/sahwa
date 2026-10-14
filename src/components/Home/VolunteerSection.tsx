import React from 'react';
import { ExternalLink, HeartHandshake } from 'lucide-react';

const VolunteerSection: React.FC = () => {
  return (
    <section id="volunteer" className="py-14 sm:py-20 bg-transparent">
      <div className="page-container max-w-xl text-center">
        <div className="section-card p-8 sm:p-10 border border-[#752026]/15 flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-[#D6AD63]/15 text-[#752026] flex items-center justify-center mb-5">
            <HeartHandshake size={24} aria-hidden="true" />
          </div>

          <span className="section-divider mb-4"></span>

          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-[#752026] mb-3">
            كُنْ جُزْءًا مِنَ الأَثَرِ
          </h2>

          <p className="text-base sm:text-lg text-[#350E15]/90 mb-8 font-medium">
            فرصة للتطوع في صحوة
          </p>

          <a
            href="https://forms.gle/yGQ8Q2oY89Dk6DhL7"
            target="_blank"
            rel="noopener noreferrer"
            className="tap-target inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-[#752026] text-[#F2E9E2] font-medium text-sm sm:text-base shadow-sm hover:bg-[#350E15] transition-all duration-200"
          >
            <span>فرصة للتطوع في صحوة</span>
            <ExternalLink size={16} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default VolunteerSection;
