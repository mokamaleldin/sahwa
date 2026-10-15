import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import { PERSON_STATUSES } from '../shared/team-options.js';

const require = createRequire(import.meta.url), ts = require('typescript');
const output = path.resolve('tmp/team-ui-tests');
function compile(relative) {
  const target = path.join(output, relative.replace(/\.tsx?$/, '.js'));
  let code = ts.transpileModule(fs.readFileSync(relative, 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  // Node ESM cannot infer this package's CJS named exports; Vite handles it in the app.
  code = code.replace(/import \{ Helmet \} from 'react-helmet-async';/g, "import helmetPackage from 'react-helmet-async'; const { Helmet } = helmetPackage;");
  code = code.replace(/(from\s+["'])(\.[^"']+)(["'])/g, (_, before, name, after) => `${before}${name.endsWith('.js') ? name : name + '.js'}${after}`);
  fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, code);
  return pathToFileURL(target).href;
}
fs.mkdirSync(path.join(output, 'shared'), { recursive: true });
fs.copyFileSync('shared/team-options.js', path.join(output, 'shared/team-options.js'));
for (const file of ['src/config/features.ts', 'src/lib/team.ts', 'src/data/teamFiles.ts', 'src/components/shared/PageIdentity.tsx', 'src/components/Team/TeamDialog.tsx', 'src/components/Team/PersonForm.tsx', 'src/components/Team/PersonDetails.tsx']) compile(file);
const directoryUrl = compile('src/pages/TeamVolunteers.tsx'), filesUrl = compile('src/pages/TeamFiles.tsx'), portalUrl = compile('src/pages/Team.tsx');

test('directory UI: Arabic search, combined filters, pages, full details, custom fields, CRUD, errors and storage setup', async () => {
  const { JSDOM } = require('jsdom');
  const dom = new JSDOM('<!doctype html><div id="root"></div>', { url: 'https://sahwa.world/team/volunteers' });
  const previous = { window: globalThis.window, document: globalThis.document, fetch: globalThis.fetch, actEnvironment: globalThis.IS_REACT_ACT_ENVIRONMENT };
  globalThis.window = dom.window; globalThis.document = dom.window.document; globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  dom.window.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  dom.window.HTMLDialogElement.prototype.close = function () { this.open = false; };
  let ready = true, failedRead = false, failedWrite = false;
  let people = Array.from({ length: 25 }, (_, index) => ({
    id: `00000000-0000-4000-8000-${String(index).padStart(12, '0')}`, revision: 1, photoId: null,
    fullName: index === 0 ? 'أَحْمَد عَلِي' : `شخص تجريبي ${index}`, gender: 'شاب', university: 'استنيا', major: 'تخصص تجريبي',
    studyYear: 'الثالثة', studyStatus: 'طالب', workArea: 'إعلام', workScope: 'عام / مركزي', role: 'عضو', joinedAt: '2026-10-15', phone: '+90 555 000 1234', skills: 'التصميم', status: PERSON_STATUSES[0], createdAt: '', updatedAt: '',
  }));
  globalThis.fetch = async (url, options = {}) => {
    assert.equal(url, '/api/team'); assert.equal(options.cache, 'no-store');
    const method = options.method || 'GET';
    if (method === 'GET') {
      if (failedRead) return Response.json({ error: 'تعذر الاتصال للاختبار.' }, { status: 503 });
      return Response.json({ volunteers: ready ? people : [], storageReady: ready });
    }
    if (failedWrite) return Response.json({ error: 'تم تعديل السجل من جهاز آخر.' }, { status: 409 });
    const input = JSON.parse(options.body);
    if (method === 'DELETE') { people = people.filter(person => person.id !== input.id); return Response.json({ person: null }); }
    const saved = { ...input.person, id: input.id || '00000000-0000-4000-8000-999999999999', revision: input.revision ? input.revision + 1 : 1, photoId: null, createdAt: '', updatedAt: '' };
    people = method === 'POST' ? [...people, saved] : people.map(person => person.id === input.id ? saved : person);
    return Response.json({ person: saved }, { status: method === 'POST' ? 201 : 200 });
  };
  const React = require('react'), { createRoot } = require('react-dom/client'), { Simulate } = require('react-dom/test-utils');
  const { HelmetProvider } = require('react-helmet-async');
  HelmetProvider.canUseDOM = false;
  const { default: Directory } = await import(directoryUrl);
  const container = document.getElementById('root'); let root;
  async function mount() { root = createRoot(container); await React.act(async () => root.render(React.createElement(HelmetProvider, null, React.createElement(Directory)))); }
  async function unmount() { await React.act(async () => root.unmount()); }
  async function click(element) { assert.ok(element, 'button exists'); await React.act(async () => element.click()); }
  async function change(element, value) { assert.ok(element, 'input exists'); await React.act(async () => { element.value = value; Simulate.change(element); }); }
  const button = (text, parent = container) => Array.from(parent.querySelectorAll('button')).find(element => element.textContent.trim() === text);
  const field = (label, parent = container) => Array.from(parent.querySelectorAll('label')).find(element => element.querySelector('span')?.textContent.trim().startsWith(label))?.querySelector('input,select,textarea');
  async function submit() { await React.act(async () => Simulate.submit(container.querySelector('dialog form'))); }
  try {
    await mount();
    assert.equal(container.querySelectorAll('.team-person-card').length, 12);
    assert.equal(container.querySelectorAll('.team-filter-grid select').length, 6);
    await change(container.querySelector('input[type=search]'), 'احمد علي');
    assert.equal(container.querySelectorAll('.team-person-card').length, 1);
    await change(field('شباب / بنات'), 'بنت');
    assert.equal(container.querySelectorAll('.team-person-card').length, 0);
    await click(button('مسح الفلاتر'));
    await click(button('التالي')); await click(button('التالي'));
    assert.equal(container.querySelectorAll('.team-person-card').length, 1);
    await click(container.querySelector('.team-person-card'));
    assert.ok(container.querySelector('dialog').open); assert.ok(container.querySelector('dialog a[href^="tel:"]'));
    await click(button('تعديل البيانات'));
    await change(field('الاسم الكامل', container.querySelector('dialog')), 'شخص معدل للاختبار');
    await change(field('الجامعة', container.querySelector('dialog')), '__other');
    await change(field('اسم الجامعة الأخرى'), 'جامعة مخصصة');
    await change(field('طالب / خريج', container.querySelector('dialog')), 'خريج');
    await change(field('حالة الشخص داخل صحوة', container.querySelector('dialog')), PERSON_STATUSES[2]);
    await change(field('الدور', container.querySelector('dialog')), '__other');
    await change(field('اسم الدور الجديد'), 'منسق خاص');
    failedWrite = true; await submit();
    assert.ok(container.querySelector('dialog')); assert.match(container.querySelector('dialog [role=alert]').textContent, /جهاز آخر/);
    assert.equal(field('الاسم الكامل', container.querySelector('dialog')).value, 'شخص معدل للاختبار');
    failedWrite = false; await submit();
    assert.equal(container.querySelector('dialog'), null); assert.equal(document.body.style.overflow, '');
    assert.ok(Array.from(field('الجامعة').options).some(option => option.value === 'جامعة مخصصة'));
    assert.ok(Array.from(field('الدور').options).some(option => option.value === 'منسق خاص'));
    await change(container.querySelector('input[type=search]'), 'شخص معدل');
    await click(container.querySelector('.team-person-card'));
    assert.match(container.querySelector('dialog').textContent, /خريج/); assert.match(container.querySelector('dialog').textContent, /غير متطوع حاليًا/);
    await click(button('حذف السجل')); await click(button('تأكيد حذف السجل'));
    assert.equal(people.length, 24); assert.equal(container.querySelector('dialog'), null);
    await click(button('إضافة شخص'));
    await change(field('الاسم الكامل', container.querySelector('dialog')), 'إضافة تجريبية');
    await change(field('النوع', container.querySelector('dialog')), 'بنت');
    await change(field('الجامعة', container.querySelector('dialog')), 'بيلجي');
    await submit();
    assert.equal(people.length, 25); assert.equal(container.querySelector('dialog'), null);
    assert.equal(people.at(-1).gender, 'بنت');
    await unmount(); ready = false; await mount();
    assert.ok(button('إضافة شخص').disabled); assert.match(container.textContent, /تفعيل الحفظ المشترك/);
    await unmount(); ready = true; failedRead = true; await mount();
    assert.ok(button('إضافة شخص').disabled); assert.match(container.textContent, /تعذر الاتصال للاختبار/);
    assert.doesNotMatch(container.textContent, /هنا يبدأ دليل/);
  } finally {
    await unmount(); globalThis.window = previous.window; globalThis.document = previous.document; globalThis.fetch = previous.fetch; globalThis.IS_REACT_ACT_ENVIRONMENT = previous.actEnvironment; dom.window.close();
  }
});

test('portal shows the enabled destinations and files open the supplied Drive folders directly', async () => {
  const React = require('react'), { renderToStaticMarkup } = require('react-dom/server'), { HelmetProvider } = require('react-helmet-async');
  const { StaticRouter } = await import('react-router-dom');
  HelmetProvider.canUseDOM = false;
  const { JSDOM } = require('jsdom');
  const { default: Portal } = await import(portalUrl), { default: Files } = await import(filesUrl);
  const render = Component => renderToStaticMarkup(React.createElement(HelmetProvider, null, React.createElement(StaticRouter, { location: '/team' }, React.createElement(Component))));
  const portal = new JSDOM(render(Portal));
  assert.deepEqual(Array.from(portal.window.document.querySelectorAll('.team-portal-card')).map(link => link.getAttribute('href')), ['/team/files', '/studio']);
  const files = new JSDOM(render(Files));
  const links = Array.from(files.window.document.querySelectorAll('.team-portal-card'));
  assert.deepEqual(links.map(link => new URL(link.href).pathname.split('/').at(-1)), ['185bYbrjTJZp_44ltvawuTh2aQtVNLx_E', '1J_qBqkNQz91a9GW_FMkfpChQwKzrGcBN', '1-FDPNZN0ztzNmsqYxzyBO6i7mLGNAYXt']);
  assert.ok(links.every(link => link.target === '_blank' && link.rel.includes('noopener')));
  assert.equal(files.window.document.querySelector('input[type=file]'), null);
  portal.window.close(); files.window.close();
});
