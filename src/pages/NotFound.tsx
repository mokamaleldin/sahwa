import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import SEO from '../components/SEO';
import PageHeading, { PageEmblem } from '../components/shared/PageIdentity';

const NotFoundPage: React.FC = () => {
  return (
    <>
      <SEO
        title="الصفحة غير موجودة - 404"
        description="عذراً، الصفحة التي تبحث عنها غير موجودة. يمكنك العودة للصفحة الرئيسية."
        noindex={true}
      />
      <main className="app-shell sahwa-page-surface pt-24 sm:pt-28 pb-12" dir="rtl">
        <PageEmblem />
        <div className="text-center page-container max-w-3xl">
          <PageHeading title="الصفحة غير موجودة" description="عذرًا، الصفحة التي تبحث عنها غير موجودة أو تم نقلها." />
          <div className="section-card p-7 sm:p-10">
            <div className="text-8xl sm:text-9xl font-bold text-[#752026]/10 mb-6" aria-hidden="true">404</div>
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
    </>
  );
};

export default NotFoundPage;
