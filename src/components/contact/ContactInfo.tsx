import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

const ContactInfo: React.FC = () => {
  return (
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
  );
};

export default ContactInfo;
