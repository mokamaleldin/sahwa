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
        <div className="flex justify-between items-center ">
          <Link to="/" >
            <img
              src="logo.svg"
              alt="صحوة - sahwa"
              className=" w-36 h-36"
            />
          </Link>

          {/* Desktop Navigation */}
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-reverse space-x-8">

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
              تواصل معنا
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`md:hidden transition-colors duration-200 ${isScrolled ? 'text-gray-700' : 'text-white'
              }`}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-md rounded-lg shadow-lg mb-4 animate-fade-in">
            <div className="py-3 space-y-4">
              <Link
                to="/members"
                className="block w-full text-right px-4 py-2 text-gray-700 hover:text-[#c68f4f] transition-colors duration-200"
              >
                الأعضاء
              </Link>
              <Link
                to="/programs"
                className="block w-full text-right px-4 py-2 text-gray-700 hover:text-[#c68f4f] transition-colors duration-200"
              >
                برامجنا
              </Link>
              <Link
                to="/membership-card"
                className="block w-full text-right px-4 py-2 text-gray-700 hover:text-[#c68f4f] transition-colors duration-200"
              >
                بطاقات العضوية
              </Link>
              <Link
                to="/contact"
                className="block w-full text-right px-4 py-2 text-gray-700 hover:text-[#c68f4f] transition-colors duration-200"
              >
                تواصل معنا
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;