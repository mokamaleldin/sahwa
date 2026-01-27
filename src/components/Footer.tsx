import React from 'react';
import { Mail, Phone, MapPin, Instagram, Youtube, Send, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#7F373B] text-white py-12 sm:py-16" role="contentinfo">
      <div className="max-w-5xl mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 sm:gap-12">
          {/* Brand */}
          <div className="text-center md:text-right">
            <h2 className="text-2xl font-bold mb-4 text-white/70">صحوة</h2>
            <p className="text-white/70 leading-relaxed text-sm">
              مساحة شبابية تنطلق من هوية هذه الأمة، تجمع الطلاب حول الصحبة الصالحة والوعي والعمل.
            </p>
          </div>

          {/* Quick Links */}
          <nav className="text-center md:text-right" aria-label="روابط سريعة">
            <h3 className="text-lg font-semibold mb-4 text-white/70">روابط سريعة</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-white/70 hover:text-white transition-colors text-sm">
                  الرئيسية
                </Link>
              </li>
              <li>
                <Link to="/universities" className="text-white/70 hover:text-white transition-colors text-sm">
                  الجامعات
                </Link>
              </li>
              <li>
                <Link to="/social" className="text-white/70 hover:text-white transition-colors text-sm">
                  تابعنا
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-white/70 hover:text-white transition-colors text-sm">
                  تواصل معنا
                </Link>
              </li>
            </ul>
          </nav>

          {/* Contact */}
          <address className="text-center md:text-right not-italic">
            <h3 className="text-lg font-semibold mb-4 text-white/70">تواصل معنا</h3>
            <div className="space-y-3 text-sm">
              <a href="mailto:sahwaturkey@gmail.com" className="flex items-center justify-center md:justify-start gap-3 text-white/70 hover:text-white transition-colors">
                <Mail size={16} />
                sahwaturkey@gmail.com
              </a>
              <a href="tel:+905345195501" className="flex items-center justify-center md:justify-start gap-3 text-white/70 hover:text-white transition-colors">
                <Phone size={16} />
                +90 534 519 5501
              </a>
              <div className="flex items-center justify-center md:justify-start gap-3 text-white/70">
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
                className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors"
                aria-label="انستجرام"
              >
                <Instagram size={16} />
              </a>
              <a
                href="https://www.youtube.com/@sahwatr"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors"
                aria-label="يوتيوب"
              >
                <Youtube size={16} />
              </a>
              <a
                href="https://t.me/sahwatr"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors"
                aria-label="تيليجرام"
              >
                <Send size={16} />
              </a>
              <a
                href="https://whatsapp.com/channel/0029Vb7fQXK5K3zbii8FQN2y"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors"
                aria-label="واتساب"
              >
                <MessageCircle size={16} />
              </a>
            </div>
          </address>
        </div>

        <div className="border-t border-white/10 mt-10 pt-8 text-center">
          <p className="text-white/40 text-sm">
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