import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowLeft } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

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
      <Header />
      
      <main className="min-h-screen pt-28 pb-20 bg-[#FFFEFD]">
        <div className="max-w-4xl mx-auto px-6 sm:px-8">
          {/* Page Header */}
          <div className="text-center mb-16">
            <span className="inline-block w-12 h-0.5 bg-[#C79250] mb-6"></span>
            <h1 className="text-4xl sm:text-5xl font-bold text-[#7F373B] mb-4">
              الجامعات
            </h1>
            <p className="text-lg text-gray-600 max-w-xl mx-auto leading-relaxed">
              اكتشف مجتمع صحوة في جامعتك
            </p>
          </div>

          {/* Universities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {universities.map((university, index) => (
              <Link
                key={university.id}
                to={`/universities/${university.id}`}
                className="group bg-white border border-gray-100 rounded-2xl p-8 hover:border-[#7F373B]/20 hover:shadow-lg transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h2 className="text-2xl font-bold text-[#7F373B] mb-1 group-hover:text-[#6a2e31] transition-colors">
                      {university.name}
                    </h2>
                    <p className="text-sm text-gray-500">{university.nameEn}</p>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {university.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-400">
                    <MapPin size={16} />
                    <span className="text-sm">{university.city}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#C79250] font-medium group-hover:gap-3 transition-all">
                    <span className="text-sm">اكتشف</span>
                    <ArrowLeft size={16} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Universities;
