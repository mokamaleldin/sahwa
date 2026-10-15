import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowLeft } from 'lucide-react';
import SEO from '../components/SEO';
import PageHeading, { PageEmblem } from '../components/shared/PageIdentity';

interface University {
  id: string;
  name: string;
  nameEn: string;
  city: string;
  description: string;
}

const universities: University[] = [
  {
    id: 'istinye',
    name: 'جامعة استنيا',
    nameEn: 'Istinye University',
    city: 'إسطنبول',
    description: 'مجتمع طلابي نشط يجمع طلاب استنيا حول الصحبة الصالحة والوعي',
  },
  {
    id: 'bilgi',
    name: 'جامعة بلجي',
    nameEn: 'Bilgi University',
    city: 'إسطنبول',
    description: 'مساحة شبابية لطلاب بلجي تنطلق من هوية الأمة',
  },
  {
    id: 'gelisim',
    name: 'جامعة جيليشيم',
    nameEn: 'Gelişim University',
    city: 'إسطنبول',
    description: 'مجتمع طلابي يجمع طلاب جيليشيم حول القيم والوعي',
  },
];

const Universities: React.FC = () => {
  // Structured data for universities listing
  const universitiesStructuredData = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": "https://sahwa.space/universities#webpage",
      "name": "جامعات صحوة - Sahwa Universities",
      "description": "اكتشف مجتمعات صحوة الطلابية في الجامعات التركية - جامعة استنيا وجامعة بلجي في إسطنبول",
      "url": "https://sahwa.space/universities",
      "isPartOf": {
        "@id": "https://sahwa.space/#website"
      },
      "mainEntity": {
        "@type": "ItemList",
        "itemListElement": universities.map((uni, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "name": uni.name,
          "url": `https://sahwa.space/universities/${uni.id}`
        }))
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "EducationalOrganization",
      "name": "صحوة - مجتمعات الجامعات",
      "description": "مجتمعات صحوة الطلابية في جامعات تركيا",
      "areaServed": {
        "@type": "City",
        "name": "Istanbul",
        "alternateName": "إسطنبول"
      }
    }
  ];

  const breadcrumbs = [
    { name: "الرئيسية", url: "/" },
    { name: "الجامعات", url: "/universities" }
  ];

  return (
    <>
      <SEO
        title="الجامعات | صحوة - Sahwa Universities Turkey"
        description="اكتشف مجتمعات صحوة الطلابية في الجامعات التركية. انضم لمجتمع صحوة في جامعة استنيا Istinye University أو جامعة بلجي Bilgi University في إسطنبول. Student communities in Istanbul universities."
        keywords="صحوة جامعات, جامعة استنيا, جامعة بلجي, Istinye University, Bilgi University, طلاب إسطنبول, student groups Istanbul, university community Turkey, صحوة استنيا, صحوة بلجي"
        canonicalUrl="/universities"
        structuredData={universitiesStructuredData}
        breadcrumbs={breadcrumbs}
      />
      
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
                    <p className="text-sm text-[#765C5E]">{university.nameEn}</p>
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
