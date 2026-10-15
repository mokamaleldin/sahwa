import { useEffect, useMemo, useState } from 'react';
import { BookOpen, Search, X, ArrowUpRight, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import type { LibraryBook } from '../../data/library';
import { bookPage, filterBooks, readCatalogue } from '../../lib/libraryCatalogue';
import BookPreview from './BookPreview';

export default function BookCatalogue() {
  const [books, setBooks] = useState<LibraryBook[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setStatus('loading');
    fetch('/library/books.json', { signal: controller.signal, cache: 'no-cache' })
      .then(response => { if (!response.ok) throw new Error('Catalogue unavailable'); return response.json(); })
      .then(value => {
        if (controller.signal.aborted) return;
        setBooks(readCatalogue(value)); setStatus('ready');
      })
      .catch(() => { if (!controller.signal.aborted) setStatus('error'); });
    return () => controller.abort();
  }, [attempt]);

  const categories = useMemo(() => Array.from(new Set(books.map(book => book.category))).sort((a, b) => a.localeCompare(b, 'ar')), [books]);
  const filtered = useMemo(() => filterBooks(books, query, category), [books, query, category]);
  const current = bookPage(filtered, page);
  const selectedIndex = filtered.findIndex(book => book.id === selectedId);
  const selected = filtered[selectedIndex];
  const hasBooks = status === 'ready' && books.length > 0;
  const clearFilters = () => { setQuery(''); setCategory('all'); setPage(1); };
  function changePage(next: number) {
    setPage(next);
    document.getElementById('library-catalogue-heading')?.focus({ preventScroll: true });
    document.getElementById('books')?.scrollIntoView({ block: 'start', behavior: 'auto' });
  }

  return (
    <section id="books" className="scroll-mt-28 py-10 sm:py-14" aria-labelledby="library-catalogue-heading">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-7">
        <div>
          <span className="section-divider !mb-4" />
          <h2 id="library-catalogue-heading" tabIndex={-1} className="font-heading text-3xl sm:text-4xl text-brand-primary mb-3">كتب المكتبة</h2>
          <p className="text-sm sm:text-base text-brand-muted">تصفّح صور الكتب الموجودة ضمن مقتنيات مكتبة صحوة.</p>
        </div>
        {hasBooks ? <span className="text-sm text-brand-muted" role="status" aria-live="polite">{filtered.length.toLocaleString('ar')} نتيجة</span> : null}
      </div>

      {hasBooks ? (
        <div className="mb-7 space-y-5">
          <label htmlFor="library-search" className="relative block">
            <span className="sr-only">البحث باسم الكتاب أو المؤلف</span>
            <Search size={21} className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" aria-hidden="true" />
            <input id="library-search" type="search" value={query} onChange={event => { setQuery(event.target.value); setPage(1); }} placeholder="ابحث باسم الكتاب أو المؤلف…" className="library-search" autoComplete="off" />
            {query ? <button type="button" onClick={() => { setQuery(''); setPage(1); }} aria-label="مسح البحث" className="tap-target absolute left-1 top-1/2 -translate-y-1/2 flex items-center justify-center text-brand-muted"><X size={18} /></button> : null}
          </label>
          <div className="flex flex-wrap gap-2" role="group" aria-label="تصنيفات الكتب">
            {['all', ...categories].map(item => (
              <button key={item} type="button" onClick={() => { setCategory(item); setPage(1); }} aria-pressed={category === item} className={`tap-target rounded-full px-4 py-2 text-sm border transition-colors ${category === item ? 'bg-brand-primary border-brand-primary text-brand-paper' : 'bg-brand-paper border-brand-line text-brand-dark hover:border-brand-primary/40'}`}>{item === 'all' ? 'الجميع' : item}</button>
            ))}
          </div>
        </div>
      ) : null}

      {status === 'loading' ? <div className="library-catalogue-message" role="status"><BookOpen className="mx-auto mb-4 text-brand-gold" size={32} /><p>جارٍ تحميل فهرس الكتب…</p></div> : null}
      {status === 'error' ? <div className="library-catalogue-message" role="status"><p className="mb-5">تعذّر تحميل الفهرس. جرّب مرة أخرى.</p><button type="button" onClick={() => setAttempt(value => value + 1)} className="library-secondary-button"><RefreshCw size={17} /> إعادة المحاولة</button></div> : null}
      {status === 'ready' && books.length === 0 ? (
        <div className="library-catalogue-message">
          <BookOpen size={38} className="mx-auto mb-5 text-brand-gold" aria-hidden="true" />
          <h3 className="text-xl font-semibold text-brand-primary mb-3">صور الكتب تُضاف قريبًا</h3>
          <p className="text-sm text-brand-muted max-w-md mx-auto mb-6">نعمل على تجهيز الفهرس المصوّر لمقتنيات المكتبة. يمكنك الآن معرفة مكانها والتخطيط لزيارتك.</p>
          <a href="#library-location" className="library-secondary-button">موقع المكتبة <ArrowUpRight size={18} /></a>
        </div>
      ) : null}
      {hasBooks && filtered.length === 0 ? <div className="library-catalogue-message" role="status"><Search size={32} className="mx-auto mb-5 text-brand-gold" /><h3 className="text-lg font-semibold mb-2">لا توجد نتائج مطابقة</h3><p className="text-sm text-brand-muted mb-5">جرّب اسمًا آخر أو غيّر التصنيف.</p><button type="button" onClick={clearFilters} className="library-secondary-button">عرض جميع الكتب</button></div> : null}

      {hasBooks && filtered.length > 0 ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6" aria-label="صور كتب المكتبة">
            {current.books.map(book => (
              <button key={book.id} type="button" onClick={() => setSelectedId(book.id)} className="library-book-card group" aria-label={`تكبير صورة ${book.title} — ${book.author}`}>
                <img src={book.image} alt={`${book.title} — ${book.author}`} loading="lazy" decoding="async" className="w-full h-full object-contain" />
                <span className="absolute bottom-3 left-3 flex items-center justify-center w-9 h-9 bg-brand-paper/95 text-brand-primary rounded-full opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity" aria-hidden="true"><Search size={17} /></span>
              </button>
            ))}
          </div>
          {current.pageCount > 1 ? (
            <nav aria-label="صفحات فهرس الكتب" className="flex items-center justify-between gap-3 mt-8 text-sm text-brand-muted">
              <button type="button" disabled={current.page === 1} onClick={() => changePage(current.page - 1)} className="library-page-button"><ChevronRight size={18} /> السابق</button>
              <span>صفحة {current.page.toLocaleString('ar')} من {current.pageCount.toLocaleString('ar')}</span>
              <button type="button" disabled={current.page === current.pageCount} onClick={() => changePage(current.page + 1)} className="library-page-button">التالي <ChevronLeft size={18} /></button>
            </nav>
          ) : null}
        </>
      ) : null}

      {selected ? <BookPreview book={selected} onClose={() => setSelectedId(null)} onPrevious={selectedIndex > 0 ? () => setSelectedId(filtered[selectedIndex - 1].id) : undefined} onNext={selectedIndex + 1 < filtered.length ? () => setSelectedId(filtered[selectedIndex + 1].id) : undefined} /> : null}
    </section>
  );
}
