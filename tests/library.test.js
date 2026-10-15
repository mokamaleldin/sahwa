import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const output = path.resolve('tmp/library-tests');
function compile(relative) {
  const target = path.join(output, relative.replace(/\.tsx?$/, '.js'));
  let code = ts.transpileModule(fs.readFileSync(relative, 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  code = code.replace(/(from\s+["'])(\.[^"']+)(["'])/g, '$1$2.js$3');
  fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, code);
  return pathToFileURL(target).href;
}
const helperUrl = compile('src/lib/libraryCatalogue.ts');
compile('src/components/Library/BookPreview.tsx');
const catalogueUrl = compile('src/components/Library/BookCatalogue.tsx');
const { readCatalogue, filterBooks, bookPage } = await import(helperUrl);
const fixtures = Array.from({ length: 25 }, (_, index) => ({
  id: `fixture-${index}`, title: index === 0 ? 'رِيَاضُ الصَّالِحِينَ' : `كتاب ${index}`,
  author: index === 0 ? 'الإمام النووي' : 'مؤلف تجريبي',
  category: index === 0 ? 'الحديث وعلومه' : 'التاريخ والسير', image: `/library/books/fixture-${index}.jpg`,
}));

test('published catalogue references existing artwork files', () => {
  const published = readCatalogue(JSON.parse(fs.readFileSync('public/library/books.json', 'utf8')));
  for (const book of published) assert.ok(fs.existsSync(path.resolve('public', book.image.slice(1))), book.image);
});

test('Arabic search finds title and author regardless of vowel marks, hamza, or kashida', () => {
  const books = readCatalogue(fixtures);
  assert.equal(filterBooks(books, 'رياض الصالحين', 'all')[0].id, 'fixture-0');
  assert.equal(filterBooks(books, 'امام النـووى', 'all')[0].id, 'fixture-0');
  assert.equal(filterBooks(books, 'رياض النووي', 'الحديث وعلومه').length, 1);
  assert.equal(filterBooks(books, 'رياض', 'التاريخ والسير').length, 0);
});
test('catalogue pagination returns 12/12/1 and clamps invalid or stale page numbers', () => {
  assert.equal(bookPage(fixtures, 1).books.length, 12);
  assert.equal(bookPage(fixtures, 2).books.length, 12);
  assert.equal(bookPage(fixtures, 3).books.length, 1);
  assert.equal(bookPage(fixtures, 100).page, 3);
  assert.equal(bookPage(fixtures, -1).page, 1);
  assert.equal(bookPage(fixtures, NaN).page, 1);
  assert.equal(bookPage([], 3).books.length, 0);
});
test('catalogue rejects duplicate IDs, missing search data, and non-library image paths', () => {
  assert.throws(() => readCatalogue({ books: [] }));
  assert.throws(() => readCatalogue([fixtures[0], fixtures[0]]));
  assert.throws(() => readCatalogue([{ ...fixtures[0], author: '' }]));
  for (const image of ['https://other.example/photo.jpg', '/library/books/../secrets.jpg', '/library/books/a.svg', '/library/books/a.jpg?x=1']) {
    assert.throws(() => readCatalogue([{ ...fixtures[0], image }]));
  }
});

test('image-only UI: search, categories, pagination, enlarged image, retry, and honest empty state', async () => {
  const { JSDOM } = require('jsdom');
  const dom = new JSDOM('<!doctype html><div id="root"></div>', { url: 'https://sahwa.world/library' });
  const previous = { window: globalThis.window, document: globalThis.document, fetch: globalThis.fetch };
  globalThis.window = dom.window; globalThis.document = dom.window.document;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  dom.window.HTMLElement.prototype.scrollIntoView = () => {};
  dom.window.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  dom.window.HTMLDialogElement.prototype.close = function () { this.open = false; };
  let data = fixtures, failed = false;
  globalThis.fetch = async (url, options) => {
    assert.equal(url, '/library/books.json'); assert.equal(options.cache, 'no-cache');
    if (failed) throw new Error('Network unavailable');
    return { ok: true, json: async () => data };
  };
  const React = require('react'), { createRoot } = require('react-dom/client'), { Simulate } = require('react-dom/test-utils');
  const { default: BookCatalogue } = await import(catalogueUrl);
  const container = document.getElementById('root'); let root;
  async function mount() { root = createRoot(container); await React.act(async () => root.render(React.createElement(BookCatalogue))); }
  async function click(element) { assert.ok(element); await React.act(async () => element.click()); }
  try {
    await mount();
    assert.equal(container.querySelectorAll('.library-book-card').length, 12);
    assert.equal(container.querySelector('.library-book-card').textContent.trim(), '', 'no duplicate title/author below artwork');
    const search = container.querySelector('input[type=search]');
    await React.act(async () => { search.value = 'رياض الصالحين'; Simulate.change(search); });
    assert.equal(container.querySelectorAll('.library-book-card').length, 1);
    await click(container.querySelector('.library-book-card'));
    const dialog = container.querySelector('dialog');
    assert.ok(dialog.open); assert.match(dialog.querySelector('img').alt, /النووي/);
    assert.equal(document.body.style.overflow, 'hidden');
    await click(dialog.querySelector('[aria-label="إغلاق صورة الكتاب"]'));
    assert.equal(container.querySelector('dialog'), null); assert.equal(document.body.style.overflow, '');
    await click(container.querySelector('[aria-label="مسح البحث"]'));
    await click(Array.from(container.querySelectorAll('[aria-pressed]')).find(button => button.textContent === 'الحديث وعلومه'));
    assert.equal(container.querySelectorAll('.library-book-card').length, 1);
    await click(Array.from(container.querySelectorAll('[aria-pressed]')).find(button => button.textContent === 'الجميع'));
    const next = container.querySelector('nav[aria-label="صفحات فهرس الكتب"]').lastElementChild;
    await click(next); await click(next);
    assert.equal(container.querySelectorAll('.library-book-card').length, 1);
    assert.match(container.querySelector('nav').textContent, /[3٣] من [3٣]/);
    assert.doesNotMatch(container.textContent, /مستعار|المتاح فقط|حجز/);
    await React.act(async () => root.unmount());
    data = []; await mount();
    assert.match(container.textContent, /صور الكتب تُضاف قريبًا/);
    assert.equal(container.querySelector('input[type=search]'), null);
    await React.act(async () => root.unmount());
    failed = true; await mount();
    assert.match(container.textContent, /تعذّر تحميل الفهرس/);
    failed = false; data = fixtures;
    await click(Array.from(container.querySelectorAll('button')).find(button => button.textContent.includes('إعادة المحاولة')));
    assert.equal(container.querySelectorAll('.library-book-card').length, 12);
  } finally {
    await React.act(async () => root?.unmount()); dom.window.close();
    Object.assign(globalThis, previous); delete globalThis.IS_REACT_ACT_ENVIRONMENT;
  }
});
