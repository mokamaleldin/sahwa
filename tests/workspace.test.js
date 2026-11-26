import { test } from "node:test";
import assert from "node:assert/strict";
import { PLATFORM_ROLES } from "../shared/platform-roles.js";
import { buildPermissions, can, canAny } from "../server/platform/access.js";
import { workspaceData, communityData } from "../server/platform/service.js";

const campusLead = ["volunteers", "events", "publish", "studio"];
const activityLead = [...campusLead, "inbox"];
const relationsLead = ["volunteers", "create-relation", "relations", "inbox", "studio", "events"];
const expected = {
  "sahwa-lead": [...activityLead, "permissions", "forms", "relations", "create-relation"],
  "women-sector-lead": activityLead, "university-youth-lead": activityLead, "university-women-lead": activityLead,
  "internal-activities-lead": activityLead, "central-activities-lead": activityLead,
  "internal-activities-member": ["events"], "central-activities-member": ["events"],
  "university-relations-lead": relationsLead, "central-relations-lead": relationsLead,
  "university-relations-member": ["relations", "events"], "central-relations-member": ["relations", "events"],
  "media-lead": ["volunteers", "inbox", "studio", "events"], "media-member": ["events"],
  "finance-lead": ["events"], "archive-lead": ["events"], "review-lead": ["events"], "review-member": ["events"],
  "university-volunteer": ["events"], "central-volunteer": ["events"],
};
function member(role, status, grants = []) {
  const sector = role.sector === "women" ? "women" : role.sector === "none" ? null : "youth";
  const actor = {kind:"account", status, sector: sector || "youth", university:"استنيا",
    assignments: [{roleId:role.id, university:role.scope === "central" ? null : "استنيا", sector}], grants};
  actor.permissions = buildPermissions(actor);
  return actor;
}

for (const role of PLATFORM_ROLES) {
  for (const status of ["نشط", "غير نشط", "متوقف مؤقتًا"]) {
    test(`workspace and operational permissions: ${role.id} / ${status}`, () => {
      const actor = member(role, status, status === "نشط" ? [] : [{id:"delegation",permission:"events.create",effect:"allow"}]);
      assert.deepEqual(workspaceData(actor).map((t) => t.id).sort(), [...(status === "نشط" ? expected[role.id] : ["events"])].sort());
      for (const key of ["community.view","guide.view","forms.submit","directory.view","profile.edit"]) assert.ok(can(actor,key),key);
      assert.ok(can(actor,"events.view"));
      assert.equal(canAny(actor,"events.create"), status === "نشط" && role.level === "lead");
      if (status !== "نشط") {
        for (const key of ["roles.assign","events.edit","relations.edit","forms.review","permissions.manage","accounts.create","events.create","studio.use"]) assert.equal(canAny(actor,key),false,key);
      }
    });
  }
}

test("page access, record access, explicit delegation and denial remain independent", () => {
  const role = PLATFORM_ROLES.find((r) => r.id === "media-member");
  const actor = member(role,"نشط",[{id:"studio",permission:"studio.use",effect:"allow"},{id:"events",permission:"events.open",effect:"allow"}]);
  assert.deepEqual(workspaceData(actor).map((t) => t.id),["events","studio"]);
  assert.equal(can(actor,"events.open"), true);
  assert.equal(can(actor,"events.view"), true);
  actor.grants.push({id:"stop",permission:"studio.use",effect:"deny"});
  actor.permissions = buildPermissions(actor);
  assert.deepEqual(workspaceData(actor).map((t) => t.id),["events"]);
});

test("community keeps confirmed completions in the seven Istanbul calendar days and applies per-team visibility", () => {
  const actor = member(PLATFORM_ROLES.find((r) => r.id === "central-activities-member"),"نشط");
  const event = (id, eventDate, progress, team = "central-activities") => ({id,eventDate,progress,team,university:null,sector:"youth"});
  const feed = communityData(actor,[],[
    event("start","2026-11-20","completed"),event("old","2026-11-19","completed"),event("today","2026-11-26","completed"),
    event("missed","2026-11-24","planned"),event("legacy","2026-11-24",null),event("cancel","2026-11-29","cancelled"),event("soon","2026-11-28","planned"),
    event("other","2026-11-26","completed","internal-activities")],"2026-11-26");
  assert.deepEqual(feed.weekEvents.map((e) => e.id),["start","today","other"]);
  assert.deepEqual(feed.upcomingEvents.map((e) => e.id),["soon"]);
});
