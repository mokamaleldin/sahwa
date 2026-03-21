import React from 'react';
import SEO from '../components/SEO';
import ContactHeader from '../components/contact/ContactHeader';
import ContactInfo from '../components/contact/ContactInfo';
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
      <main className="app-shell pt-24 sm:pt-28 pb-14 sm:pb-20">
        <div className="page-container max-w-5xl">
          <ContactHeader />

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 sm:gap-8">
            <ContactInfo />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Contact;
