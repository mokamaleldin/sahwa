import test from 'node:test';
import assert from 'node:assert/strict';
import {createElement as h} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {JSDOM} from 'jsdom';
import {compileUI} from './helpers/compile-ui.js';
import {person} from './helpers/database.js';
import {ageFromBirthDate} from '../shared/team-options.js';
const at=compileUI('tmp/forms-tests',['shared/team-options.js','src/lib/team.ts','src/components/shared/PageIdentity.tsx','src/components/Team/TeamDialog.tsx','src/components/Team/PersonForm.tsx','src/components/Team/PersonDetails.tsx','src/components/Team/VolunteerCard.tsx','src/components/Team/EventForm.tsx','src/views/TeamVolunteers.tsx']);
const{default:PersonForm}=await at('src/components/Team/PersonForm.js');
const{default:EventForm}=await at('src/components/Team/EventForm.js');
const{default:VolunteerCard}=await at('src/components/Team/VolunteerCard.js');
const noop=()=>{};
test('volunteer modal has exactly four required fields and no login controls',()=>{
 const html=renderToStaticMarkup(h(PersonForm,{person:null,onSave:noop,onClose:noop}));const dom=new JSDOM(html),document=dom.window.document;
 assert.equal(document.querySelectorAll(':required').length,4);
 for(const label of ['اسم المتطوع','الجامعة','الحالة الحالية','شاب أو بنت','تاريخ الميلاد','رقم الهاتف','المسؤولية','مجال التطوع'])assert.ok(html.includes(label),label);
 for(const excluded of ['البريد الإلكتروني','كلمة المرور','الصلاحيات','تاريخ الانضمام','المهارات'])assert.ok(!html.includes(excluded),excluded);
 assert.equal(document.querySelector('input[type=date]').required,false);assert.equal(document.querySelector('input[type=tel]').required,false);
 assert.ok(![...document.querySelectorAll('select option')].some(option=>option.textContent==='مسؤول جامعة'));
 assert.ok([...document.querySelectorAll('select option')].some(option=>option.textContent==='السنة الخامسة فأعلى'));
 assert.ok([...document.querySelectorAll('select option')].some(option=>option.textContent==='متخرج'));
 assert.ok(document.querySelector('input[list="sahwa-majors"]'));
 assert.ok([...document.querySelectorAll('#sahwa-majors option')].some(option=>option.value==='هندسة البرمجيات'));
 assert.ok([...document.querySelectorAll('select option')].some(option=>option.textContent==='متوقف مؤقتًا'));dom.window.close();
});
test('event modal requires only its name and selects responsible people from volunteers',()=>{
 const volunteer={id:'00000000-0000-4000-8000-000000000001',fullName:'متطوع تجريبي',university:'استنيا',status:'نشط'};
 const html=renderToStaticMarkup(h(EventForm,{event:null,volunteers:[volunteer],onSave:noop,onDelete:noop,onClose:noop})),dom=new JSDOM(html),document=dom.window.document;
 assert.equal(document.querySelectorAll('input,select,textarea').length,5);assert.equal(document.querySelectorAll(':required').length,1);assert.equal(document.querySelector('select').required,false);
 assert.ok(document.querySelector(`option[value="${volunteer.id}"]`));assert.equal(document.querySelector('input[type=date]').value,'');assert.equal(document.querySelector('input[type=number]').value,'');dom.window.close();
});
test('volunteer card shows calculated age, current status and voluntary area',()=>{
 const value=person(),html=renderToStaticMarkup(h(VolunteerCard,{person:value,onOpen:noop})),dom=new JSDOM(html);
 assert.equal(dom.window.document.querySelector('.team-age').textContent,`${ageFromBirthDate(value.birthDate).toLocaleString('ar-EG')} سنة`);assert.ok(html.includes('نشط'));assert.ok(html.includes('إعلام'));dom.window.close();
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
 async function fill(prefix,value){const label=[...document.querySelectorAll('dialog label')].find(element=>element.textContent.startsWith(prefix));assert.ok(label,prefix);const input=label.querySelector('input,select');const proto=input.tagName==='SELECT'?dom.window.HTMLSelectElement.prototype:dom.window.HTMLInputElement.prototype;await React.act(async()=>{Object.getOwnPropertyDescriptor(proto,'value').set.call(input,value);input.dispatchEvent(new dom.window.Event('input',{bubbles:true}));input.dispatchEvent(new dom.window.Event('change',{bubbles:true}));});}
 try{
  await React.act(async()=>root.render(h(HelmetProvider,null,h(Directory))));
  const button=[...document.querySelectorAll('button')].find(element=>element.textContent==='إضافة متطوع');assert.ok(button);await React.act(async()=>button.click());assert.ok(document.querySelector('dialog').open);
  await fill('اسم المتطوع','شخص تجريبي');await fill('الجامعة','استنيا');await fill('شاب أو بنت','شاب');await fill('تاريخ الميلاد','2000-11-03');
  await React.act(async()=>document.querySelector('dialog form').dispatchEvent(new dom.window.Event('submit',{bubbles:true,cancelable:true})));
  assert.equal(posted.fullName,'شخص تجريبي');assert.equal(posted.university,'استنيا');for(const key of ['email','password','accessRole'])assert.ok(!(key in posted));
  assert.equal(document.querySelector('dialog'),null);assert.ok(document.querySelector('.team-person-card'));assert.ok(document.querySelector('.team-age'));
 }finally{await React.act(async()=>root.unmount());dom.window.close();globalThis.window=previous.window;globalThis.document=previous.document;globalThis.fetch=previous.fetch;globalThis.IS_REACT_ACT_ENVIRONMENT=previous.act;}
});
