import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { to: '/', label: 'الرئيسية' },
    { to: '/universities', label: 'الجامعات' },
    { to: '/social', label: 'تابعنا' },
    { to: '/contact', label: 'تواصل معنا' },
  ];

  return (
    <header 
      className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#FFFEFD]/90 backdrop-blur-xl border-b border-[#7F373B]/10 shadow-sm'
          : 'bg-gradient-to-b from-[#FFFEFD] via-[#FFFEFD]/95 to-transparent'
      }`}
      role="banner"
    >
      <div className="page-container">
        <div className="flex justify-between items-center h-20 sm:h-24">
          <Link to="/" aria-label="صحوة - الصفحة الرئيسية">
            <img
              src="/logo.svg"
              alt="شعار صحوة"
              className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24"
              width="112"
              height="112"
              loading="eager"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-reverse space-x-3" aria-label="القائمة الرئيسية">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`tap-target inline-flex items-center px-4 rounded-xl transition-all duration-200 font-medium text-sm ${
                  location.pathname === link.to 
                    ? 'text-[#7F373B] bg-[#7F373B]/10' 
                    : 'text-gray-600 hover:text-[#7F373B] hover:bg-[#7F373B]/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden tap-target inline-flex items-center justify-center p-2 rounded-xl border border-[#7F373B]/15 transition-all duration-200 text-[#7F373B] bg-white/70 hover:bg-[#7F373B]/5"
            aria-label={isMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav 
            id="mobile-menu"
            className="md:hidden absolute top-[calc(100%-0.15rem)] left-4 right-4 bg-[#FFFEFD]/95 backdrop-blur-xl rounded-2xl shadow-xl border border-[#7F373B]/10 animate-fade-in overflow-hidden"
            aria-label="القائمة الجوال"
          >
            <div className="py-2">
              {navLinks.map((link, index) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMenuOpen(false)}
                  className={`tap-target flex items-center px-5 py-3.5 text-right font-medium transition-all duration-200 ${
                    location.pathname === link.to 
                      ? 'text-[#7F373B] bg-[#7F373B]/5' 
                      : 'text-gray-600 hover:text-[#7F373B] hover:bg-[#7F373B]/5'
                  } ${index < navLinks.length - 1 ? 'border-b border-gray-50' : ''}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;