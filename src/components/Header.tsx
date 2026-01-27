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

  const navLinks = [
    { to: '/', label: 'الرئيسية' },
    { to: '/universities', label: 'الجامعات' },
    { to: '/social', label: 'تابعنا' },
    { to: '/contact', label: 'تواصل معنا' },
  ];

  return (
    <header 
      className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-[#FFFEFD]/95 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}
      role="banner"
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center px-6 py-2">
          <Link to="/" aria-label="صحوة - الصفحة الرئيسية">
            <img
              src="/logo.svg"
              alt="شعار صحوة"
              className="w-16 h-16 md:w-20 md:h-20"
              width="120"
              height="120"
              loading="eager"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-reverse space-x-8" aria-label="القائمة الرئيسية">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`transition-colors duration-200 font-medium text-sm ${
                  location.pathname === link.to 
                    ? 'text-[#7F373B]' 
                    : 'text-gray-600 hover:text-[#7F373B]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg transition-all duration-200 text-[#7F373B] hover:bg-[#7F373B]/5"
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
            className="md:hidden absolute top-full left-4 right-4 bg-[#FFFEFD] backdrop-blur-md rounded-2xl shadow-lg border border-gray-100 animate-fade-in overflow-hidden"
            aria-label="القائمة الجوال"
          >
            <div className="py-2">
              {navLinks.map((link, index) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-5 py-3 text-right font-medium transition-all duration-200 ${
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