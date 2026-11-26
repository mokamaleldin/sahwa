import { PGlite } from '@electric-sql/pglite';
import { readFile } from 'node:fs/promises';
import { createTeamStore } from '../../server/team-store.js';
import { pgliteClient } from '../../server/pglite.js';
export async function testDatabase({sharedEmail='sahwa@example.invalid',legacySetup,beforePlatform}={}) {
 const db=new PGlite();
 await db.exec(await readFile(new URL('../../db/migrations/001-team.sql',import.meta.url),'utf8'));
 if(legacySetup)await legacySetup(db);
 const migration=await readFile(new URL('../../db/migrations/002-independent-volunteers.sql',import.meta.url),'utf8');
 await db.transaction(async tx=>{await tx.query("SELECT set_config('sahwa.shared_email',$1,true)",[sharedEmail]);for(const statement of migration.split(';').map(x=>x.trim()).filter(Boolean))await tx.query(statement);});
 await db.exec(await readFile(new URL('../../db/migrations/003-volunteer-role.sql',import.meta.url),'utf8'));
 if(beforePlatform)await beforePlatform(db);
 const platform=await readFile(new URL('../../db/migrations/004-platform.sql',import.meta.url),'utf8');
 await db.transaction(async tx=>{for(const statement of platform.split(';').map(x=>x.trim()).filter(Boolean))await tx.query(statement);});
 const owner=await readFile(new URL('../../db/migrations/005-owner-email-login.sql',import.meta.url),'utf8');
 await db.transaction(async tx=>{for(const statement of owner.split(';').map(x=>x.trim()).filter(Boolean))await tx.query(statement);});
 await db.exec(await readFile(new URL('../../db/migrations/006-platform-simplification.sql',import.meta.url),'utf8'));
 await db.exec(await readFile(new URL('../../db/migrations/007-team-workspace.sql',import.meta.url),'utf8'));
 const sql=pgliteClient(db);
 return {db,sql,store:createTeamStore(()=>sql)};
}
export const person=(overrides={})=>({fullName:'أحمد محمد',university:'استنيا',major:'هندسة',studyYear:'الثانية',birthDate:'2004-02-29',gender:'شاب',team:'إعلام',responsibility:'عضو',phone:'',status:'نشط',...overrides});
export const event=(overrides={})=>({title:'لقاء صحوة',eventDate:'',responsibleId:null,attendance:null,notes:'',preserveLegacyResponsible:false,...overrides});
