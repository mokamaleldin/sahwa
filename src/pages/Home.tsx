import React from 'react';
import Header from '../components/shared/Header';
import Footer from '../components/shared/Footer';
import SEO from '../components/SEO';
import HeroSection from '../components/Home/HeroSection';
import DefinitionSection from '../components/Home/DefinitionSection';
import GoalSection from '../components/Home/GoalSection';
import SloganSection from '../components/Home/SloganSection';
import CTASection from '../components/Home/CTASection';
import QuickLinksSection from '../components/Home/QuickLinksSection';

const Home: React.FC = () => {
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
        <HeroSection />
        <DefinitionSection />
        <GoalSection />
        <SloganSection />
        <CTASection />
        <QuickLinksSection />
      </main>
      <Footer />
    </>
  );
};

export default Home;
