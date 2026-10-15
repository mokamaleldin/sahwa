import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { SITE_FEATURES } from '../../config/features';
import { useSession } from '../../auth/useSession';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { status } = useSession();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { to: '/', label: 'الرئيسية' },
    { to: '/universities', label: 'الجامعات' },
    ...(SITE_FEATURES.library ? [{ to: '/library', label: 'المكتبة' }] : []),
    { to: '/social', label: 'تابعنا' },
    ...(status === 'authenticated' ? [{ to: '/team', label: 'مساحة فريق صحوة' }]
      : status === 'anonymous' ? [{ to: '/login', label: 'تسجيل الدخول' }]
        : status === 'error' ? [{ to: '/team', label: 'مساحة الفريق' }] : []),
  ];

  const isLinkActive = (to: string) => {
    if (to === '/') return location.pathname === '/';
    return location.pathname.startsWith(to) || (to === '/team' && location.pathname === '/studio');
  };

  return (
    <header
      className={`fixed top-0 right-0 left-0 z-50 transition-colors duration-250 ${
        isScrolled
          ? 'bg-[#F2E9E2]/95 backdrop-blur-md border-b border-[#752026]/10 shadow-[0_2px_12px_rgba(53,14,21,0.04)]'
          : 'bg-[#F2E9E2]/85 backdrop-blur-sm border-b border-transparent'
      }`}
      role="banner"
    >
      <div className="page-container">
        <div className="flex justify-between items-center h-20 sm:h-24">
          {/* Sahwa Red Logo with Golden Arch */}
          <Link
            to="/"
            className="tap-target inline-flex items-center gap-3 focus-visible:outline-2 focus-visible:outline-[#D6AD63]"
            aria-label="صحوة - الصفحة الرئيسية"
          >
            <img
              src="/logo.png"
              alt="شعار صحوة"
              className="h-14 sm:h-16 md:h-18 w-auto object-contain transition-transform hover:scale-[1.02]"
              width="60"
              height="73"
              loading="eager"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav
            className="hidden md:flex items-center space-x-reverse space-x-2"
            aria-label="القائمة الرئيسية"
          >
            {navLinks.map((link) => {
              const active = isLinkActive(link.to);
              const classes = `tap-target inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                active
                  ? 'bg-[#752026] text-[#F2E9E2] shadow-sm'
                  : 'text-[#350E15] hover:text-[#752026] hover:bg-[#752026]/5'
              }`;

              return (
                <Link key={link.to} to={link.to} className={classes}>
                  {link.label}
                </Link>
              );
            })}
            {status === 'loading' && <span className="session-nav-placeholder" aria-label="جارٍ التحقق من حالة الدخول" />}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden tap-target inline-flex items-center justify-center p-2 rounded-xl border border-[#752026]/15 transition-all text-[#752026] bg-[#F2E9E2] hover:bg-[#752026]/5"
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
            className="md:hidden absolute top-[calc(100%-0.25rem)] left-4 right-4 bg-[#F2E9E2] rounded-2xl shadow-xl border border-[#752026]/15 animate-fade-in overflow-hidden p-2 z-50"
            aria-label="قائمة الجوال"
          >
            <div className="space-y-1">
              {navLinks.map((link) => {
                const active = isLinkActive(link.to);
                const classes = `tap-target flex items-center px-4 py-3 text-right font-medium text-sm rounded-xl transition-colors ${
                  active
                    ? 'bg-[#752026] text-[#F2E9E2]'
                    : 'text-[#350E15] hover:text-[#752026] hover:bg-[#752026]/5'
                }`;

                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setIsMenuOpen(false)}
                    className={classes}
                  >
                    {link.label}
                  </Link>
                );
              })}
              {status === 'loading' && <Link to="/team" className="tap-target flex px-4 py-3 text-brand-primary">مساحة الفريق</Link>}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;

