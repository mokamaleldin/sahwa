import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url), ts = require('typescript');
const output = path.resolve('tmp/navigation-tests');
function compile(relative) {
  const destination = path.join(output, relative.replace(/\.tsx?$/, '.js'));
  let code = ts.transpileModule(fs.readFileSync(relative, 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  code = code.replace(/import \{ Helmet \} from 'react-helmet-async';/g, "import helmetPackage from 'react-helmet-async'; const { Helmet } = helmetPackage;");
  code = code.replace(/(from\s+["'])(\.[^"']+)(["'])/g, (_, before, name, after) => `${before}${name.endsWith('.js') ? name : name + '.js'}${after}`);
  fs.mkdirSync(path.dirname(destination), { recursive: true }); fs.writeFileSync(destination, code);
  return pathToFileURL(destination).href;
}
for (const file of [
  'src/config/features.ts', 'src/lib/sessionClient.ts', 'src/auth/SessionContext.ts', 'src/auth/useSession.ts', 'src/auth/SessionProvider.tsx', 'src/auth/RequireSession.tsx',
  'src/components/shared/Header.tsx', 'src/components/shared/Footer.tsx', 'src/components/shared/PageIdentity.tsx', 'src/components/shared/SiteLayout.tsx',
  'src/components/Team/TeamNavigation.tsx', 'src/components/Team/TeamLayout.tsx', 'src/components/Studio/StudioWorkspace.tsx', 'src/data/teamFiles.ts', 'src/data/teamForms.ts',
  'src/pages/Team.tsx', 'src/pages/TeamFiles.tsx', 'src/pages/TeamForms.tsx', 'src/pages/Studio.tsx', 'src/pages/Login.tsx',
]) compile(file);
const moduleAt = relative => import(pathToFileURL(path.join(output, relative)).href);

test('navigation keeps one header, one session check and the same editor; expiration/login/logout stay in the router', async () => {
  const { JSDOM } = require('jsdom');
  const dom = new JSDOM('<!doctype html><div id="root"></div>', { url: 'https://sahwa.world', pretendToBeVisual: true });
  const previous = { window: globalThis.window, document: globalThis.document, requestAnimationFrame: globalThis.requestAnimationFrame, cancelAnimationFrame: globalThis.cancelAnimationFrame, act: globalThis.IS_REACT_ACT_ENVIRONMENT };
  globalThis.window = dom.window; globalThis.document = dom.window.document;
  globalThis.requestAnimationFrame = dom.window.requestAnimationFrame.bind(dom.window);
  globalThis.cancelAnimationFrame = dom.window.cancelAnimationFrame.bind(dom.window);
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const React = require('react'), { createRoot } = require('react-dom/client'), { Simulate } = require('react-dom/test-utils'), { HelmetProvider } = require('react-helmet-async');
  HelmetProvider.canUseDOM = false;
  const { createMemoryRouter, RouterProvider } = await import('react-router-dom');
  const [{ createSessionClient }, { default: SessionProvider }, { default: SiteLayout }, { default: TeamLayout }, { default: Team }, { default: Files }, { default: Forms }, { default: Studio }, { default: Login }] = await Promise.all([
    moduleAt('src/lib/sessionClient.js'), moduleAt('src/auth/SessionProvider.js'), moduleAt('src/components/shared/SiteLayout.js'), moduleAt('src/components/Team/TeamLayout.js'),
    moduleAt('src/pages/Team.js'), moduleAt('src/pages/TeamFiles.js'), moduleAt('src/pages/TeamForms.js'), moduleAt('src/pages/Studio.js'), moduleAt('src/pages/Login.js'),
  ]);
  let resolveFirst, checks = 0, failed = false, authenticated = true;
  const first = new Promise(resolve => { resolveFirst = resolve; });
  const client = createSessionClient(async (_, options) => {
    if (options.method === 'POST') { authenticated = true; return Response.json({ authenticated: true }); }
    if (options.method === 'DELETE') { authenticated = false; return Response.json({ authenticated: false }); }
    checks++;
    if (checks === 1) return first;
    return failed ? Response.json({ error: 'عطل مؤقت' }, { status: 503 }) : Response.json({ authenticated });
  });
  let resolveFiles;
  const LazyFiles = React.lazy(() => new Promise(resolve => { resolveFiles = resolve; }));
  const e = React.createElement;
  const router = createMemoryRouter([{ element: e(SiteLayout), children: [
    { path: '/', element: e('main', null, 'الرئيسية التجريبية') }, { path: '/universities', element: e('main', null, 'الجامعات التجريبية') }, { path: '/social', element: e('main', null, 'تابعنا التجريبية') },
    { path: '/login', element: e(Login) }, { path: '/studio', element: e(Studio) },
    { path: '/team', element: e(TeamLayout), children: [{ index: true, element: e(Team) }, { path: 'files', element: e(LazyFiles) }, { path: 'forms', element: e(Forms) }] },
  ] }], { initialEntries: ['/'] });
  const container = document.getElementById('root'), root = createRoot(container);
  const navigate = async path => React.act(async () => { await router.navigate(path); });
  const click = async element => { assert.ok(element); const event = new dom.window.MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }); await React.act(async () => element.dispatchEvent(event)); return event; };
  async function message(frame, values, origin = 'https://sahwa.world', source = frame.contentWindow) {
    await React.act(async () => dom.window.dispatchEvent(new dom.window.MessageEvent('message', { origin, source, data: values })));
  }
  try {
    await React.act(async () => root.render(e(React.StrictMode, null, e(HelmetProvider, null, e(SessionProvider, { client }, e(RouterProvider, { router }))))));
    assert.equal(checks, 1, 'StrictMode must not double the auth request');
    const header = container.querySelector('header');
    assert.equal(header.querySelector('a[href="/login"]'), null, 'do not advertise logged-out status before verification');
    await React.act(async () => { resolveFirst(Response.json({ authenticated: true })); await first; });
    assert.ok(header.querySelector('a[href="/team"]'));
    assert.equal(header.querySelector('a[href="/library"]'), null);
    await click(header.querySelector('a[href="/universities"]'));
    assert.equal(router.state.location.pathname, '/universities'); assert.equal(container.querySelector('header'), header);
    await navigate('/team');
    assert.equal(checks, 1); assert.equal(container.querySelector('header'), header);
    assert.equal(container.querySelector('a[href="/team/volunteers"]'), null);
    await navigate('/team/files');
    assert.equal(container.querySelector('header'), header, 'lazy route fallback must keep shared chrome');
    await React.act(async () => resolveFiles({ default: Files }));
    assert.equal(container.querySelectorAll('.team-portal-card').length, 4);
    const formsEvent = await click(container.querySelector('.team-navigation a[href="/team/forms"]'));
    assert.equal(formsEvent.defaultPrevented, true, 'forms use client navigation');
    assert.equal(router.state.location.pathname, '/team/forms');
    assert.equal(container.querySelectorAll('.team-portal-card').length, 2);
    assert.equal(container.querySelector('header'), header); assert.equal(checks, 1);
    const event = await click(container.querySelector('.team-navigation a[href="/studio"]'));
    assert.equal(event.defaultPrevented, true, 'Studio link uses client navigation');
    const frame = container.querySelector('iframe'); assert.ok(frame); assert.equal(checks, 1);
    assert.equal(container.querySelector('header'), header);
    assert.doesNotMatch(header.textContent, /تسجيل الخروج/);
    await React.act(async () => Simulate.load(frame));
    assert.match(container.querySelector('[role="alert"]').textContent, /تعذر فتح المحرر/);
    await message(frame, { type: 'sahwa:studio:size', height: 1500, modal: false }, 'https://untrusted.example');
    assert.equal(frame.style.height, '1200px');
    await message(frame, { type: 'sahwa:studio:size', height: 1500, modal: false });
    assert.equal(frame.style.height, '1500px');
    assert.equal(container.querySelector('[role="alert"]'), null);
    await message(frame, { type: 'sahwa:studio:size', height: 1700, modal: true });
    assert.ok(frame.classList.contains('studio-workspace-modal')); assert.equal(document.body.style.overflow, 'hidden');
    await message(frame, { type: 'sahwa:studio:size', height: 1500, modal: false });
    assert.equal(document.body.style.overflow, '');
    await click(header.querySelector('a[href="/social"]'));
    assert.equal(frame.closest('main').hidden, true); assert.equal(container.querySelector('iframe'), frame);
    await navigate('/studio'); assert.equal(container.querySelector('iframe'), frame); assert.equal(frame.closest('main').hidden, false);
    failed = true; await React.act(async () => client.refresh({ force: true }));
    assert.equal(container.querySelector('iframe'), frame); assert.ok(header.querySelector('a[href="/team"]'));
    failed = false; authenticated = false; await React.act(async () => client.refresh({ force: true }));
    assert.equal(router.state.location.pathname, '/login'); assert.equal(container.querySelector('iframe'), null);
    assert.equal(container.querySelector('header'), header);
    const password = container.querySelector('#login-password');
    await React.act(async () => { password.value = 'fixture-only'; Simulate.change(password); Simulate.submit(container.querySelector('form')); });
    assert.equal(router.state.location.pathname, '/studio'); assert.ok(container.querySelector('iframe'));
    assert.equal(container.querySelector('header'), header);
    const logout = Array.from(container.querySelectorAll('button')).find(button => button.textContent.trim() === 'تسجيل الخروج');
    await click(logout);
    assert.equal(router.state.location.pathname, '/login'); assert.equal(container.querySelector('iframe'), null); assert.ok(header.querySelector('a[href="/login"]'));
    await navigate('/studio'); assert.equal(router.state.location.pathname, '/login'); assert.equal(container.querySelector('iframe'), null);
    await navigate('/team/forms');
    assert.equal(router.state.location.pathname, '/login');
    assert.equal(new URLSearchParams(router.state.location.search).get('next'), '/team/forms');
    const formsPassword = container.querySelector('#login-password');
    await React.act(async () => { formsPassword.value = 'fixture-only'; Simulate.change(formsPassword); Simulate.submit(container.querySelector('form')); });
    assert.equal(router.state.location.pathname, '/team/forms', 'sign-in returns to the requested forms page');
    assert.equal(container.querySelectorAll('.team-portal-card').length, 2);
    assert.equal(container.querySelector('header'), header);
  } finally {
    await React.act(async () => root.unmount()); router.dispose(); dom.window.close();
    globalThis.window = previous.window; globalThis.document = previous.document; globalThis.requestAnimationFrame = previous.requestAnimationFrame; globalThis.cancelAnimationFrame = previous.cancelAnimationFrame; globalThis.IS_REACT_ACT_ENVIRONMENT = previous.act;
  }
});
