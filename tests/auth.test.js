import test from 'node:test';
import assert from 'node:assert/strict';
import {hashPassword,verifyPassword,verifyCredentials,accountVersion,sessionCookie,expiredCookie,readSessionToken,sameOrigin,requireUser,tokenHash} from '../server/auth.js';
const request=(url='https://sahwa.world/',headers={})=>new Request(url,{headers});
const hash=await hashPassword('fixture-password-only');
process.env.SAHWA_SESSION_SECRET='test-only-secret-at-least-32-characters';process.env.SAHWA_ACCOUNT_EMAIL='sahwa@example.invalid';process.env.SAHWA_PASSWORD_HASH=hash;
test('password hashing preserves the existing shared-account format',async()=>{
 assert.ok(await verifyPassword('fixture-password-only',hash));assert.equal(await verifyPassword('wrong',hash),false);assert.notEqual(hash,await hashPassword('fixture-password-only'));assert.ok(!hash.includes('fixture-password-only'));
});
test('only the configured shared email and password can sign in',async()=>{
 assert.ok(await verifyCredentials('SAHWA@example.invalid','fixture-password-only'));
 assert.equal(await verifyCredentials('volunteer@example.invalid','fixture-password-only'),false);assert.equal(await verifyCredentials('sahwa@example.invalid','wrong'),false);
 assert.notEqual(accountVersion({email:'sahwa@example.invalid',passwordHash:hash}),accountVersion({email:'sahwa@example.invalid',passwordHash:'changed'}));
});
test('production cookies retain host scope, HttpOnly, Secure and SameSite protections',()=>{
 const token='a'.repeat(43),req=request(),cookie=sessionCookie(token,3600,true,req);assert.match(cookie,/^__Host-sahwa_session=/);assert.match(cookie,/HttpOnly; Secure; SameSite=Lax; Max-Age=3600/);assert.ok(!cookie.includes('Domain='));assert.equal(readSessionToken(request(undefined,{cookie})),token);assert.match(expiredCookie(req),/Max-Age=0/);assert.ok(!sessionCookie(token,3600,false,req).includes('Max-Age'));
});
test('localhost development works and remote cookies remain secure',()=>{
 assert.match(sessionCookie('a'.repeat(43),1,true,request('http://localhost:3000/')),/^sahwa_session=/);assert.match(sessionCookie('a'.repeat(43),1,true,request('http://example.com/')),/Secure/);
});
test('only a valid shared session grants access; old account lookups do not grant access',async()=>{
 const token='a'.repeat(43),req=request(undefined,{cookie:`__Host-sahwa_session=${token}`});assert.notEqual(tokenHash(token),token);
 await assert.rejects(requireUser(request(),{}),error=>error.status===401);
 await assert.rejects(requireUser(req,{hasSharedSession:async()=>false,sessionUser:async()=>({accessRole:'admin'})}),error=>error.status===401);
 const user=await requireUser(req,{hasSharedSession:async()=>true},true);assert.equal(user.email,'sahwa@example.invalid');assert.equal(user.accessRole,'admin');
});
test('mutations require an exact matching origin',()=>{
 assert.ok(sameOrigin(request(undefined,{origin:'https://sahwa.world'})));assert.equal(sameOrigin(request()),false);assert.equal(sameOrigin(request(undefined,{origin:'https://attacker.invalid'})),false);
});
