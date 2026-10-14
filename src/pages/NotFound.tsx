import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import Header from '../components/shared/Header';
import Footer from '../components/shared/Footer';
import SEO from '../components/SEO';

const NotFoundPage: React.FC = () => {
  return (
    <>
      <SEO
        title="الصفحة غير موجودة - 404"
        description="عذراً، الصفحة التي تبحث عنها غير موجودة. يمكنك العودة للصفحة الرئيسية."
        noindex={true}
      />
      <Header />
      <main className="app-shell flex items-center justify-center pt-24 pb-12" dir="rtl">
        <div className="text-center page-container max-w-lg">
          <div className="section-card p-7 sm:p-10">
            <div className="text-8xl sm:text-9xl font-bold text-[#752026]/10 mb-6">404</div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#752026] mb-4">
            الصفحة غير موجودة
            </h1>
            <p className="text-[#765C5E] mb-8 sm:mb-10 leading-relaxed">
            عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
            </p>
            <Link
              to="/"
              className="tap-target inline-flex items-center gap-3 bg-[#752026] text-[#F2E9E2] px-7 py-3.5 rounded-xl font-medium hover:bg-[#350E15] transition-colors duration-200"
            >
              <Home size={20} />
              العودة للرئيسية
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default NotFoundPage;
