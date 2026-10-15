import type { LibraryBook } from '../data/library';

export const BOOKS_PER_PAGE = 12;

export function readCatalogue(value: unknown): LibraryBook[] {
  if (!Array.isArray(value)) throw new Error('Invalid book catalogue');
  const ids = new Set<string>();
  return value.map((entry: unknown) => {
    if (!entry || typeof entry !== 'object') throw new Error('Invalid book record');
    const record = entry as Record<string, unknown>;
    const fields = ['id', 'title', 'author', 'category', 'image'] as const;
    const book = {} as LibraryBook;
    for (const field of fields) {
      if (typeof record[field] !== 'string' || !record[field].trim()) throw new Error(`Missing book ${field}`);
      book[field] = record[field].trim();
    }
    if (ids.has(book.id)) throw new Error('Duplicate book ID');
    if (!/^\/library\/books\/[^?#]+\.(?:jpe?g|png|webp|avif)$/i.test(book.image) || /\.\.|\\|\/\//.test(book.image)) {
      throw new Error('Book images must be local library images');
    }
    ids.add(book.id);
    return book;
  });
}

export function normalizeBookSearch(value: string): string {
  return value.normalize('NFKD').replace(/\p{M}/gu, '').replace(/ـ/g, '')
    .replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي').toLocaleLowerCase('ar').replace(/\s+/g, ' ').trim();
}

export function filterBooks(books: readonly LibraryBook[], query: string, category: string): LibraryBook[] {
  const terms = normalizeBookSearch(query).split(' ').filter(Boolean);
  return books.filter(book => {
    if (category !== 'all' && book.category !== category) return false;
    const searchable = normalizeBookSearch(`${book.title} ${book.author}`);
    return terms.every(term => searchable.includes(term));
  });
}

export function bookPage(books: readonly LibraryBook[], requestedPage: number) {
  const pageCount = Math.max(1, Math.ceil(books.length / BOOKS_PER_PAGE));
  const page = Math.max(1, Math.min(pageCount, Number.isFinite(requestedPage) ? Math.floor(requestedPage) : 1));
  const start = (page - 1) * BOOKS_PER_PAGE;
  return { books: books.slice(start, start + BOOKS_PER_PAGE), page, pageCount, start };
}
