import test from 'node:test';
import assert from 'node:assert/strict';
import {hashPassword,verifyPassword,sessionCookie,expiredCookie,readSessionToken,sameOrigin,tokenHash} from '../server/auth.js';
import {requireActor} from '../server/platform/session.js';
const request=(url='https://sahwa.world/',headers={})=>new Request(url,{headers});
const hash=await hashPassword('fixture-password-only');
process.env.SAHWA_SESSION_SECRET='test-only-secret-at-least-32-characters';
test('password hashing keeps the scrypt format and never stores the password',async()=>{
 assert.ok(await verifyPassword('fixture-password-only',hash));assert.equal(await verifyPassword('wrong',hash),false);assert.notEqual(hash,await hashPassword('fixture-password-only'));assert.ok(!hash.includes('fixture-password-only'));
});
test('production cookies retain host scope, HttpOnly, Secure and SameSite protections',()=>{
 const token='a'.repeat(43),req=request(),cookie=sessionCookie(token,3600,true,req);assert.match(cookie,/^__Host-sahwa_session=/);assert.match(cookie,/HttpOnly; Secure; SameSite=Lax; Max-Age=3600/);assert.ok(!cookie.includes('Domain='));assert.equal(readSessionToken(request(undefined,{cookie})),token);assert.match(expiredCookie(req),/Max-Age=0/);assert.ok(!sessionCookie(token,3600,false,req).includes('Max-Age'));
});
test('localhost development works and remote cookies remain secure',()=>{
 assert.match(sessionCookie('a'.repeat(43),1,true,request('http://localhost:3000/')),/^sahwa_session=/);assert.match(sessionCookie('a'.repeat(43),1,true,request('http://example.com/')),/Secure/);
});
test('only a valid account session grants access',async()=>{
 const token='a'.repeat(43),req=request(undefined,{cookie:`__Host-sahwa_session=${token}`});assert.notEqual(tokenHash(token),token);
 await assert.rejects(requireActor(request(),{platformStore:{}}),error=>error.status===401);
 await assert.rejects(requireActor(req,{platformStore:{sessionAccount:async()=>undefined}}),error=>error.status===401);
 await assert.rejects(requireActor(req,{platformStore:{sessionAccount:async()=>({accountStatus:'suspended',isOwner:true})}}),error=>error.status===401);
 const owner=await requireActor(req,{platformStore:{sessionAccount:async()=>({accountId:'x',accountStatus:'active',isOwner:true,email:'o@x.y',username:'o'})}});assert.equal(owner.kind,'owner');
});
test('mutations require an exact matching origin',()=>{
 assert.ok(sameOrigin(request(undefined,{origin:'https://sahwa.world'})));assert.equal(sameOrigin(request()),false);assert.equal(sameOrigin(request(undefined,{origin:'https://attacker.invalid'})),false);
});
