import React from 'react';
import { CheckCircle } from 'lucide-react';

const SuccessMessage: React.FC = () => {
  return (
    <div className="page-container max-w-lg text-center">
      <div className="section-card p-7 sm:p-12">
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
          className="tap-target inline-flex items-center justify-center bg-[#7F373B] text-white px-7 py-3.5 rounded-xl font-medium hover:bg-[#6a2e31] transition-colors"
        >
          العودة للرئيسية
        </a>
      </div>
    </div>
  );
};

export default SuccessMessage;
