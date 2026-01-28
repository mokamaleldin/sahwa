import React from 'react';

const ContactHeader: React.FC = () => {
  return (
    <div className="text-center mb-12">
      <span className="inline-block w-12 h-0.5 bg-[#C79250] mb-6"></span>
      <h1 className="text-4xl sm:text-5xl font-bold text-[#7F373B] mb-4">
        تواصل معنا
      </h1>
      <p className="text-lg text-gray-600 max-w-xl mx-auto leading-relaxed">
        نسعد بسماع رسالتك
      </p>
    </div>
  );
};

export default ContactHeader;
