import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Header from '../components/shared/Header';
import Footer from '../components/shared/Footer';
import SEO from '../components/SEO';

const Home: React.FC = () => {
  // Comprehensive structured data for homepage
  const homepageStructuredData = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": "https://sahwa.space/#webpage",
      "name": "صحوة - Sahwa | مجتمع طلابي شبابي",
      "description": "صحوة مساحة شبابية لطلاب الجامعات في تركيا. نجتمع حول الصحبة الصالحة والوعي والعمل. Sahwa student community in Turkey.",
      "url": "https://sahwa.space/",
      "inLanguage": "ar",
      "isPartOf": {
        "@id": "https://sahwa.space/#website"
      },
      "about": {
        "@id": "https://sahwa.space/#organization"
      },
      "primaryImageOfPage": {
        "@type": "ImageObject",
        "url": "https://sahwa.space/og-image.png"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "صحوة - الصفحة الرئيسية",
      "description": "الصفحة الرئيسية لمجتمع صحوة الطلابي",
      "url": "https://sahwa.space/",
      "mainEntity": {
        "@type": "ItemList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "الجامعات",
            "url": "https://sahwa.space/universities"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "تابعنا",
            "url": "https://sahwa.space/social"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": "تواصل معنا",
            "url": "https://sahwa.space/contact"
          }
        ]
      }
    }
  ];

  const breadcrumbs = [
    { name: "الرئيسية", url: "/" }
  ];

  return (
    <>
      <SEO
        title="صحوة | Sahwa - مجتمع طلابي شبابي في الجامعات التركية"
        description="صحوة (Sahwa) مساحة شبابية لطلاب الجامعات في تركيا. نجتمع حول الصحبة الصالحة والوعي والعمل. انضم لمجتمع صحوة الطلابي في جامعات إسطنبول - جامعة استنيا وجامعة بلجي."
        keywords="صحوة لشباب أمتنا, مجتمع طلابي تركيا, student community Istanbul, طلاب جامعات إسطنبول, صحوة جامعية, Sahwa youth, youth student community"
        canonicalUrl="/"
        structuredData={homepageStructuredData}
        breadcrumbs={breadcrumbs}
      />
      <Header />
      
      <main className="min-h-screen bg-[#FFFEFD]">
        {/* Hero Section - Minimal & Calm */}
        <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
          {/* Subtle decorative elements */}
          <div className="absolute top-20 right-10 w-72 h-72 bg-[#7F373B]/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-[#C79250]/5 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 text-center px-6 sm:px-8 max-w-4xl mx-auto pt-24">
            {/* Main Title */}
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold text-[#7F373B] mb-6 animate-fade-in-up">
              صحوة
            </h1>
            
            {/* Slogan */}
            <p className="text-xl sm:text-2xl text-[#C79250] font-medium mb-16 animate-fade-in-up animation-delay-200">
              صحوة لشباب أمتنا
            </p>
            
            {/* Scroll hint */}
            <button 
              onClick={() => document.getElementById('definition')?.scrollIntoView({ behavior: 'smooth' })}
              className="animate-fade-in-up animation-delay-400 group"
              aria-label="اكتشف المزيد"
            >
              <div className="w-8 h-14 border-2 border-[#7F373B]/30 rounded-full flex justify-center mx-auto hover:border-[#7F373B]/60 transition-colors">
                <div className="w-1.5 h-4 bg-[#7F373B]/40 rounded-full mt-3 animate-bounce"></div>
              </div>
            </button>
          </div>
        </section>

        {/* Definition Section */}
        <section id="definition" className="py-24 sm:py-32 bg-[#FFFEFD]">
          <div className="max-w-3xl mx-auto px-6 sm:px-8">
            <div className="text-center">
              <span className="inline-block w-12 h-0.5 bg-[#C79250] mb-8"></span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#7F373B] mb-10">
                ما هي صحوة؟
              </h2>
              
              <p className="text-lg sm:text-xl leading-[2] text-gray-600 font-light">
                صحوة مساحة شبابية تنطلق من هوية هذه الأمة،
                <br />
                تجمع الطلاب حول الصحبة الصالحة والوعي والعمل،
                <br />
                لنعيش الإسلام بإخلاص في حياتنا الجامعية اليومية،
                <br />
                ونُعِد أنفسنا لنكون مساهمين حقيقيين في نهضة الأمة.
              </p>
            </div>
          </div>
        </section>

        {/* Goal Section */}
        <section className="py-24 sm:py-32 bg-[#7F373B]/[0.02]">
          <div className="max-w-3xl mx-auto px-6 sm:px-8">
            <div className="text-center">
              <span className="inline-block w-12 h-0.5 bg-[#C79250] mb-8"></span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#7F373B] mb-10">
                هدفنا
              </h2>
              
              <p className="text-lg sm:text-xl leading-[2] text-gray-600 font-light">
                بناء نوى طلابية داخل الجامعات توفر بيئة إيمانية آمنة وصحبة واعية،
                <br />
                تُعين الطلاب على عيش دينهم بثبات ووعي في الحياة الجامعية،
                <br />
                وتُعِدهم فكريًا وسلوكيًا ليكونوا نافعين لمجتمعهم وأمتهم.
              </p>
            </div>
          </div>
        </section>

        {/* Slogan Section - Elegant */}
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

        {/* CTA Section - Enhanced with Internal Links */}
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

        {/* Quick Links Section - SEO Internal Linking */}
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
      </main>

      <Footer />
    </>
  );
};

export default Home;
