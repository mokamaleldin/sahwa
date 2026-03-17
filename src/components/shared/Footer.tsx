import React from 'react';
import { Mail, Phone, MapPin, Instagram, Youtube, Send, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-b from-[#7F373B] to-[#6f3135] text-white py-12 sm:py-16 mt-16" role="contentinfo">
      <div className="page-container">
        <div className="section-card bg-white/[0.03] border-white/10 p-6 sm:p-8 lg:p-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 sm:gap-12">
          {/* Brand */}
            <div className="text-center md:text-right">
              <h2 className="text-2xl font-bold mb-4 text-white">صحوة</h2>
              <p className="text-white/75 leading-relaxed text-sm sm:text-base">
              مساحة شبابية تنطلق من هوية هذه الأمة، تجمع الطلاب حول الصحبة الصالحة والوعي والعمل.
              </p>
            </div>

          {/* Quick Links */}
            <nav className="text-center md:text-right" aria-label="روابط سريعة">
              <h3 className="text-lg font-semibold mb-4 text-white">روابط سريعة</h3>
              <ul className="space-y-2.5">
              <li>
                  <Link to="/" className="tap-target inline-flex items-center text-white/75 hover:text-white transition-colors text-sm sm:text-base">
                  الرئيسية
                  </Link>
              </li>
              <li>
                  <Link to="/universities" className="tap-target inline-flex items-center text-white/75 hover:text-white transition-colors text-sm sm:text-base">
                  الجامعات
                  </Link>
              </li>
              <li>
                  <Link to="/social" className="tap-target inline-flex items-center text-white/75 hover:text-white transition-colors text-sm sm:text-base">
                  تابعنا
                  </Link>
              </li>
              <li>
                  <Link to="/contact" className="tap-target inline-flex items-center text-white/75 hover:text-white transition-colors text-sm sm:text-base">
                  تواصل معنا
                  </Link>
              </li>
              </ul>
            </nav>

          {/* Contact */}
            <address className="text-center md:text-right not-italic">
              <h3 className="text-lg font-semibold mb-4 text-white">تواصل معنا</h3>
              <div className="space-y-3 text-sm sm:text-base">
                <a href="mailto:sahwaturkey@gmail.com" className="tap-target flex items-center justify-center md:justify-start gap-3 text-white/75 hover:text-white transition-colors">
                <Mail size={16} />
                sahwaturkey@gmail.com
              </a>
                <a href="tel:+905345195501" className="tap-target flex items-center justify-center md:justify-start gap-3 text-white/75 hover:text-white transition-colors">
                <Phone size={16} />
                +90 534 519 5501
              </a>
                <div className="flex items-center justify-center md:justify-start gap-3 text-white/75">
                <MapPin size={16} />
                إسطنبول، تركيا
                </div>
              </div>

            {/* Social Icons */}
              <div className="flex items-center justify-center md:justify-start gap-3 mt-6">
              <a
                href="https://www.instagram.com/sahwa.tr/"
                target="_blank"
                rel="noopener noreferrer"
                className="tap-target w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors"
                aria-label="انستجرام"
              >
                <Instagram size={16} />
              </a>
              <a
                href="https://www.youtube.com/@sahwatr"
                target="_blank"
                rel="noopener noreferrer"
                className="tap-target w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors"
                aria-label="يوتيوب"
              >
                <Youtube size={16} />
              </a>
              <a
                href="https://t.me/sahwatr"
                target="_blank"
                rel="noopener noreferrer"
                className="tap-target w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors"
                aria-label="تيليجرام"
              >
                <Send size={16} />
              </a>
              <a
                href="https://whatsapp.com/channel/0029Vb7fQXK5K3zbii8FQN2y"
                target="_blank"
                rel="noopener noreferrer"
                className="tap-target w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors"
                aria-label="واتساب"
              >
                <MessageCircle size={16} />
              </a>
              </div>
            </address>
            </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-6 text-center">
          <p className="text-white/50 text-sm">
            © {new Date().getFullYear()} صحوة
          </p>
          <p className="text-white/30 mt-2 text-xs">
            Site by: <a href="https://www.mokamaleldin.com/" target="_blank" rel="noopener noreferrer" className="hover:text-white/50 transition-colors">Mohamed Kamaleldin</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;