import React from 'react';
import { Mail, Phone, Instagram, Youtube, Send, MessageCircle } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="bg-[#F2E9E2] border-t border-[#752026]/12 py-10 sm:py-12 mt-16 text-[#350E15]"
      role="contentinfo"
    >
      <div className="page-container">
        <div className="flex flex-col items-center justify-center text-center space-y-6">
          {/* Secondary Golden Geometric Icon */}
          <div className="flex items-center justify-center">
            <img
              src="/sahwa-icon.png"
              alt="أيقونة صحوة"
              className="w-8 h-8 object-contain opacity-90 transition-transform hover:scale-110"
              width="32"
              height="32"
              loading="lazy"
            />
          </div>

          {/* Social and Contact Links */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-[#752026]">
            <a
              href="https://whatsapp.com/channel/0029Vb7fQXK5K3zbii8FQN2y"
              target="_blank"
              rel="noopener noreferrer"
              className="tap-target w-10 h-10 rounded-full bg-[#752026]/[0.06] hover:bg-[#752026] hover:text-[#F2E9E2] flex items-center justify-center transition-all duration-200"
              aria-label="قناة واتساب"
            >
              <MessageCircle size={18} />
            </a>
            <a
              href="https://t.me/sahwatr"
              target="_blank"
              rel="noopener noreferrer"
              className="tap-target w-10 h-10 rounded-full bg-[#752026]/[0.06] hover:bg-[#752026] hover:text-[#F2E9E2] flex items-center justify-center transition-all duration-200"
              aria-label="تيليجرام"
            >
              <Send size={18} />
            </a>
            <a
              href="https://www.instagram.com/sahwa.tr/"
              target="_blank"
              rel="noopener noreferrer"
              className="tap-target w-10 h-10 rounded-full bg-[#752026]/[0.06] hover:bg-[#752026] hover:text-[#F2E9E2] flex items-center justify-center transition-all duration-200"
              aria-label="انستجرام"
            >
              <Instagram size={18} />
            </a>
            <a
              href="https://www.youtube.com/@sahwatr"
              target="_blank"
              rel="noopener noreferrer"
              className="tap-target w-10 h-10 rounded-full bg-[#752026]/[0.06] hover:bg-[#752026] hover:text-[#F2E9E2] flex items-center justify-center transition-all duration-200"
              aria-label="يوتيوب"
            >
              <Youtube size={18} />
            </a>
            <a
              href="mailto:sahwaturkey@gmail.com"
              className="tap-target w-10 h-10 rounded-full bg-[#752026]/[0.06] hover:bg-[#752026] hover:text-[#F2E9E2] flex items-center justify-center transition-all duration-200"
              aria-label="البريد الإلكتروني"
            >
              <Mail size={18} />
            </a>
            <a
              href="tel:+905345195501"
              className="tap-target w-10 h-10 rounded-full bg-[#752026]/[0.06] hover:bg-[#752026] hover:text-[#F2E9E2] flex items-center justify-center transition-all duration-200"
              aria-label="الهاتف"
            >
              <Phone size={18} />
            </a>
          </div>

          {/* Minimal Copyright */}
          <div className="pt-2 text-xs sm:text-sm text-[#765C5E]">
            <p>© {currentYear} صحوة</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

