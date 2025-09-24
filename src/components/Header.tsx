import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center px-4">
          <Link to="/" >
            <img
              src="logo.svg"
              alt="صحوة - sahwa"
              className="w-24 h-24 md:w-36 md:h-36"
            />
          </Link>

          {/* Desktop Navigation */}
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-reverse space-x-8">
            <Link
              to="/"
              className={`transition-colors duration-200 hover:text-[#c68f4f] ${isScrolled ? 'text-gray-700' : 'text-white'
                }`}
            >
              الرئيسية
            </Link>
            <Link
              to="/members"
              className={`transition-colors duration-200 hover:text-[#c68f4f] ${isScrolled ? 'text-gray-700' : 'text-white'
                }`}
            >
              الأعضاء
            </Link>
            <Link
              to="/programs"
              className={`transition-colors duration-200 hover:text-[#c68f4f] ${isScrolled ? 'text-gray-700' : 'text-white'
                }`}
            >
              برامجنا
            </Link>
            <Link
              to="/membership-card"
              className={`transition-colors duration-200 hover:text-[#c68f4f] ${isScrolled ? 'text-gray-700' : 'text-white'
                }`}
            >
              بطاقات العضوية
            </Link>
            <Link
              to="/contact"
              className={`transition-colors duration-200 hover:text-[#c68f4f] ${isScrolled ? 'text-gray-700' : 'text-white'
                }`}
            >
              انضم لنا
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`md:hidden p-2 rounded-lg transition-all duration-200 hover:bg-black/10 ${isScrolled ? 'text-gray-700' : 'text-white'
              }`}
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-4 right-4 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-gray-100 animate-fade-in">
            <div className="py-2">
              <Link
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-3 text-right text-sm font-medium text-gray-700 hover:text-[#c68f4f] hover:bg-gray-50 transition-all duration-200 border-b border-gray-100 last:border-b-0"
              >
                الرئيسية
              </Link>
              <Link
                to="/members"
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-3 text-right text-sm font-medium text-gray-700 hover:text-[#c68f4f] hover:bg-gray-50 transition-all duration-200 border-b border-gray-100 last:border-b-0"
              >
                الأعضاء
              </Link>
              <Link
                to="/programs"
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-3 text-right text-sm font-medium text-gray-700 hover:text-[#c68f4f] hover:bg-gray-50 transition-all duration-200 border-b border-gray-100 last:border-b-0"
              >
                برامجنا
              </Link>
              <Link
                to="/membership-card"
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-3 text-right text-sm font-medium text-gray-700 hover:text-[#c68f4f] hover:bg-gray-50 transition-all duration-200 border-b border-gray-100 last:border-b-0"
              >
                بطاقات العضوية
              </Link>
              <Link
                to="/contact"
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-3 text-right text-sm font-medium text-gray-700 hover:text-[#c68f4f] hover:bg-gray-50 transition-all duration-200"
              >
                انضم لنا
              </Link>
            </div>
          </div>
        )}
      </div>
      
    </header>
  );
};

export default Header;