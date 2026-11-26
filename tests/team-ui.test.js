import test from 'node:test';
import assert from 'node:assert/strict';
import {createElement as h} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {JSDOM} from 'jsdom';
import {compileUI} from './helpers/compile-ui.js';
import {person} from './helpers/database.js';
import {ageFromBirthDate} from '../shared/team-options.js';
const at=compileUI('tmp/forms-tests',['shared/team-options.js','shared/platform-roles.js','shared/volunteer-roles.js','src/components/Team/TeamComboField.tsx','src/components/Team/OrganizationalRoleOptions.tsx','src/components/Team/VolunteerRoleField.tsx','src/lib/team.ts','src/components/shared/PageIdentity.tsx','src/components/Team/TeamDialog.tsx','src/components/Team/PersonForm.tsx','src/components/Team/CreateAccountForm.tsx','src/components/Team/PersonAccess.tsx','src/components/Team/PersonDetails.tsx','src/components/Team/VolunteerCard.tsx','src/components/Team/EventForm.tsx','src/views/TeamVolunteers.tsx']);
const{default:PersonForm}=await at('src/components/Team/PersonForm.js');
const{default:EventForm}=await at('src/components/Team/EventForm.js');
const{default:VolunteerCard}=await at('src/components/Team/VolunteerCard.js');
const{default:PersonDetails}=await at('src/components/Team/PersonDetails.js');
const noop=()=>{};
test('volunteer modal has exactly five required fields and no login controls',()=>{
 const html=renderToStaticMarkup(h(PersonForm,{person:null,onSave:noop,onClose:noop}));const dom=new JSDOM(html),document=dom.window.document;
 assert.equal(document.querySelectorAll(':required').length,5);
 assert.equal(document.querySelector('input[name="roleTitle"]').required,true);
 for(const label of ['اسم المتطوع','الجامعة','الحالة الحالية','شاب أو بنت','تاريخ الميلاد','رقم الهاتف','الدور في صحوة'])assert.ok(html.includes(label),label);
 for(const excluded of ['البريد الإلكتروني','كلمة المرور','الصلاحيات','تاريخ الانضمام','المهارات','مجال التطوع','المسؤولية'])assert.ok(!html.includes(excluded),excluded);
 assert.equal(document.querySelector('input[type=date]').required,false);assert.equal(document.querySelector('input[type=tel]').required,false);
 assert.equal(document.querySelectorAll('input[role=combobox]').length,3);
 assert.equal(document.querySelector('datalist'),null);
 assert.ok([...document.querySelectorAll('select option')].some(option=>option.textContent==='السنة الخامسة فأعلى'));
 assert.ok([...document.querySelectorAll('select option')].some(option=>option.textContent==='متخرج'));
 const statusSelect=document.querySelector('select[name="status"]');
 assert.deepEqual([...statusSelect.querySelectorAll('option')].map(option=>option.textContent),['نشط','غير نشط']);
 dom.window.close();
});
test('event modal requires only its name and selects responsible people from volunteers',()=>{
 const volunteer={id:'00000000-0000-4000-8000-000000000001',fullName:'متطوع تجريبي',university:'استنيا',status:'نشط'};
 const html=renderToStaticMarkup(h(EventForm,{event:null,volunteers:[volunteer],scopes:[{university:null,sector:null,canPublish:true}],onSave:noop,onDelete:noop,onClose:noop})),dom=new JSDOM(html),document=dom.window.document;
 assert.equal(document.querySelectorAll('input,select,textarea').length,7);assert.equal(document.querySelector('input[type=checkbox]').checked,false,'events stay private by default');assert.equal(document.querySelectorAll(':required').length,1);assert.equal(document.querySelector('select').required,false);
 assert.ok(document.querySelector(`option[value="${volunteer.id}"]`));assert.equal(document.querySelector('input[type=date]').value,'');assert.equal(document.querySelector('input[type=number]').value,'');dom.window.close();
});
test('volunteer card shows calculated age, status and the full legacy assignment',()=>{
 const value=person(),html=renderToStaticMarkup(h(VolunteerCard,{person:value,onOpen:noop})),dom=new JSDOM(html);
 assert.equal(dom.window.document.querySelector('.team-age').textContent,`${ageFromBirthDate(value.birthDate).toLocaleString('ar-EG')} سنة`);assert.ok(html.includes('نشط'));assert.equal(dom.window.document.querySelector('.team-person-role').textContent,'عضو — إعلام');dom.window.close();
 const missing=renderToStaticMarkup(h(VolunteerCard,{person:person({birthDate:''}),onOpen:noop}));assert.ok(!missing.includes('team-age'));
});
test('add volunteer opens a modal and saves a basic record without account fields',async()=>{
 const dom=new JSDOM('<div id="root"></div>',{url:'https://sahwa.world/team/volunteers',pretendToBeVisual:true});
 const previous={window:globalThis.window,document:globalThis.document,fetch:globalThis.fetch,act:globalThis.IS_REACT_ACT_ENVIRONMENT};
 globalThis.window=dom.window;globalThis.document=dom.window.document;globalThis.IS_REACT_ACT_ENVIRONMENT=true;
 dom.window.HTMLDialogElement.prototype.showModal=function(){this.open=true;};dom.window.HTMLDialogElement.prototype.close=function(){this.open=false;};
 let posted;
 globalThis.fetch=async(path,options={})=>{assert.equal(path,'/api/team');if(options.method==='POST'){posted=JSON.parse(options.body).person;return Response.json({person:{...posted,id:'00000000-0000-4000-8000-000000000002',revision:1}});}return Response.json({volunteers:[]});};
 const React=await import('react'),{createRoot}=await import('react-dom/client'),{HelmetProvider}=await import('react-helmet-async');HelmetProvider.canUseDOM=false;
 const{default:Directory}=await at('src/views/TeamVolunteers.js'),root=createRoot(document.getElementById('root'));
 async function fill(prefix,value){const label=[...document.querySelectorAll('dialog label')].find(element=>element.textContent.startsWith(prefix));assert.ok(label,prefix);const input=label.htmlFor?document.getElementById(label.htmlFor):label.querySelector('input,select');const proto=input.tagName==='SELECT'?dom.window.HTMLSelectElement.prototype:dom.window.HTMLInputElement.prototype;await React.act(async()=>{Object.getOwnPropertyDescriptor(proto,'value').set.call(input,value);input.dispatchEvent(new dom.window.Event('input',{bubbles:true}));input.dispatchEvent(new dom.window.Event('change',{bubbles:true}));});}
 try{
  await React.act(async()=>root.render(h(HelmetProvider,null,h(Directory))));
  const button=[...document.querySelectorAll('button')].find(element=>element.textContent==='إضافة متطوع');assert.ok(button);await React.act(async()=>button.click());assert.ok(document.querySelector('dialog').open);
  await fill('اسم المتطوع','شخص تجريبي');await fill('الجامعة','استنيا');await fill('شاب أو بنت','شاب');await fill('الدور في صحوة','عضو صحوة');await fill('تاريخ الميلاد','2000-11-03');
  await React.act(async()=>document.querySelector('dialog form').dispatchEvent(new dom.window.Event('submit',{bubbles:true,cancelable:true})));
  assert.equal(posted.fullName,'شخص تجريبي');assert.equal(posted.university,'استنيا');assert.equal(posted.roleTitle,'عضو صحوة');for(const key of ['email','password','accessRole'])assert.ok(!(key in posted));
  assert.equal(document.querySelector('dialog'),null);assert.ok(document.querySelector('.team-person-card'));assert.ok(document.querySelector('.team-age'));
 }finally{await React.act(async()=>root.unmount());dom.window.close();globalThis.window=previous.window;globalThis.document=previous.document;globalThis.fetch=previous.fetch;globalThis.IS_REACT_ACT_ENVIRONMENT=previous.act;}
});

test('directory exposes gender and academic year filters',async()=>{
 const {default:Directory}=await at('src/views/TeamVolunteers.js');
 assert.equal(typeof Directory,'function');
 const source=await import('node:fs/promises').then(fs=>fs.readFile(new URL('../src/views/TeamVolunteers.tsx',import.meta.url),'utf8'));
 for(const label of ['<span>النوع</span>','<span>السنة الدراسية</span>','كل الجامعات','كل الحالات','كل السنوات'])assert.ok(source.includes(label),label);
});

test('volunteer details offer an explicit delete action with no immediate deletion',()=>{
 const value=person({fullName:'عاطف'});
 const html=renderToStaticMarkup(h(PersonDetails,{person:value,onEdit:noop,onDelete:noop,onClose:noop}));
 assert.ok(html.includes('أرشفة المتطوع'));
 assert.ok(!html.includes('نعم، أرشف المتطوع'));
});

test('the Sahwa combobox pickers browse, search, allow custom values and preserve old assignments', async () => {
 const dom = new JSDOM('<div id="root"></div>', { url: 'https://sahwa.world/team/volunteers', pretendToBeVisual: true });
 const previous = { window: globalThis.window, document: globalThis.document, act: globalThis.IS_REACT_ACT_ENVIRONMENT };
 globalThis.window = dom.window;
 globalThis.document = dom.window.document;
 globalThis.IS_REACT_ACT_ENVIRONMENT = true;
 dom.window.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
 dom.window.HTMLDialogElement.prototype.close = function () { this.open = false; };
 const React = await import('react'), { createRoot } = await import('react-dom/client');
 const root = createRoot(document.getElementById('root'));
 const saved = [];
 const record = person({ id: 'example', revision: 1 });
 const committees = [
   { ...record, team: 'لجنة القراءة', roleId: 'additional-committee-lead' },
   { ...record, university: 'جليشيم', team: 'لجنة المسرح', roleId: 'additional-committee-member' },
 ];
 function fieldByName(name) {
   const input = document.querySelector(`input[name="${name}"]`);
   assert.ok(input, name);
   return input;
 }
 function listboxFor(input) {
   return document.getElementById(input.getAttribute('aria-controls'));
 }
 async function mount(key, volunteer) {
   await React.act(async () => root.render(h(PersonForm, { key, person: volunteer, volunteers: committees, onClose: noop, onSave: async (input) => saved.push(input) })));
   return fieldByName('roleTitle');
 }
 async function type(input, text) {
   await React.act(async () => {
     Object.getOwnPropertyDescriptor(dom.window.HTMLInputElement.prototype, 'value').set.call(input, text);
     input.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
   });
 }
 async function key(input, name) {
   await React.act(async () => input.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true })));
 }
 async function submit() {
   await React.act(async () => document.querySelector('form').dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true })));
   return saved.at(-1);
 }
 try {
   let input = await mount('legacy', record);
   assert.equal(input.value, 'عضو — إعلام');
   let result = await submit();
   assert.equal(result.roleTitle, undefined);
   assert.equal(result.team, 'إعلام');
   assert.equal(result.responsibility, 'عضو');

   input = await mount('pickers', record);
   const universityInput = fieldByName('university');
   await React.act(async () => universityInput.focus());
   assert.deepEqual(
     [...listboxFor(universityInput).querySelectorAll('[role=option]')].map(option => option.textContent),
     ['استنيا', 'بيلجي', 'جليشيم'],
   );
   await type(universityInput, 'جامعة مرمرة');
   assert.equal(listboxFor(universityInput).querySelector('[role=option]').textContent, 'استخدام «جامعة مرمرة»');
   await React.act(async () => universityInput.blur());
   await type(universityInput, 'استنيا');

   const majorInput = fieldByName('major');
   await React.act(async () => majorInput.focus());
   await type(majorInput, 'Software');
   assert.deepEqual(
     [...listboxFor(majorInput).querySelectorAll('[role=option]')].map(option => option.textContent),
     ['هندسة البرمجيات', 'استخدام «Software»'],
   );
   await React.act(async () => listboxFor(majorInput).querySelector('[role=option]').click());
   assert.equal(majorInput.value, 'هندسة البرمجيات');

   await React.act(async () => input.focus());
   assert.equal(input.getAttribute('aria-expanded'), 'true');
   const roleList = listboxFor(input);
   const groupLabels = [...roleList.querySelectorAll('[role=group]')].map(group => group.getAttribute('aria-label'));
   assert.equal(groupLabels[0], 'العضوية العامة');
   assert.equal(groupLabels.at(-1), 'مجلس الإدارة المركزي');
   assert.equal(roleList.querySelector('[aria-label="مجلس الإدارة المركزي"]').querySelectorAll('[role=option]').length, 6);
   for (const removed of ['وحدة مقترحة', 'وحدة قيد التنظيم', 'قيد الاعتماد', 'عضو الإعلام الميداني', 'المشاركة والتكليف']) {
     assert.ok(!roleList.textContent.includes(removed), removed);
   }
   await type(input, 'عضوة لجنة اخرى');
   await key(input, 'ArrowDown');
   await key(input, 'Enter');
   assert.equal(input.value, 'عضو لجنة جامعية أخرى');
   assert.equal(input.getAttribute('aria-expanded'), 'false');
   const detail = fieldByName('roleDetail');
   assert.equal(detail.required, true);
   await React.act(async () => detail.focus());
   assert.deepEqual([...listboxFor(detail).querySelectorAll('[role=option]')].map(option => option.textContent), ['لجنة القراءة']);
   await React.act(async () => listboxFor(detail).querySelector('[role=option]').click());
   result = await submit();
   assert.equal(result.roleTitle, 'عضو لجنة جامعية أخرى');
   assert.equal(result.roleDetail, 'لجنة القراءة');
   assert.equal(result.major, 'هندسة البرمجيات');

   input = await mount('custom', { ...record, team: 'لجنة القراءة', responsibility: 'عضوة لجنة جامعية أخرى', roleId: 'additional-committee-women-member' });
   assert.equal(input.value, 'عضو لجنة جامعية أخرى');
   assert.equal(fieldByName('roleDetail').value, 'لجنة القراءة');
   await React.act(async () => input.focus());
   await type(input, 'منسقة حلقات القراءة');
   const option = listboxFor(input).querySelector('[role=option]');
   assert.equal(option.textContent, 'استخدام «منسقة حلقات القراءة»');
   await React.act(async () => option.click());
   assert.equal(document.querySelector('input[name="roleDetail"]'), null);
   result = await submit();
   assert.equal(result.roleTitle, 'منسقة حلقات القراءة');
   assert.equal(result.roleDetail, '');
 } finally {
   await React.act(async () => root.unmount());
   dom.window.close();
   globalThis.window = previous.window;
   globalThis.document = previous.document;
   globalThis.IS_REACT_ACT_ENVIRONMENT = previous.act;
 }
});

test('account creation uses email and password only, and volunteer details pin tabs without org-level or start-date clutter', async () => {
  const { default: CreateAccountForm } = await at('src/components/Team/CreateAccountForm.js');
  const { default: PersonAccess } = await at('src/components/Team/PersonAccess.js');
  const { default: OrganizationalRoleOptions } = await at('src/components/Team/OrganizationalRoleOptions.js');
  const { PLATFORM_ROLES } = await import('../shared/platform-roles.js');

  const createHtml = renderToStaticMarkup(h(CreateAccountForm, { volunteerId: 'v-1', fullName: 'آية', onCreated: noop }));
  const createDom = new JSDOM(createHtml);
  assert.ok(createDom.window.document.querySelector('input[name="email"][type="email"][required]'));
  assert.ok(createDom.window.document.querySelector('input[name="password"][type="password"]'));
  assert.ok(createDom.window.document.querySelector('button[type="button"][aria-pressed="false"]'));
  assert.equal(createDom.window.document.querySelector('input[name="username"]'), null);
  assert.ok(!createHtml.includes('اسم المستخدم'));
  createDom.window.close();

  const meta = {
    canAssign: true,
    canCreate: true,
    globalAdmin: false,
    assignableRoles: PLATFORM_ROLES.map((r) => ({ id: r.id, title: r.title, titleWomen: r.titleWomen || null, scope: r.scope, sector: r.sector, deferred: Boolean(r.deferred) })),
  };
  const volunteer = {
    ...person({ fullName: 'آية', gender: 'بنت' }),
    assignments: [],
    account: { status: 'none' },
    allowed: { edit: true, archive: true, assign: true, createAccount: true, resetAccount: true, suspendAccount: true, level: true },
  };
  const detailsHtml = renderToStaticMarkup(h(PersonDetails, { person: volunteer, meta, onChanged: noop, onEdit: noop, onDelete: noop, onClose: noop }));
  const detailsDom = new JSDOM(detailsHtml);
  assert.ok(detailsDom.window.document.querySelector('.team-dialog-header .dialog-tabs'), 'tabs live inside sticky dialog header');
  assert.ok(!detailsHtml.includes('المستوى التنظيمي'));
  assert.ok(detailsHtml.includes('ملف المتطوع') && detailsHtml.includes('إنشاء حساب'));
  detailsDom.window.close();

  const accessHtml = renderToStaticMarkup(h(PersonAccess, { person: volunteer, meta, onChanged: noop, mode: 'roles' }));
  assert.ok(!accessHtml.includes('المستوى التنظيمي'));
  assert.ok(!accessHtml.includes('بداية التكليف'));

  const optionsHtml = renderToStaticMarkup(h('select', null, h(OrganizationalRoleOptions, { roles: meta.assignableRoles, women: true })));
  const optionsDom = new JSDOM(optionsHtml);
  const labels = [...optionsDom.window.document.querySelectorAll('optgroup')].map((g) => g.getAttribute('label'));
  assert.deepEqual(labels, ['العام', 'فريق الجامعة', 'الفرق والوحدات المركزية', 'الإدارة المركزية']);
  for (const title of ['متطوعة عامة داخل الجامعة', 'متطوعة عامة مركزية', 'مسؤولة العلاقات الجامعية', 'عضوة العلاقات الجامعية'])
    assert.ok(optionsHtml.includes(title), title);
  optionsDom.window.close();
});

test('dialog backdrop fallback ignores clicks on overflowing child pickers and only closes on direct backdrop clicks', async () => {
  const dom = new JSDOM('<div id="root"></div>', { url: 'https://sahwa.world/team/volunteers', pretendToBeVisual: true });
  const previous = { window: globalThis.window, document: globalThis.document, act: globalThis.IS_REACT_ACT_ENVIRONMENT };
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  dom.window.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
  dom.window.HTMLDialogElement.prototype.close = function () { this.open = false; };
  const React = await import('react'), { createRoot } = await import('react-dom/client');
  const { default: TeamDialog } = await at('src/components/Team/TeamDialog.js');
  const root = createRoot(document.getElementById('root'));
  let closed = 0;
  try {
    await React.act(async () => root.render(
      h(TeamDialog, { title: 'اختبار', onClose: () => { closed += 1; } },
        h('select', null, h('option', { value: 'media-member' }, 'عضو الإعلام')),
      ),
    ));
    const dialog = document.querySelector('dialog');
    const option = document.querySelector('option');
    dialog.getBoundingClientRect = () => ({ left: 100, right: 500, top: 50, bottom: 300, width: 400, height: 250, x: 100, y: 50, toJSON() {} });
    const fire = (target, type, x, y) => {
      const ev = new dom.window.MouseEvent(type, { bubbles: true, clientX: x, clientY: y });
      target.dispatchEvent(ev);
    };
    // Clicking an <option> rendered below dialog.bottom must NOT close the dialog
    fire(option, 'pointerdown', 250, 420);
    fire(option, 'pointerup', 250, 420);
    assert.equal(closed, 0, 'overflowing select option click must not dismiss dialog');
    // Clicking directly on the backdrop outside the dialog box DOES close it
    fire(dialog, 'pointerdown', 20, 20);
    fire(dialog, 'pointerup', 20, 20);
    assert.equal(closed, 1, 'direct backdrop click closes dialog');
  } finally {
    await React.act(async () => root.unmount());
    dom.window.close();
    globalThis.window = previous.window;
    globalThis.document = previous.document;
    globalThis.IS_REACT_ACT_ENVIRONMENT = previous.act;
  }
});
