import React from 'react';
import { Instagram, Youtube, Send, MessageCircle, Mail, Phone } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

interface SocialLink {
  name: string;
  nameAr: string;
  handle: string;
  url: string;
  icon: React.ReactNode;
  description: string;
  featured?: boolean;
}

const socialLinks: SocialLink[] = [
  {
    name: 'WhatsApp Channel',
    nameAr: 'قناة واتساب',
    handle: 'صحوة',
    url: 'https://whatsapp.com/channel/0029Vb7fQXK5K3zbii8FQN2y',
    icon: <MessageCircle size={28} />,
    description: 'تابعنا على واتساب',
    featured: true,
  },
  {
    name: 'Telegram',
    nameAr: 'تيليجرام',
    handle: '@sahwatr',
    url: 'https://t.me/sahwatr',
    icon: <Send size={28} />,
    description: 'تابعنا على تيليجرام',
    featured: true,
  },
  {
    name: 'Instagram',
    nameAr: 'انستجرام',
    handle: '@sahwa.tr',
    url: 'https://www.instagram.com/sahwa.tr/',
    icon: <Instagram size={28} />,
    description: 'محتوى يومي ملهم',
  },
  {
    name: 'TikTok',
    nameAr: 'تيك توك',
    handle: '@sahwa.tr',
    url: 'https://www.tiktok.com/@sahwa.tr',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
      </svg>
    ),
    description: 'محتوى قصير وممتع',
  },
  {
    name: 'YouTube',
    nameAr: 'يوتيوب',
    handle: '@sahwatr',
    url: 'https://www.youtube.com/@sahwatr',
    icon: <Youtube size={28} />,
    description: 'محاضرات ومحتوى مرئي',
  },
];

const SocialMedia: React.FC = () => {
  // Comprehensive structured data for social media page
  const socialStructuredData = [
    {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      "@id": "https://sahwa.space/social#webpage",
      "name": "تابع صحوة - Sahwa Social Media",
      "description": "تابع صحوة على منصات التواصل الاجتماعي - واتساب، تيليجرام، انستجرام، تيك توك، يوتيوب",
      "url": "https://sahwa.space/social",
      "isPartOf": {
        "@id": "https://sahwa.space/#website"
      },
      "mainEntity": {
        "@type": "Organization",
        "@id": "https://sahwa.space/#organization"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "صحوة",
      "url": "https://sahwa.space",
      "sameAs": [
        "https://www.instagram.com/sahwa.tr/",
        "https://www.youtube.com/@sahwatr",
        "https://t.me/sahwatr",
        "https://www.tiktok.com/@sahwa.tr",
        "https://whatsapp.com/channel/0029Vb7fQXK5K3zbii8FQN2y"
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+905345195501",
        "email": "sahwaturkey@gmail.com",
        "contactType": "customer service",
        "availableLanguage": ["Arabic", "Turkish", "English"]
      }
    }
  ];

  const breadcrumbs = [
    { name: "الرئيسية", url: "/" },
    { name: "تابعنا", url: "/social" }
  ];

  return (
    <>
      <SEO
        title="تابعنا | صحوة - Sahwa Social Media"
        description="تابع صحوة Sahwa على منصات التواصل الاجتماعي. انضم لقناة واتساب صحوة، تيليجرام @sahwatr، انستجرام @sahwa.tr، تيك توك @sahwa.tr، يوتيوب @sahwatr. Follow Sahwa on WhatsApp, Telegram, Instagram, TikTok, YouTube."
        keywords="صحوة واتساب, صحوة انستجرام, صحوة تيليجرام, صحوة يوتيوب, صحوة تيك توك, Sahwa WhatsApp, Sahwa Instagram, @sahwa.tr, @sahwatr, قناة صحوة, sahwa telegram, sahwa social media"
        canonicalUrl="/social"
        structuredData={socialStructuredData}
        breadcrumbs={breadcrumbs}
      />
      <Header />
      
      <main className="min-h-screen pt-28 pb-20 bg-[#FFFEFD]">
        <div className="max-w-4xl mx-auto px-6 sm:px-8">
          {/* Page Header */}
          <div className="text-center mb-16">
            <span className="inline-block w-12 h-0.5 bg-[#C79250] mb-6"></span>
            <h1 className="text-4xl sm:text-5xl font-bold text-[#7F373B] mb-4">
              تابعنا
            </h1>
            <p className="text-lg text-gray-600 max-w-xl mx-auto leading-relaxed">
              كن على اتصال مع مجتمع صحوة
            </p>
          </div>

          {/* Featured - WhatsApp & Telegram */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {socialLinks.filter(s => s.featured).map((social, index) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`group relative bg-[#7F373B] text-white rounded-2xl p-6 hover:scale-[1.02] transition-all duration-300 animate-fade-in-up overflow-hidden`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Decorative accent */}
                <div className="absolute top-0 left-0 w-24 h-24 bg-[#C79250]/20 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                
                <div className="relative z-10 flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white/20 transition-colors">
                    {social.icon}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold mb-0.5">{social.nameAr}</h2>
                    <p className="text-white/70 text-sm">{social.description}</p>
                  </div>
                </div>
              </a>
            ))}
          </div>

          {/* Other Social Links */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-16">
            {socialLinks.filter(s => !s.featured).map((social, index) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white border border-gray-100 rounded-2xl p-6 hover:border-[#7F373B]/20 hover:shadow-lg transition-all duration-300 animate-fade-in-up text-center"
                style={{ animationDelay: `${(index + 2) * 100}ms` }}
              >
                <div className="w-14 h-14 bg-[#7F373B]/5 rounded-xl flex items-center justify-center mx-auto mb-4 text-[#7F373B] group-hover:bg-[#7F373B] group-hover:text-white transition-all duration-300">
                  {social.icon}
                </div>
                <h3 className="text-lg font-bold text-[#7F373B] mb-1">{social.nameAr}</h3>
                <p className="text-sm text-gray-500">{social.handle}</p>
              </a>
            ))}
          </div>

          {/* University Groups Section */}
          <div className="mb-12">
            <h2 className="text-xl font-bold text-[#7F373B] mb-6 text-center">مجموعات الجامعات</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a
                href="https://chat.whatsapp.com/K3j6B1lcA42B80O1KpTLFO"
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white border border-gray-100 rounded-2xl p-5 hover:border-[#7F373B]/20 hover:shadow-lg transition-all duration-300 flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center text-green-600 group-hover:bg-green-500 group-hover:text-white transition-all">
                  <MessageCircle size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-[#7F373B]">جامعة استينيا</h3>
                  <p className="text-sm text-gray-500">مجموعة واتساب</p>
                </div>
              </a>
              
              <a
                href="https://chat.whatsapp.com/BrHWBBCth9nCyxDw4a8pdH"
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white border border-gray-100 rounded-2xl p-5 hover:border-[#7F373B]/20 hover:shadow-lg transition-all duration-300 flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center text-green-600 group-hover:bg-green-500 group-hover:text-white transition-all">
                  <MessageCircle size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-[#7F373B]">جامعة بيلجي</h3>
                  <p className="text-sm text-gray-500">مجموعة واتساب</p>
                </div>
              </a>
            </div>
          </div>

          {/* Contact Section */}
          <div className="bg-[#7F373B]/[0.03] rounded-3xl p-8 sm:p-10 mb-12">
            <h2 className="text-xl font-bold text-[#7F373B] mb-6 text-center">تواصل مباشر</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a
                href="mailto:sahwaturkey@gmail.com"
                className="flex items-center gap-4 bg-white rounded-xl p-4 hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 bg-[#7F373B]/5 rounded-xl flex items-center justify-center text-[#7F373B] group-hover:bg-[#7F373B] group-hover:text-white transition-all">
                  <Mail size={22} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-0.5">البريد الإلكتروني</p>
                  <p className="font-medium text-gray-800">sahwaturkey@gmail.com</p>
                </div>
              </a>
              
              <a
                href="tel:+905345195501"
                className="flex items-center gap-4 bg-white rounded-xl p-4 hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 bg-[#7F373B]/5 rounded-xl flex items-center justify-center text-[#7F373B] group-hover:bg-[#7F373B] group-hover:text-white transition-all">
                  <Phone size={22} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-0.5">الهاتف</p>
                  <p className="font-medium text-gray-800 direction-ltr">+90 534 519 5501</p>
                </div>
              </a>
            </div>
          </div>

          
        </div>
      </main>

      <Footer />
    </>
  );
};


export default SocialMedia;
