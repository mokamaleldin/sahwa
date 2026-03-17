import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { MessageCircle, ArrowRight, Users } from 'lucide-react';
import Header from '../components/shared/Header';
import Footer from '../components/shared/Footer';
import SEO from '../components/SEO';

interface UniversityData {
  id: string;
  name: string;
  nameEn: string;
  city: string;
  introduction: string;
  studentMessage: string;
  whatsappGroup: string;
}

const universitiesData: Record<string, UniversityData> = {
  'istinye': {
    id: 'istinye',
    name: 'جامعة استنيا',
    nameEn: 'Istinye University',
    city: 'إسطنبول',
    introduction: 'مرحبًا بكم في صحوة استنيا. نحن مجموعة من الطلاب نسعى لبناء بيئة صحية تُعين على الثبات والوعي خلال الحياة الجامعية.',
    studentMessage: 'نحن طلاب مثلكم، نفهم تحديات الحياة الجامعية ونسعى معًا للنمو والتطور. انضموا إلينا لنكون صحبة تعين بعضها على الخير.',
    whatsappGroup: 'https://chat.whatsapp.com/K3j6B1lcA42B80O1KpTLFO',
  },
  'bilgi': {
    id: 'bilgi',
    name: 'جامعة بلجي',
    nameEn: 'Bilgi University',
    city: 'إسطنبول',
    introduction: 'أهلًا بكم في صحوة بلجي. نجتمع هنا لنعيش قيمنا بوعي وإخلاص في حياتنا اليومية كطلاب جامعيين.',
    studentMessage: 'في بلجي، نبني مجتمعًا طلابيًا يجمعنا حول القيم والوعي. كن جزءًا من رحلتنا.',
    whatsappGroup: 'https://chat.whatsapp.com/BrHWBBCth9nCyxDw4a8pdH',
  },
  'gelisim': {
    id: 'gelisim',
    name: 'جامعة جيليشيم',
    nameEn: 'Gelişim University',
    city: 'إسطنبول',
    introduction: 'مرحبًا بكم في صحوة جيليشيم. نحن مجموعة من الطلاب نسعى لبناء بيئة صحية تُعين على الثبات والوعي خلال الحياة الجامعية.',
    studentMessage: 'نحن طلاب مثلكم، نفهم تحديات الحياة الجامعية ونسعى معًا للنمو والتطور. انضموا إلينا لنكون صحبة تعين بعضها على الخير.',
    whatsappGroup: 'https://chat.whatsapp.com/JFewtz9mYMHFNOWDXjNAsB',
  },
};

const UniversityPage: React.FC = () => {
  const { universityId } = useParams<{ universityId: string }>();
  const university = universityId ? universitiesData[universityId] : null;

  if (!university) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-32 pb-16 bg-[#FFFEFD]">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h1 className="text-4xl font-bold text-[#7F373B] mb-4">الجامعة غير موجودة</h1>
            <p className="text-gray-600 mb-8">عذرًا، لم نجد هذه الجامعة</p>
            <Link
              to="/universities"
              className="inline-flex items-center gap-2 text-[#7F373B] font-medium hover:gap-3 transition-all"
            >
              <ArrowRight size={20} />
              العودة للجامعات
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Comprehensive structured data for university page
  const universityStructuredData = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `https://sahwa.space/universities/${university.id}#webpage`,
      "name": `صحوة ${university.name} - Sahwa ${university.nameEn}`,
      "description": university.introduction,
      "url": `https://sahwa.space/universities/${university.id}`,
      "isPartOf": {
        "@id": "https://sahwa.space/#website"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "EducationalOrganization",
      "name": `صحوة ${university.name}`,
      "alternateName": [`Sahwa ${university.nameEn}`, `صحوة ${university.nameEn}`],
      "description": university.introduction,
      "url": `https://sahwa.space/universities/${university.id}`,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Istanbul",
        "addressCountry": "TR"
      },
      "parentOrganization": {
        "@id": "https://sahwa.space/#organization"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": `صحوة - ${university.name}`,
      "description": `مجتمع صحوة الطلابي في ${university.name}`,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": university.city,
        "addressCountry": "TR"
      }
    }
  ];

  const breadcrumbs = [
    { name: "الرئيسية", url: "/" },
    { name: "الجامعات", url: "/universities" },
    { name: university.name, url: `/universities/${university.id}` }
  ];

  return (
    <>
      <SEO
        title={`صحوة ${university.name} | Sahwa ${university.nameEn} - مجتمع طلابي`}
        description={`${university.introduction} انضم لمجتمع صحوة في ${university.name} (${university.nameEn}) في ${university.city}. Student community at ${university.nameEn} Istanbul.`}
        keywords={`صحوة ${university.name}, ${university.nameEn}, ${university.nameEn} students, طلاب ${university.name}, صحوة ${university.city}, student group ${university.nameEn}, مجتمع طلابي ${university.name}`}
        canonicalUrl={`/universities/${university.id}`}
        structuredData={universityStructuredData}
        breadcrumbs={breadcrumbs}
      />
      <Header />
      
      <main className="app-shell pt-24 sm:pt-28 pb-12 sm:pb-16">
        {/* Header */}
        <div className="page-container max-w-4xl mb-10 sm:mb-16">
          <Link
            to="/universities"
            className="tap-target inline-flex items-center gap-2 text-gray-500 hover:text-[#7F373B] mb-8 transition-colors text-sm"
          >
            <ArrowRight size={16} />
            جميع الجامعات
          </Link>
          
          <div className="text-center">
            <span className="section-divider"></span>
            <h1 className="text-3xl sm:text-5xl font-bold text-[#7F373B] mb-3">
              {university.name}
            </h1>
            <p className="text-gray-500">{university.nameEn} • {university.city}</p>
          </div>
        </div>

        {/* Introduction */}
        <section className="page-container max-w-4xl mb-12 sm:mb-16">
          <div className="section-card bg-[#7F373B]/[0.03] p-6 sm:p-10">
            <h2 className="text-xl font-bold text-[#7F373B] mb-4">مرحبًا بكم</h2>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
              {university.introduction}
            </p>
          </div>
        </section>

        {/* Student Message */}
        <section className="page-container max-w-4xl mb-12 sm:mb-16">
          <div className="section-card text-center p-6 sm:p-10">
            <div className="w-16 h-16 bg-[#C79250]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users size={28} className="text-[#C79250]" />
            </div>
            <h2 className="text-xl font-bold text-[#7F373B] mb-6">رسالة من الطلاب</h2>
            <blockquote className="text-lg sm:text-xl text-gray-600 leading-relaxed font-light">
              "{university.studentMessage}"
            </blockquote>
          </div>
        </section>

        {/* CTA - Join */}
        <section className="page-container max-w-4xl">
          <div className="bg-[#7F373B] rounded-3xl p-7 sm:p-12 text-center relative overflow-hidden shadow-xl">
            {/* Decorative */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#C79250]/20 rounded-full translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -translate-x-1/2 translate-y-1/2"></div>
            
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                انضم إلى صحوة {university.name.replace('جامعة ', '')}
              </h2>
              <p className="text-white/70 mb-8 max-w-md mx-auto">
                كن جزءًا من مجتمعنا الطلابي
              </p>
              
              <a
                href={university.whatsappGroup}
                target="_blank"
                rel="noopener noreferrer"
                className="tap-target inline-flex items-center justify-center gap-3 bg-white text-[#7F373B] px-6 sm:px-8 py-3.5 rounded-xl font-medium text-base sm:text-lg hover:bg-gray-100 transition-colors"
              >
                <MessageCircle size={22} />
                انضم عبر واتساب
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default UniversityPage;
