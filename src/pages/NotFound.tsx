import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const NotFoundPage: React.FC = () => {
  return (
    <>
      <SEO
        title="الصفحة غير موجودة - 404"
        description="عذراً، الصفحة التي تبحث عنها غير موجودة. يمكنك العودة للصفحة الرئيسية."
        noindex={true}
      />
      <main className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
        <div className="text-center px-4">
          <h1 className="text-9xl font-bold text-[#7c393e]">404</h1>
          <h2 className="text-3xl font-semibold text-gray-800 mt-4 mb-2">
            الصفحة غير موجودة
          </h2>
          <p className="text-gray-600 mb-8">
            عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
          </p>
          <Link
            to="/"
            className="inline-block bg-[#7c393e] text-white px-8 py-4 rounded-full font-semibold hover:bg-[#5a2a2e] transition-colors duration-300"
          >
            العودة للصفحة الرئيسية
          </Link>
        </div>
      </main>
    </>
  );
};

export default NotFoundPage;
