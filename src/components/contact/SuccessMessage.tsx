import React from 'react';
import { CheckCircle } from 'lucide-react';

const SuccessMessage: React.FC = () => {
  return (
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
  );
};

export default SuccessMessage;
