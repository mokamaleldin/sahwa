import test from 'node:test';
import assert from 'node:assert/strict';
import {validateEvent} from '../server/team-data.js';
import {event} from './helpers/database.js';
test('an event can be saved with its name only',()=>{
 const parsed=validateEvent({title:'فعالية جديدة'});assert.equal(parsed.eventDate,'');assert.equal(parsed.responsibleId,null);assert.equal(parsed.attendance,null);assert.equal(parsed.notes,'');
 assert.throws(()=>validateEvent({title:'  '}));
});
test('optional attendance is distinct from zero attendance',()=>{
 for(const attendance of [null,undefined,''])assert.equal(validateEvent(event({attendance})).attendance,null);
 assert.equal(validateEvent(event({attendance:0})).attendance,0);
 for(const attendance of [-1,0.5,'12',Infinity,1000001])assert.throws(()=>validateEvent(event({attendance})));
});
test('responsible people are selected by volunteer ID and free text is ignored',()=>{
 const id='00000000-0000-4000-8000-000000000001';assert.equal(validateEvent(event({responsibleId:id})).responsibleId,id);
 assert.throws(()=>validateEvent(event({responsibleId:'أحمد'})));
 const forged=validateEvent({...event(),responsible:'اسم حر'});assert.ok(!('responsible' in forged));assert.equal(forged.responsibleId,null);
});
test('dates and notes are optional but invalid supplied values are rejected',()=>{
 assert.equal(validateEvent(event({notes:'سطر\nآخر'})).notes,'سطر\nآخر');
 assert.throws(()=>validateEvent(event({eventDate:'2026-02-30'})));assert.throws(()=>validateEvent(event({notes:'x'.repeat(1001)})));
});
