import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#7c393e] text-white py-12 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
          <div className="text-center md:text-right">
            <h3 className="text-2xl font-bold mb-4">صحوة</h3>
            <p className="text-white/80 leading-relaxed">
              نطمح إلى بناء مجتمع واعي ومتطور من خلال برامجنا وأنشطتنا المتنوعة، لنساهم في تنمية المجتمع وتطويره.
            </p>
          </div>

          <div className="text-center md:text-right">
            <h4 className="text-xl font-semibold mb-4">الأقسام</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="text-white/80 hover:text-white transition-colors duration-200"
                >
                  الرئيسية
                </button>
              </li>
              <li>
                <button 
                  onClick={() => document.getElementById('members')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-white/80 hover:text-white transition-colors duration-200"
                >
                  الأعضاء
                </button>
              </li>
              <li>
                <button 
                  onClick={() => document.getElementById('programs')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-white/80 hover:text-white transition-colors duration-200"
                >
                  برامجنا

                </button>
              </li>
              <li>
                <button
                  onClick={() => document.getElementById('membership-cards')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-white/80 hover:text-white transition-colors duration-200"
                >
                  بطاقات العضوية
                </button>
              </li>
              <li>
                <button
                  onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-white/80 hover:text-white transition-colors duration-200"
                >
                  انضم لنا
                </button>
              </li>
            </ul>
          </div>

          <div className="text-center md:text-right">
            <h4 className="text-xl font-semibold mb-4">انضم لنا</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-center md:justify-start space-x-reverse space-x-3">
                <Mail size={20} />
                <span className="text-white/80">sahwa.org.tr@gmail.com</span>
              </div>
              <div className="flex items-center justify-center md:justify-start space-x-reverse space-x-3">
                <Phone size={20} />
                <span className="text-white/80">+905345195501</span>
              </div>
              <div className="flex items-center justify-center md:justify-start space-x-reverse space-x-3">
                <MapPin size={20} />
                <span className="text-white/80">إسطنبول، تركيا</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-8 text-center">
          <p className="text-white/60">
            © 2025 صحوة. جميع الحقوق محفوظة.
          </p>
          <p className="text-white/60">
            Site by: <a href="https://www.mokamaleldin.com/" target="_blank" rel="noopener noreferrer">Mohamed Kamaleldin</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;