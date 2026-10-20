import React from 'react';
import SEO from '../components/SEO';
import HeroSection from '../components/Home/HeroSection';
import DefinitionSection from '../components/Home/DefinitionSection';
import VisionSection from '../components/Home/VisionSection';
import PillarsSection from '../components/Home/PillarsSection';
import VolunteerSection from '../components/Home/VolunteerSection';

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
            "name": "تسجيل الدخول",
            "url": "https://sahwa.space/login"
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
        description="صحوة مساحة شبابية تجمع الشباب على الصحبة الصالحة، والقرآن، ومعنى الأمة الواحدة، وتساعدهم على النمو في إيمانهم ووعيهم ومسؤوليتهم، ليكونوا أنفع لأنفسهم ومجتمعهم وأمتهم."
        keywords="صحوة, الركائز الأربع, مجتمع طلابي تركيا, student community Istanbul, طلاب جامعات إسطنبول, صحوة جامعية, Sahwa youth, youth student community"
        canonicalUrl="/"
        structuredData={homepageStructuredData}
        breadcrumbs={breadcrumbs}
      />
      <main className="app-shell">
        <HeroSection />
        <DefinitionSection />
        <VisionSection />
        <PillarsSection />
        <VolunteerSection />
      </main>
    </>
  );
};

export default Home;
