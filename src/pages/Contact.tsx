import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';
import Header from '../components/shared/Header';
import Footer from '../components/shared/Footer';
import SEO from '../components/SEO';

// Structured data for contact page
const contactStructuredData = [
  {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "@id": "https://sahwa.space/contact#webpage",
    "name": "تواصل مع صحوة - Contact Sahwa",
    "description": "تواصل مع فريق صحوة. راسلنا عبر البريد الإلكتروني أو الهاتف",
    "url": "https://sahwa.space/contact",
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
    "email": "sahwaturkey@gmail.com",
    "telephone": "+905345195501",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Istanbul",
      "addressCountry": "TR"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+905345195501",
      "email": "sahwaturkey@gmail.com",
      "contactType": "customer service",
      "availableLanguage": ["Arabic", "Turkish", "English"],
      "areaServed": "TR"
    }
  }
];

const breadcrumbs = [
  { name: "الرئيسية", url: "/" },
  { name: "تواصل معنا", url: "/contact" }
];

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Create mailto link with form data
    const subject = encodeURIComponent(`رسالة من ${formData.name}`);
    const body = encodeURIComponent(
      `الاسم: ${formData.name}\n` +
      `البريد الإلكتروني: ${formData.email}\n` +
      `${formData.phone ? `رقم الهاتف: ${formData.phone}\n` : ''}` +
      `\nالرسالة:\n${formData.message}`
    );
    
    // Open email client
    window.location.href = `mailto:sahwaturkey@gmail.com?subject=${subject}&body=${body}`;
    
    // Show success after a brief delay
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  if (isSubmitted) {
    return (
      <>
        <SEO
          title="تواصل معنا | صحوة - Contact Sahwa"
          description="تواصل مع فريق صحوة Sahwa. راسلنا على sahwaturkey@gmail.com أو اتصل على +905345195501. Contact Sahwa student community in Turkey."
          keywords="تواصل صحوة, contact sahwa, صحوة email, صحوة هاتف, sahwa contact, sahwa turkey contact, التواصل مع صحوة"
          canonicalUrl="/contact"
          structuredData={contactStructuredData}
          breadcrumbs={breadcrumbs}
        />
        <Header />
        <main className="min-h-screen pt-32 pb-16 bg-[#FFFEFD]">
          <div className="max-w-lg mx-auto px-6 text-center">
            <div className="bg-white border border-gray-100 rounded-3xl p-12">
              <div className="w-20 h-20 bg-[#7F373B]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={40} className="text-[#7F373B]" />
              </div>
              <h1 className="text-2xl font-bold text-[#7F373B] mb-4">
                شكرًا لتواصلك!
              </h1>
              <p className="text-gray-600 mb-8 leading-relaxed">
                سيتم فتح تطبيق البريد الإلكتروني لإرسال رسالتك. سنتواصل معك قريبًا.
              </p>
              <a
                href="/"
                className="inline-block bg-[#7F373B] text-white px-8 py-4 rounded-full font-medium hover:bg-[#6a2e31] transition-colors"
              >
                العودة للرئيسية
              </a>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <SEO
        title="تواصل معنا | صحوة - Contact Sahwa"
        description="تواصل مع فريق صحوة Sahwa. راسلنا على sahwaturkey@gmail.com أو اتصل على +905345195501. Contact Sahwa student community in Turkey."
        keywords="تواصل صحوة, contact sahwa, صحوة email, صحوة هاتف, sahwa contact, sahwa turkey contact, التواصل مع صحوة, انضم لصحوة, join sahwa"
        canonicalUrl="/contact"
        structuredData={contactStructuredData}
        breadcrumbs={breadcrumbs}
      />
      <Header />
      
      <main className="min-h-screen pt-28 pb-20 bg-[#FFFEFD]">
        <div className="max-w-4xl mx-auto px-6 sm:px-8">
          {/* Page Header */}
          <div className="text-center mb-12">
            <span className="inline-block w-12 h-0.5 bg-[#C79250] mb-6"></span>
            <h1 className="text-4xl sm:text-5xl font-bold text-[#7F373B] mb-4">
              تواصل معنا
            </h1>
            <p className="text-lg text-gray-600 max-w-xl mx-auto leading-relaxed">
              نسعد بسماع رسالتك
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Contact Info */}
            <div className="lg:col-span-2 space-y-4">
              <a
                href="mailto:sahwaturkey@gmail.com"
                className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl p-5 hover:border-[#7F373B]/20 hover:shadow-md transition-all group"
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
                className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl p-5 hover:border-[#7F373B]/20 hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 bg-[#7F373B]/5 rounded-xl flex items-center justify-center text-[#7F373B] group-hover:bg-[#7F373B] group-hover:text-white transition-all">
                  <Phone size={22} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-0.5">الهاتف</p>
                  <p className="font-medium text-gray-800">+90 534 519 5501</p>
                </div>
              </a>

              <div className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl p-5">
                <div className="w-12 h-12 bg-[#7F373B]/5 rounded-xl flex items-center justify-center text-[#7F373B]">
                  <MapPin size={22} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-0.5">الموقع</p>
                  <p className="font-medium text-gray-800">إسطنبول، تركيا</p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-3">
              <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-2xl p-8">
                <div className="space-y-5">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      الاسم <span className="text-[#7F373B]">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-[#FFFEFD] border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C79250]/50 focus:border-[#C79250] transition-all outline-none"
                      placeholder="أدخل اسمك"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      البريد الإلكتروني <span className="text-[#7F373B]">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-[#FFFEFD] border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C79250]/50 focus:border-[#C79250] transition-all outline-none"
                      placeholder="example@email.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      رقم الهاتف <span className="text-gray-400 text-xs">(اختياري)</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-[#FFFEFD] border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C79250]/50 focus:border-[#C79250] transition-all outline-none"
                      placeholder="+90 XXX XXX XX XX"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      الرسالة <span className="text-[#7F373B]">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={5}
                      required
                      className="w-full px-4 py-3 bg-[#FFFEFD] border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C79250]/50 focus:border-[#C79250] transition-all outline-none resize-none"
                      placeholder="اكتب رسالتك هنا..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#7F373B] text-white py-4 rounded-xl font-medium text-lg hover:bg-[#6a2e31] transition-colors flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <span>جارٍ الإرسال...</span>
                    ) : (
                      <>
                        <Send size={20} />
                        إرسال الرسالة
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Contact;
