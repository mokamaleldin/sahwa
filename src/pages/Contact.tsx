import React, { useState } from 'react';
import SEO from '../components/SEO';
import ContactHeader from '../components/contact/ContactHeader';
import ContactInfo from '../components/contact/ContactInfo';
import ContactForm from '../components/contact/ContactForm';
import SuccessMessage from '../components/contact/SuccessMessage';
import Header from '../components/shared/Header';
import Footer from '../components/shared/Footer';

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
      <Header />
        <SEO
          title="تواصل معنا | صحوة - Contact Sahwa"
          description="تواصل مع فريق صحوة Sahwa. راسلنا على sahwaturkey@gmail.com أو اتصل على +905345195501. Contact Sahwa student community in Turkey."
          keywords="تواصل صحوة, contact sahwa, صحوة email, صحوة هاتف, sahwa contact, sahwa turkey contact, التواصل مع صحوة"
          canonicalUrl="/contact"
          structuredData={contactStructuredData}
          breadcrumbs={breadcrumbs}
        />
        <main className="min-h-screen pt-32 pb-16 bg-[#FFFEFD]">
          <SuccessMessage />
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
          <ContactHeader />

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <ContactInfo />
            <ContactForm 
              formData={formData}
              isSubmitting={isSubmitting}
              onSubmit={handleSubmit}
              onChange={handleChange}
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Contact;
