'use client';

import React from 'react';
import { Link } from '../lib/navigation';
import { MapPin, ArrowLeft } from 'lucide-react';
import PageHeading, { PageEmblem } from '../components/shared/PageIdentity';
import { universities } from '../data/universities';

const Universities: React.FC = () => {
  return (
    <>
      <main className="app-shell sahwa-page-surface pt-24 sm:pt-28 pb-14 sm:pb-20">
        <PageEmblem />

        <div className="page-container max-w-5xl relative z-10">
          <PageHeading title="الجامعات" description="اكتشف مجتمع صحوة في جامعتك" />

          {/* Universities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {universities.map((university, index) => (
              <Link
                key={university.id}
                to={`/universities/${university.id}`}
                className="group section-card p-5 sm:p-7 hover:border-[#752026]/30 hover:-translate-y-0.5 transition-all duration-200 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-[#752026] mb-1 group-hover:text-[#350E15] transition-colors">
                      {university.name}
                    </h2>
                    <p className="text-sm text-[#765C5E]" lang="en" dir="ltr">{university.nameEn}</p>
                  </div>
                </div>
                
                <p className="text-[#350E15]/85 mb-6 leading-relaxed">
                  {university.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#765C5E]">
                    <MapPin size={16} />
                    <span className="text-sm">{university.city}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#752026] font-medium group-hover:gap-3 transition-all">
                    <span className="text-sm">اكتشف</span>
                    <ArrowLeft size={16} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

    </>
  );
};

export default Universities;
