import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';


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

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  return (
    <header className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <img
              src={"/logo.png"}
              alt="صحوة Logo"
              className="h-20 w-auto object-contain"
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-reverse space-x-8">
            <button 
              onClick={() => scrollToSection('vision')}
              className={`transition-colors duration-200 hover:text-[#7c393e] ${
                isScrolled ? 'text-gray-700' : 'text-white'
              }`}
            >
              الرؤية
            </button>
            <button 
              onClick={() => scrollToSection('mission')}
              className={`transition-colors duration-200 hover:text-[#7c393e] ${
                isScrolled ? 'text-gray-700' : 'text-white'
              }`}
            >
              الرسالة
            </button>
            <button 
              onClick={() => scrollToSection('goals')}
              className={`transition-colors duration-200 hover:text-[#7c393e] ${
                isScrolled ? 'text-gray-700' : 'text-white'
              }`}
            >
              أهدافنا
            </button>
            <button 
              onClick={() => scrollToSection('values')}
              className={`transition-colors duration-200 hover:text-[#7c393e] ${
                isScrolled ? 'text-gray-700' : 'text-white'
              }`}
            >
              قيمنا ومبادئنا
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`md:hidden transition-colors duration-200 ${
              isScrolled ? 'text-gray-700' : 'text-white'
            }`}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-md rounded-lg shadow-lg mb-4 animate-fade-in">
            <div className="py-4 space-y-4">
              <button 
                onClick={() => scrollToSection('vision')}
                className="block w-full text-right px-4 py-2 text-gray-700 hover:text-[#7c393e] transition-colors duration-200"
              >
                الرؤية
              </button>
              <button 
                onClick={() => scrollToSection('mission')}
                className="block w-full text-right px-4 py-2 text-gray-700 hover:text-[#7c393e] transition-colors duration-200"
              >
                الرسالة
              </button>
              <button 
                onClick={() => scrollToSection('goals')}
                className="block w-full text-right px-4 py-2 text-gray-700 hover:text-[#7c393e] transition-colors duration-200"
              >
                أهدافنا
              </button>
              <button 
                onClick={() => scrollToSection('values')}
                className="block w-full text-right px-4 py-2 text-gray-700 hover:text-[#7c393e] transition-colors duration-200"
              >
                قيمنا ومبادئنا
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;