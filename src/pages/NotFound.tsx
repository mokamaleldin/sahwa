import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import SEO from '../components/SEO';
import Header from '../components/shared/Header';
import Footer from '../components/shared/Footer';

const NotFoundPage: React.FC = () => {
  return (
    <>
      <SEO
        title="الصفحة غير موجودة - 404"
        description="عذراً، الصفحة التي تبحث عنها غير موجودة. يمكنك العودة للصفحة الرئيسية."
        noindex={true}
      />
      <Header />
      <main className="min-h-screen flex items-center justify-center bg-gray-50 pt-24" dir="rtl">
        <div className="text-center px-6 max-w-lg">
          <div className="text-9xl font-bold text-[#2c3e50]/10 mb-8">404</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            الصفحة غير موجودة
          </h1>
          <p className="text-gray-600 mb-10 leading-relaxed">
            عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-3 bg-[#2c3e50] text-white px-8 py-4 rounded-full font-medium hover:bg-[#34495e] transition-colors duration-300"
          >
            <Home size={20} />
            العودة للرئيسية
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default NotFoundPage;
