'use client';

import React from 'react';
import { useParams, Link } from '../lib/navigation';
import { MessageCircle, ArrowRight, Users } from 'lucide-react';
import PageHeading, { PageEmblem } from '../components/shared/PageIdentity';
import { getUniversityById } from '../data/universities';

const UniversityPage: React.FC = () => {
  const { universityId } = useParams<{ universityId: string }>();
  const university = universityId ? getUniversityById(universityId) : undefined;

  if (!university) {
    return (
      <>
        <main className="app-shell sahwa-page-surface pt-24 sm:pt-28 pb-16">
          <PageEmblem />
          <div className="page-container max-w-4xl text-center">
            <PageHeading title="الجامعة غير موجودة" description="عذرًا، لم نجد هذه الجامعة" />
            <Link
              to="/universities"
              className="inline-flex items-center gap-2 text-[#7F373B] font-medium hover:gap-3 transition-all"
            >
              <ArrowRight size={20} />
              العودة للجامعات
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <main className="app-shell sahwa-page-surface pt-24 sm:pt-28 pb-12 sm:pb-16">
        <PageEmblem />

        {/* Header */}
        <div className="page-container max-w-4xl relative z-10">
          <PageHeading title={university.name} description={`${university.nameEn} • ${university.city}`} className="!mb-6 sm:!mb-8" />
          <Link
            to="/universities"
            className="tap-target inline-flex items-center gap-2 text-[#765C5E] hover:text-[#752026] mb-8 transition-colors text-sm"
          >
            <ArrowRight size={16} />
            جميع الجامعات
          </Link>
        </div>

        {/* Introduction */}
        <section className="page-container max-w-4xl mb-12 sm:mb-16">
          <div className="section-card p-6 sm:p-10 text-right">
            <h2 className="text-xl font-bold text-[#752026] mb-4">مرحبًا بكم</h2>
            <p className="text-base sm:text-lg text-[#350E15]/85 leading-relaxed">
              {university.introduction}
            </p>
          </div>
        </section>

        {/* Student Message */}
        <section className="page-container max-w-4xl mb-12 sm:mb-16">
          <div className="section-card text-center p-6 sm:p-10">
            <div className="w-16 h-16 bg-[#D6AD63]/15 rounded-full flex items-center justify-center mx-auto mb-6 text-[#752026]">
              <Users size={28} />
            </div>
            <h2 className="text-xl font-bold text-[#752026] mb-6">رسالة من الطلاب</h2>
            <blockquote className="text-lg sm:text-xl text-[#350E15]/85 leading-relaxed font-normal">
              "{university.studentMessage}"
            </blockquote>
          </div>
        </section>

        {/* CTA - Join */}
        <section className="page-container max-w-4xl">
          <div className="bg-[#752026] rounded-3xl p-7 sm:p-12 text-center relative overflow-hidden shadow-lg text-[#F2E9E2]">
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#F2E9E2] mb-3">
                انضم إلى صحوة {university.name.replace('جامعة ', '')}
              </h2>
              <p className="text-[#F2E9E2]/80 mb-8 max-w-md mx-auto">
                كن جزءًا من مجتمعنا الطلابي
              </p>
              
              <a
                href={university.whatsappGroup}
                target="_blank"
                rel="noopener noreferrer"
                className="tap-target inline-flex items-center justify-center gap-3 bg-[#F2E9E2] text-[#752026] px-6 sm:px-8 py-3.5 rounded-xl font-medium text-base sm:text-lg hover:bg-white transition-colors shadow-sm"
              >
                <MessageCircle size={22} />
                <span>انضم عبر واتساب</span>
              </a>
            </div>
          </div>
        </section>
      </main>

    </>
  );
};

export default UniversityPage;
