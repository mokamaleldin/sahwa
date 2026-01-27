import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

const Home: React.FC = () => {
  const homepageStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "صحوة - مساحة شبابية",
    "description": "صحوة مساحة شبابية تنطلق من هوية هذه الأمة",
    "url": "https://sahwa.space/",
    "mainEntity": {
      "@type": "Organization",
      "name": "صحوة",
      "description": "مساحة شبابية لطلاب الجامعات"
    }
  };

  return (
    <>
      <SEO
        title="صحوة - صحوة لشباب أمتنا"
        description="صحوة مساحة شبابية تنطلق من هوية هذه الأمة، تجمع الطلاب حول الصحبة الصالحة والوعي والعمل"
        keywords="صحوة, Sahwa, طلاب جامعات, شباب مسلم, تركيا"
        canonicalUrl="/"
        structuredData={homepageStructuredData}
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
            <span className="text-[200px] sm:text-[300px] font-bold text-[#7F373B] select-none">ص</span>
          </div>
          
          <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-8 text-center">
            <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#7F373B] leading-relaxed">
              صحوة
              <span className="text-[#C79250] mx-4">—</span>
              صحوة لشباب أمتنا
            </p>
          </div>
        </section>

        {/* CTA Section - Simple */}
        <section className="py-20 sm:py-24 bg-[#7F373B]/[0.02]">
          <div className="max-w-3xl mx-auto px-6 sm:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#7F373B] mb-4">
              كن جزءًا من صحوة
            </h2>
            <p className="text-gray-600 mb-10">
              اكتشف مجتمعنا في جامعتك
            </p>
            <Link 
              to="/universities" 
              className="inline-flex items-center gap-3 bg-[#7F373B] text-white px-8 py-4 rounded-full font-medium text-lg hover:bg-[#6a2e31] transition-all duration-300 group"
            >
              اكتشف الجامعات
              <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default Home;
