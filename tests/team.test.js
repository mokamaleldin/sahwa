import test from 'node:test';
import assert from 'node:assert/strict';
import {validatePerson} from '../server/team-data.js';
import {filterVolunteers,ageFromBirthDate,todayInIstanbul,normalizeMajor,PERSON_STATUSES,RESPONSIBILITIES,STUDY_YEARS} from '../shared/team-options.js';
import {person} from './helpers/database.js';
test('volunteers need only name, university, current status and gender',()=>{
 const value=validatePerson({fullName:'أحمد',university:'استنيا',status:'نشط',gender:'شاب'});
 for(const field of ['birthDate','phone','responsibility','team','major','studyYear'])assert.equal(value[field],'');
 for(const field of ['fullName','university','status','gender'])assert.throws(()=>validatePerson({...value,[field]:''}));
});
test('volunteer input never creates or changes login credentials',()=>{
 const value=validatePerson({...person(),email:'ignored@example.invalid',password:'ignored-secret',accessRole:'admin'});
 for(const field of ['email','password','accessRole','skills','joinedAt'])assert.ok(!(field in value));
});
test('optional phone is validated and Arabic digits are supported',()=>{
 assert.equal(validatePerson(person({phone:'٠٥٣٤١٢٣٤٥٦٧'})).phone,'05341234567');
 assert.equal(validatePerson(person({phone:'+90 534 123 45 67'})).phone,'+90 534 123 45 67');
 for(const phone of ['abc','123','1'.repeat(17)])assert.throws(()=>validatePerson(person({phone})),/هاتف/);
});
test('invalid dates, gender and status are rejected while optional fields remain optional',()=>{
 for(const input of [person({birthDate:'2003-02-29'}),person({birthDate:'2099-01-01'}),person({gender:'other'}),person({status:'other'})])assert.throws(()=>validatePerson(input));
 assert.equal(validatePerson(person({gender:'بنت',status:'خريج',birthDate:''})).birthDate,'');
});
test('age changes on the birthday and unknown or invalid dates have no age',()=>{
 assert.equal(ageFromBirthDate('2004-11-03','2026-11-02'),21);assert.equal(ageFromBirthDate('2004-11-03','2026-11-03'),22);assert.equal(ageFromBirthDate('2004-11-03','2026-11-04'),22);
 assert.equal(ageFromBirthDate('2004-02-29','2025-02-28'),20);assert.equal(ageFromBirthDate('2004-02-29','2025-03-01'),21);
 for(const value of ['',null,'2003-02-29','2099-01-01'])assert.equal(ageFromBirthDate(value,'2026-11-03'),null);
 assert.equal(todayInIstanbul(new Date('2026-11-02T22:30:00Z')),'2026-11-03');
});
test('Arabic directory search combines with university and current-status filters',()=>{
 const people=[person({fullName:'أَحْمَد'}),person({fullName:'فاطمة',university:'بيلجي',status:'خريج'})];
 assert.equal(filterVolunteers(people,{query:'احمد',university:'استنيا',status:'نشط'}).length,1);
 assert.equal(filterVolunteers(people,{query:'فاطمه',university:'',status:'خريج'}).length,1);
 assert.equal(filterVolunteers(people,{query:'',university:'بيلجي',status:'نشط'}).length,0);
});

test('three operational statuses and three responsibilities, separate from academic graduation',()=>{
 assert.deepEqual(PERSON_STATUSES,['نشط','متوقف مؤقتًا','غير نشط']);
 assert.deepEqual(RESPONSIBILITIES,['عضو','نائب مسؤول','مسؤول']);
 assert.ok(STUDY_YEARS.includes('متخرج'));
 assert.equal(validatePerson(person({status:'غير نشط',studyYear:'متخرج'})).status,'غير نشط');
});
test('known English, Turkish and Arabic aliases are normalized without rejecting new majors',()=>{
 for(const [value,expected] of [
  ['Software engineer','هندسة البرمجيات'],
  ['Yazılım mühendisliği','هندسة البرمجيات'],
  ['هندسة برمجه','هندسة البرمجيات'],
  ['Physiotherapy','العلاج الطبيعي وإعادة التأهيل'],
  ['Psikoloji','علم النفس'],
  ['Business administration','إدارة الأعمال'],
 ]) {
  assert.equal(normalizeMajor(value),expected);
  assert.equal(validatePerson(person({major:value})).major,expected);
 }
 assert.equal(validatePerson(person({major:'هندسة الطاقة النووية'})).major,'هندسة الطاقة النووية');
});

test('volunteer filters combine university, status, gender and academic year',()=>{
 const people=[
  person({fullName:'أحمد',university:'استنيا',gender:'شاب',status:'نشط',studyYear:'السنة الثانية'}),
  person({fullName:'فاطمة',university:'استنيا',gender:'بنت',status:'نشط',studyYear:'متخرج'}),
  person({fullName:'علي',university:'بيلجي',gender:'شاب',status:'غير نشط',studyYear:'متخرج'}),
 ];
 assert.deepEqual(filterVolunteers(people,{query:'',university:'استنيا',status:'نشط',gender:'بنت',studyYear:'متخرج'}).map(p=>p.fullName),['فاطمة']);
 assert.equal(filterVolunteers(people,{query:'',university:'بيلجي',status:'',gender:'',studyYear:'السنة الثانية'}).length,0);
 assert.equal(filterVolunteers(people,{query:'',university:'',status:'غير نشط',gender:'شاب',studyYear:''}).length,1);
});
