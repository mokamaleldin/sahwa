import { PGlite } from '@electric-sql/pglite';
import { readFile } from 'node:fs/promises';
import { createTeamStore } from '../../server/team-store.js';
export async function testDatabase({sharedEmail='sahwa@example.invalid',legacySetup}={}) {
 const db=new PGlite();
 await db.exec(await readFile(new URL('../../db/migrations/001-team.sql',import.meta.url),'utf8'));
 if(legacySetup)await legacySetup(db);
 const migration=await readFile(new URL('../../db/migrations/002-independent-volunteers.sql',import.meta.url),'utf8');
 await db.transaction(async tx=>{await tx.query("SELECT set_config('sahwa.shared_email',$1,true)",[sharedEmail]);for(const statement of migration.split(';').map(x=>x.trim()).filter(Boolean))await tx.query(statement);});
 const sql={query(text,params=[]){return {text,params,then(resolve,reject){return db.query(text,params).then(result=>result.rows).then(resolve,reject);}};},transaction(queries){return db.transaction(async tx=>{const results=[];for(const query of queries)results.push((await tx.query(query.text,query.params)).rows);return results;});}};
 return {db,store:createTeamStore(()=>sql)};
}
export const person=(overrides={})=>({fullName:'أحمد محمد',university:'استنيا',major:'هندسة',studyYear:'الثانية',birthDate:'2004-02-29',gender:'شاب',team:'إعلام',responsibility:'عضو',phone:'',status:'نشط',...overrides});
export const event=(overrides={})=>({title:'لقاء صحوة',eventDate:'',responsibleId:null,attendance:null,notes:'',preserveLegacyResponsible:false,...overrides});
