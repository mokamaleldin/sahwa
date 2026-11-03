import {test,before,beforeEach,after} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {testDatabase,person,event} from './helpers/database.js';
import {hashPassword,createSession,tokenHash} from '../server/auth.js';
import {createAuthHandler} from '../server/auth-api.js';
import {createTeamHandler} from '../server/team-api.js';
import {createEventsHandler} from '../server/events-api.js';
let db,store,hash;
const password='fixture-password-only',email='sahwa@example.invalid';
before(async()=>{({db,store}=await testDatabase());hash=await hashPassword(password);process.env.SAHWA_SESSION_SECRET='test-only-secret-at-least-32-characters';});
beforeEach(async()=>{await db.exec('TRUNCATE sahwa_shared_sessions,sahwa_volunteers,sahwa_sessions,sahwa_login_limits,sahwa_events,sahwa_users CASCADE');process.env.SAHWA_ACCOUNT_EMAIL=email;process.env.SAHWA_PASSWORD_HASH=hash;});
after(async()=>db.close());
const req=(path,method='GET',input,cookie='',origin='https://sahwa.world')=>new Request(`https://sahwa.world/api/${path}`,{method,headers:{cookie,origin,'Content-Type':'application/json'},...(input===undefined?{}:{body:JSON.stringify(input)})});
const session=()=>createSession(true,req('auth'),store);
async function legacyUser(identifier='old-volunteer@example.invalid',role='volunteer'){
 const id=randomUUID();await db.query("INSERT INTO sahwa_users(id,full_name,email,password_hash,access_role,university) VALUES ($1,'عضو سابق',$2,$3,$4,'استنيا')",[id,identifier,hash,role]);return id;
}
test('a volunteer is an independent record, with no account creation or credentials',async()=>{
 const cookie=await session(),team=createTeamHandler(store);
 const response=await team(req('team','POST',{person:{fullName:'أحمد',university:'استنيا',status:'نشط',gender:'شاب',email:'ignored@example.invalid',password,accessRole:'admin'}},cookie));assert.equal(response.status,201);let saved=(await response.json()).person;
 for(const field of ['email','password','passwordHash','accessRole'])assert.ok(!(field in saved));assert.equal(saved.phone,'');assert.equal(saved.birthDate,'');
 assert.equal((await db.query('SELECT count(*)::int AS count FROM sahwa_users')).rows[0].count,0);
 const edited=await team(req('team','PUT',{id:saved.id,revision:saved.revision,person:person({fullName:'أحمد',phone:'+90 534 123 45 67'})},cookie));assert.equal(edited.status,200);saved=(await edited.json()).person;assert.equal(saved.birthDate,'2004-02-29');assert.equal(saved.phone,'+90 534 123 45 67');
 assert.equal((await team(req('team','PUT',{id:saved.id,revision:1,person:person()},cookie))).status,409);
 assert.equal((await(await createAuthHandler(store)(req('auth','GET',undefined,cookie))).json()).authenticated,true,'profile changes do not change shared login');
});
test('volunteers can be deleted with an authorized, revision-checked request',async()=>{
 const cookie=await session(),team=createTeamHandler(store),personRecord=await store.createVolunteer(person({fullName:'عاطف'}));
 const badVersion=await team(req('team','DELETE',{id:personRecord.id,revision:personRecord.revision+1},cookie));
 assert.equal(badVersion.status,409);
 const stillPresent=await store.listVolunteers();
 assert.equal(stillPresent.length,1);
 const removed=await team(req('team','DELETE',{id:personRecord.id,revision:personRecord.revision},cookie));
 assert.equal(removed.status,200);
 assert.equal((await removed.json()).deleted,true);
 assert.equal((await store.listVolunteers()).length,0);
 assert.equal((await team(req('team','DELETE',{id:personRecord.id,revision:personRecord.revision},cookie))).status,409);
 assert.equal((await team(req('team','DELETE',{id:randomUUID(),revision:1},cookie))).status,409);
 assert.equal((await team(req('team','DELETE',{id:'bad',revision:1},cookie))).status,400);
});
test('deleting a volunteer preserves associated event history',async()=>{
 const cookie=await session(),team=createTeamHandler(store);
 const volunteer=await store.createVolunteer(person());
 const savedEvent=await store.createEvent(event({responsibleId:volunteer.id,attendance:9}));
 const response=await team(req('team','DELETE',{id:volunteer.id,revision:volunteer.revision},cookie));
 assert.equal(response.status,200);
 const events=await store.listEvents();
 assert.equal(events.length,1);
 assert.equal(events[0].id,savedEvent.id);
 assert.equal(events[0].responsibleId,null);
 assert.equal(events[0].attendance,9);
});
test('a title-only event has nullable optional fields and can later link a volunteer',async()=>{
 const cookie=await session(),handler=createEventsHandler(store);
 let response=await handler(req('events','POST',{event:{title:'فعالية فقط'}},cookie));assert.equal(response.status,201);let saved=(await response.json()).event;assert.equal(saved.eventDate,'');assert.equal(saved.responsibleId,null);assert.equal(saved.responsible,'');assert.equal(saved.attendance,null);
 const volunteer=await store.createVolunteer(person());
 response=await handler(req('events','PUT',{id:saved.id,revision:saved.revision,event:event({responsibleId:volunteer.id,attendance:0})},cookie));assert.equal(response.status,200);saved=(await response.json()).event;assert.equal(saved.responsible,'أحمد محمد');assert.equal(saved.attendance,0);
 await store.updateVolunteer(volunteer.id,volunteer.revision,person({fullName:'أحمد بعد التعديل'}));
 const listed=await(await handler(req('events','GET',undefined,cookie))).json();assert.equal(listed.events[0].responsible,'أحمد بعد التعديل');assert.equal(listed.volunteers[0].id,volunteer.id);assert.ok(!('phone' in listed.volunteers[0]));
 assert.equal((await handler(req('events','PUT',{id:saved.id,revision:1,event:event()},cookie))).status,409);
 assert.equal((await handler(req('events','DELETE',{id:saved.id,revision:saved.revision},cookie))).status,200);
});
test('event responsibilities reject missing volunteer IDs and ignore supplied free-text names',async()=>{
 const cookie=await session(),handler=createEventsHandler(store);
 assert.equal((await handler(req('events','POST',{event:event({responsibleId:randomUUID()})},cookie))).status,400);
 const response=await handler(req('events','POST',{event:{title:'اختبار',responsible:'اسم خارج المتطوعين'}},cookie));assert.equal(response.status,201);assert.equal((await response.json()).event.responsible,'');
});
test('only shared Sahwa credentials log in; former volunteer and administrator accounts are disabled',async()=>{
 await legacyUser();await legacyUser('old-admin@example.invalid','admin');const auth=createAuthHandler(store);
 for(const identifier of ['old-volunteer@example.invalid','old-admin@example.invalid'])assert.equal((await auth(req('auth','POST',{email:identifier,password}))).status,401);
 const response=await auth(req('auth','POST',{email,password}));assert.equal(response.status,200);const data=await response.json();assert.equal(data.user.email,email);assert.equal(data.user.accessRole,'admin');assert.equal(data.user.id,'sahwa');
 assert.equal((await db.query('SELECT count(*)::int AS count FROM sahwa_users')).rows[0].count,2,'sign-in never provisions accounts');
});
test('old individual sessions cannot read or change protected records after removal of account access',async()=>{
 const userId=await legacyUser(),token='a'.repeat(43),cookie=`__Host-sahwa_session=${token}`;
 await db.query('INSERT INTO sahwa_sessions(token_hash,user_id,expires_at) VALUES ($1,$2,$3)',[tokenHash(token),userId,new Date(Date.now()+3600000)]);
 for(const [handler,path] of [[createTeamHandler(store),'team'],[createEventsHandler(store),'events']])for(const method of ['GET','POST','PUT','DELETE'])assert.equal((await handler(req(path,method,method==='GET'?undefined:{person:person(),event:event()},cookie))).status,401);
 assert.equal((await(await createAuthHandler(store)(req('auth','GET',undefined,cookie))).json()).authenticated,false);
});
test('shared session logout, expiration and credential changes revoke access',async()=>{
 const auth=createAuthHandler(store),cookie=await session();assert.equal((await(await auth(req('auth','GET',undefined,cookie))).json()).authenticated,true);
 assert.equal((await auth(req('auth','DELETE',undefined,cookie))).status,200);assert.equal((await(await auth(req('auth','GET',undefined,cookie))).json()).authenticated,false);
 const another=await session();process.env.SAHWA_PASSWORD_HASH=await hashPassword('changed-fixture-password');assert.equal((await(await auth(req('auth','GET',undefined,another))).json()).authenticated,false);
 process.env.SAHWA_PASSWORD_HASH=hash;const expired=await session();await db.exec("UPDATE sahwa_shared_sessions SET expires_at=now()-interval '1 second'");assert.equal((await(await auth(req('auth','GET',undefined,expired))).json()).authenticated,false);
});
test('anonymous requests and cross-origin writes do not read or change volunteer data',async()=>{
 const cookie=await session(),team=createTeamHandler(store);
 assert.equal((await team(req('team'))).status,401);assert.equal((await team(req('team','POST',{person:person()},cookie,'https://attacker.invalid'))).status,403);assert.equal((await store.listVolunteers()).length,0);
});
test('login limits remain shared and persist across requests',async()=>{
 const auth=createAuthHandler(store);for(let i=0;i<10;i++)assert.equal((await auth(req('auth','POST',{email,password:'wrong'}))).status,401);
 const blocked=await auth(req('auth','POST',{email,password:'wrong'}));assert.equal(blocked.status,429);assert.equal(blocked.headers.get('retry-after'),'900');
});
test('SQL-looking volunteer names remain data and no password is assigned',async()=>{
 const label="'; DROP TABLE sahwa_volunteers; --",handler=createTeamHandler(store),cookie=await session();const response=await handler(req('team','POST',{person:person({fullName:label})},cookie));assert.equal(response.status,201);assert.equal((await response.json()).person.fullName,label);assert.equal((await store.listVolunteers()).length,1);
});
test('legacy volunteer data migrates independently while the shared account is excluded',async()=>{
 const sharedId=randomUUID(),volunteerId=randomUUID();const legacy=await testDatabase({sharedEmail:email,legacySetup:async database=>{
  await database.query("INSERT INTO sahwa_users(id,full_name,email,password_hash,university,gender) VALUES ($1,'مسؤول صحوة',$2,$3,'عام / مركزي','')",[sharedId,email,hash]);
  await database.query("INSERT INTO sahwa_users(id,full_name,email,password_hash,university,gender,birth_date) VALUES ($1,'متطوعة سابقة','legacy@example.invalid',$2,'بيلجي','طالبة','2003-05-10')",[volunteerId,hash]);
 }});
 try{const records=await legacy.store.listVolunteers();assert.equal(records.length,1);assert.equal(records[0].id,volunteerId);assert.equal(records[0].gender,'بنت');assert.equal(records[0].birthDate,'2003-05-10');assert.ok(!('email' in records[0]));assert.equal((await legacy.db.query('SELECT count(*)::int AS count FROM sahwa_users')).rows[0].count,2,'legacy records are preserved');}finally{await legacy.db.close();}
});
