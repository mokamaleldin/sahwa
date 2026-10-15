import { ArrowDown, ArrowUpRight, MapPin, Navigation } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '../components/shared/Header';
import Footer from '../components/shared/Footer';
import SEO from '../components/SEO';
import BookCatalogue from '../components/Library/BookCatalogue';
import { LIBRARY_LOCATION } from '../data/library';

export default function Library() {
  return (
    <>
      <SEO title="المكتبة | صحوة" description="تعرّف على مكتبة صحوة في إسطنبول، وتصفّح الفهرس المصوّر للكتب الموجودة ضمن مقتنياتها، واعرف عنوان المكتبة وطريقة الوصول إليها قبل زيارتك." canonicalUrl="https://sahwa.world/library" ogImage="https://sahwa.world/og-image.png" breadcrumbs={[{ name: 'الرئيسية', url: 'https://sahwa.world/' }, { name: 'المكتبة', url: 'https://sahwa.world/library' }]} />
      <Header />
      <main className="app-shell pt-28 sm:pt-32 pb-8">
        <div className="page-container max-w-5xl">
          <nav aria-label="مسار الصفحة" className="flex items-center gap-2 text-xs text-brand-muted mb-7"><Link to="/" className="hover:text-brand-primary">الرئيسية</Link><span aria-hidden="true">/</span><span aria-current="page">المكتبة</span></nav>
          <section className="grid md:grid-cols-2 items-center gap-8 md:gap-14 pb-10 sm:pb-14 border-b border-brand-line" aria-labelledby="library-heading">
            <div>
              <span className="section-divider !mb-5" />
              <h1 id="library-heading" className="font-heading text-4xl sm:text-5xl lg:text-6xl text-brand-primary mb-6">مكتبة صحوة</h1>
              <p className="text-brand-muted text-base sm:text-lg leading-loose mb-7 max-w-md">بين رفوف الكتب مساحة للقراءة والمعرفة. تعرّف على عناوين مكتبتنا، وتصفّح صور كتبها قبل زيارتك.</p>
              <div className="flex flex-wrap gap-3">
                <a href="#books" className="library-primary-button">تصفّح الكتب <ArrowDown size={18} /></a>
                <a href="#library-location" className="library-secondary-button"><MapPin size={18} /> موقع المكتبة</a>
              </div>
              <p className="flex items-center gap-2 text-brand-muted text-xs mt-6"><MapPin size={15} className="text-brand-gold" aria-hidden="true" /> إسطنبول · أيوب سلطان</p>
            </div>
            <figure className="mx-auto w-full max-w-xs sm:max-w-sm overflow-hidden rounded-2xl border border-brand-line shadow-sm"><img src="/library/library-launch.jpg" width="1063" height="1004" alt="إعلان انطلاق مكتبة صحوة مع صورة رفوف الكتب" className="w-full h-auto" decoding="async" /></figure>
          </section>
          <BookCatalogue />
          <section id="library-location" className="scroll-mt-28 border-t border-brand-line pt-10 sm:pt-14" aria-labelledby="library-location-heading">
            <div className="grid md:grid-cols-[.85fr_1.15fr] gap-7 md:gap-10 items-center">
              <div>
                <span className="section-divider !mb-4" />
                <h2 id="library-location-heading" className="font-heading text-3xl sm:text-4xl text-brand-primary mb-5">نلقاك في المكتبة</h2>
                <address className="not-italic text-sm text-brand-muted space-y-3 mb-6">
                  <p lang="tr" dir="ltr" className="text-right font-semibold text-base text-brand-dark">{LIBRARY_LOCATION.name}</p>
                  <p>{LIBRARY_LOCATION.description}</p>
                  <p lang="tr" dir="ltr" className="text-right">{LIBRARY_LOCATION.address}</p>
                </address>
                <a href={LIBRARY_LOCATION.directionsUrl} target="_blank" rel="noopener noreferrer" className="library-primary-button"><Navigation size={17} /> الاتجاهات على الخريطة <ArrowUpRight size={16} /></a>
              </div>
              <a href={LIBRARY_LOCATION.mapUrl} target="_blank" rel="noopener noreferrer" className="block rounded-2xl border border-brand-line overflow-hidden bg-brand-paper shadow-sm" aria-label="فتح موقع مكتبة صحوة على خرائط Google">
                <div className="library-location-map"><img src="/library/library-location.jpg" width="1216" height="788" alt="خريطة المسجد المقابل لجامعة بيلجي، حيث تقع مكتبة صحوة في الطابق العلوي" loading="lazy" decoding="async" /></div>
                <span className="flex items-center justify-between gap-3 p-4 text-sm text-brand-primary"><span className="flex items-center gap-2"><MapPin size={16} /> موقع المكتبة</span><span className="flex items-center gap-1 text-xs">فتح الخريطة <ArrowUpRight size={15} /></span></span>
              </a>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
