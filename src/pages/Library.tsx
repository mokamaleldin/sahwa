import { ArrowDown, ArrowUpRight, MapPin, Navigation } from 'lucide-react';
import SEO from '../components/SEO';
import PageHeading, { PageEmblem } from '../components/shared/PageIdentity';
import BookCatalogue from '../components/Library/BookCatalogue';
import { LIBRARY_LOCATION } from '../data/library';

export default function Library() {
  return (
    <>
      <SEO title="المكتبة | صحوة" description="تعرّف على مكتبة صحوة في إسطنبول، وتصفّح الفهرس المصوّر للكتب الموجودة ضمن مقتنياتها، واعرف عنوان المكتبة وطريقة الوصول إليها قبل زيارتك." canonicalUrl="https://sahwa.world/library" ogImage="https://sahwa.world/og-image.png" breadcrumbs={[{ name: 'الرئيسية', url: 'https://sahwa.world/' }, { name: 'المكتبة', url: 'https://sahwa.world/library' }]} />
      <main className="app-shell sahwa-page-surface pt-24 sm:pt-28 pb-8">
        <PageEmblem />
        <div className="page-container max-w-5xl">
          <PageHeading id="library-heading" title="المكتبة" description="اكتشف الكتب الموجودة في مكتبة صحوة وخطّط لزيارتك" />
          <section className="grid md:grid-cols-2 items-center gap-8 md:gap-14 pb-10 sm:pb-14 border-b border-brand-line" aria-label="عن مكتبة صحوة">
            <div>
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
    </>
  );
}
