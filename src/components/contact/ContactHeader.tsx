import React from 'react';

const ContactHeader: React.FC = () => {
  return (
    <div className="text-center mb-8 sm:mb-12">
      <span className="section-divider"></span>
      <h1 className="text-3xl sm:text-5xl font-bold text-[#7F373B] mb-4">
        تواصل معنا
      </h1>
      <p className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto leading-relaxed">
        نسعد بسماع رسالتك
      </p>
    </div>
  );
};

export default ContactHeader;
