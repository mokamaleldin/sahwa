import React from 'react';
import { Instagram, Youtube, Send, MessageCircle, Mail, Phone } from 'lucide-react';
import Header from '../components/shared/Header';
import Footer from '../components/shared/Footer';
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
      
      <main className="app-shell pt-24 sm:pt-28 pb-14 sm:pb-20 relative overflow-hidden">
        {/* Subtle side decorative emblem */}
        <div 
          className="absolute top-24 -left-16 sm:-left-12 pointer-events-none opacity-5 select-none"
          aria-hidden="true"
        >
          <img
            src="/sahwa-icon.png"
            alt=""
            className="w-72 h-72 sm:w-80 sm:h-80 object-contain"
          />
        </div>

        <div className="page-container max-w-5xl relative z-10">
          {/* Page Header */}
          <div className="text-center mb-10 sm:mb-16">
            <div className="mb-3 flex justify-center">
              <img
                src="/sahwa-icon.png"
                alt=""
                className="w-9 h-9 sm:w-11 sm:h-11 object-contain drop-shadow-sm"
              />
            </div>
            <span className="section-divider"></span>
            <h1 className="text-3xl sm:text-5xl font-heading font-bold text-[#752026] mb-4">
              تابعنا
            </h1>
            <p className="text-base sm:text-lg text-[#350E15]/80 max-w-xl mx-auto leading-relaxed">
              كن على اتصال مع مجتمع صحوة
            </p>
          </div>

          {/* 1. University Groups Section - First Priority */}
          <section className="mb-14 sm:mb-18" aria-labelledby="university-groups-heading">
            <div className="text-center mb-6 sm:mb-8">
              <h2 id="university-groups-heading" className="text-xl sm:text-2xl font-heading font-bold text-[#752026]">
                مجموعات الجامعات
              </h2>
              <p className="text-sm text-[#765C5E] mt-1">انضم لمجموعة جامعتك عبر واتساب</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <a
                href="https://chat.whatsapp.com/K3j6B1lcA42B80O1KpTLFO"
                target="_blank"
                rel="noopener noreferrer"
                className="group tap-target section-card p-5 hover:border-[#752026]/30 hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-[#752026]/[0.08] text-[#752026] rounded-xl flex items-center justify-center group-hover:bg-[#752026] group-hover:text-[#F2E9E2] transition-colors">
                  <MessageCircle size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-[#752026]">جامعة استينيا</h3>
                  <p className="text-sm text-[#765C5E]">مجموعة واتساب</p>
                </div>
              </a>
              
              <a
                href="https://chat.whatsapp.com/BrHWBBCth9nCyxDw4a8pdH"
                target="_blank"
                rel="noopener noreferrer"
                className="group tap-target section-card p-5 hover:border-[#752026]/30 hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-[#752026]/[0.08] text-[#752026] rounded-xl flex items-center justify-center group-hover:bg-[#752026] group-hover:text-[#F2E9E2] transition-colors">
                  <MessageCircle size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-[#752026]">جامعة بيلجي</h3>
                  <p className="text-sm text-[#765C5E]">مجموعة واتساب</p>
                </div>
              </a>
              
              <a
                href="https://chat.whatsapp.com/JFewtz9mYMHFNOWDXjNAsB"
                target="_blank"
                rel="noopener noreferrer"
                className="group tap-target section-card p-5 hover:border-[#752026]/30 hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-[#752026]/[0.08] text-[#752026] rounded-xl flex items-center justify-center group-hover:bg-[#752026] group-hover:text-[#F2E9E2] transition-colors">
                  <MessageCircle size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-[#752026]">جامعة جيليشيم</h3>
                  <p className="text-sm text-[#765C5E]">مجموعة واتساب</p>
                </div>
              </a>
            </div>
          </section>

          {/* 2. Social Media Platforms Section */}
          <section className="mb-14 sm:mb-18" aria-labelledby="social-platforms-heading">
            <div className="text-center mb-6 sm:mb-8">
              <h2 id="social-platforms-heading" className="text-xl sm:text-2xl font-bold text-[#752026]">
                منصات التواصل
              </h2>
              <p className="text-sm text-[#765C5E] mt-1">تابع محتوى وفعاليات صحوة</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {socialLinks.map((social, index) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group tap-target section-card p-5 sm:p-6 hover:border-[#752026]/30 hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-4 text-right"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <div className="w-12 h-12 bg-[#752026]/[0.07] text-[#752026] rounded-xl flex items-center justify-center group-hover:bg-[#752026] group-hover:text-[#F2E9E2] transition-colors flex-shrink-0">
                    {social.icon}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-lg font-bold text-[#752026] mb-0.5">{social.nameAr}</h3>
                    <p className="text-xs sm:text-sm text-[#765C5E] truncate">{social.description}</p>
                  </div>
                </a>
              ))}
            </div>
          </section>

          {/* 3. Direct Contact Section - Last Priority */}
          <section className="section-card p-6 sm:p-10 mb-12" aria-labelledby="direct-contact-heading">
            <h2 id="direct-contact-heading" className="text-xl sm:text-2xl font-bold text-[#752026] mb-6 text-center">
              تواصل مباشر
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a
                href="mailto:sahwaturkey@gmail.com"
                className="tap-target flex items-center gap-4 bg-[#F2E9E2] border border-[#752026]/10 rounded-xl p-4 hover:border-[#752026]/30 transition-all group"
              >
                <div className="w-11 h-11 bg-[#752026]/[0.07] rounded-xl flex items-center justify-center text-[#752026] group-hover:bg-[#752026] group-hover:text-[#F2E9E2] transition-colors">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-xs text-[#765C5E] mb-0.5">البريد الإلكتروني</p>
                  <p className="font-medium text-[#350E15] text-sm sm:text-base">sahwaturkey@gmail.com</p>
                </div>
              </a>
              
              <a
                href="tel:+905345195501"
                className="tap-target flex items-center gap-4 bg-[#F2E9E2] border border-[#752026]/10 rounded-xl p-4 hover:border-[#752026]/30 transition-all group"
              >
                <div className="w-11 h-11 bg-[#752026]/[0.07] rounded-xl flex items-center justify-center text-[#752026] group-hover:bg-[#752026] group-hover:text-[#F2E9E2] transition-colors">
                  <Phone size={20} />
                </div>
                <div>
                  <p className="text-xs text-[#765C5E] mb-0.5">الهاتف</p>
                  <p className="font-medium text-[#350E15] text-sm sm:text-base direction-ltr">+90 534 519 5501</p>
                </div>
              </a>
            </div>
          </section>

          
        </div>
      </main>

      <Footer />
    </>
  );
};


export default SocialMedia;
