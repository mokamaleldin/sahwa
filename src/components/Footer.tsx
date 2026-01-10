import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#7c393e] text-white py-12 sm:py-16" role="contentinfo">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
          <div className="text-center md:text-right">
            <h2 className="text-2xl font-bold mb-4">صحوة</h2>
            <p className="text-white/80 leading-relaxed">
              نطمح إلى بناء مجتمع واعي ومتطور من خلال برامجنا وأنشطتنا المتنوعة، لنساهم في تنمية المجتمع وتطويره.
            </p>
          </div>

          <nav className="text-center md:text-right" aria-label="روابط سريعة">
            <h3 className="text-xl font-semibold mb-4">الأقسام</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-white/80 hover:text-white transition-colors duration-200"
                >
                  الرئيسية
                </Link>
              </li>
              <li>
                <Link 
                  to="/members"
                  className="text-white/80 hover:text-white transition-colors duration-200"
                >
                  الأعضاء
                </Link>
              </li>
              <li>
                <Link 
                  to="/programs"
                  className="text-white/80 hover:text-white transition-colors duration-200"
                >
                  برامجنا
                </Link>
              </li>
              <li>
                <Link
                  to="/membership-card"
                  className="text-white/80 hover:text-white transition-colors duration-200"
                >
                  بطاقات العضوية
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-white/80 hover:text-white transition-colors duration-200"
                >
                  انضم لنا
                </Link>
              </li>
            </ul>
          </nav>

          <address className="text-center md:text-right not-italic">
            <h3 className="text-xl font-semibold mb-4">تواصل معنا</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-center md:justify-start space-x-reverse space-x-3">
                <Mail size={20} aria-hidden="true" />
                <a 
                  href="mailto:sahwa.org.tr@gmail.com" 
                  className="text-white/80 hover:text-white transition-colors"
                >
                  sahwa.org.tr@gmail.com
                </a>
              </div>
              <div className="flex items-center justify-center md:justify-start space-x-reverse space-x-3">
                <Phone size={20} aria-hidden="true" />
                <a 
                  href="tel:+905345195501" 
                  className="text-white/80 hover:text-white transition-colors"
                >
                  +905345195501
                </a>
              </div>
              <div className="flex items-center justify-center md:justify-start space-x-reverse space-x-3">
                <MapPin size={20} aria-hidden="true" />
                <span className="text-white/80">إسطنبول، تركيا</span>
              </div>
            </div>
          </address>
        </div>

        <div className="border-t border-white/20 mt-8 pt-8 text-center">
          <p className="text-white/60">
            © {new Date().getFullYear()} صحوة. جميع الحقوق محفوظة.
          </p>
          <p className="text-white/60 mt-2">
            Site by: <a href="https://www.mokamaleldin.com/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Mohamed Kamaleldin</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;