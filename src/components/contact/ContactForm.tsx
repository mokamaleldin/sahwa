import React from 'react';
import { Send } from 'lucide-react';

interface ContactFormProps {
  formData: {
    name: string;
    email: string;
    phone: string;
    message: string;
  };
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const ContactForm: React.FC<ContactFormProps> = ({ formData, isSubmitting, onSubmit, onChange }) => {
  return (
    <div className="lg:col-span-3">
      <form onSubmit={onSubmit} className="bg-white border border-gray-100 rounded-2xl p-8">
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
              onChange={onChange}
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
              onChange={onChange}
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
              onChange={onChange}
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
              onChange={onChange}
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
  );
};

export default ContactForm;
