import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { compileUI } from "./helpers/compile-ui.js";
import { PLATFORM_ROLES, guideEntriesFor, roleLinks, roleById } from "../shared/platform-roles.js";

const load = compileUI("tmp/platform-roles-tests", ["src/lib/structureParser.ts"]);
const { parseStructureBook } = await load("src/lib/structureParser.js");
const source = readFileSync("docs/guide/structure.md", "utf8");
const book = parseStructureBook(source);
const text = (entryId) => {
  const entry = book.entries.get(entryId);
  assert.ok(entry, `guide entry ${entryId} exists`);
  return entry.blocks.map((b) => (b.kind === "table" ? [...b.headers, ...b.rows.flat()].join(" ") : b.kind === "list" ? b.items.join(" ") : b.text)).join("\n");
};

test("there are exactly twenty technical roles with stable, unique ids", () => {
  assert.equal(PLATFORM_ROLES.length, 20);
  assert.deepEqual(PLATFORM_ROLES.map((r) => r.number), Array.from({ length: 20 }, (_, i) => i + 1));
  assert.equal(new Set(PLATFORM_ROLES.map((r) => r.id)).size, 20);
  assert.deepEqual(PLATFORM_ROLES.filter((r) => r.deferred).map((r) => r.number), [15, 16, 17, 18]);
});

test("every role links to non-empty verbatim Chapter 2 text for each sector it can hold", () => {
  for (const role of PLATFORM_ROLES) {
    const sectors = role.sector === "required" ? ["youth", "women"] : [role.sector === "none" ? null : role.sector];
    for (const sector of sectors) {
      const entries = guideEntriesFor(role.id, sector);
      assert.ok(entries.length, `${role.id}/${sector} has a source`);
      for (const id of entries) {
        const body = text(id);
        assert.ok(body.length > 40, `${id} is not empty`);
        // Verbatim: every paragraph of the entry exists as-is in the saved source.
        for (const block of book.entries.get(id).blocks)
          if (block.kind === "paragraph") assert.ok(source.includes(block.text), `${id} paragraph is verbatim`);
      }
    }
  }
});

test("every reporting and coordination link quotes a phrase that exists in its source", () => {
  for (const role of PLATFORM_ROLES) {
    const sectors = role.sector === "required" ? ["youth", "women"] : [role.sector === "none" ? null : role.sector];
    for (const sector of sectors) {
      for (const link of roleLinks(role.id, sector)) {
        assert.ok(roleById(link.target), `${role.id} -> ${link.target} is a known role`);
        const sources = link.sourceEntry ? [link.sourceEntry] : guideEntriesFor(role.id, sector);
        const body = sources.map(text).join("\n");
        assert.ok(body.includes(link.phrase), `${role.id}/${sector}: «${link.phrase}» appears verbatim`);
        if (link.relation !== "team") assert.ok(body.includes(link.label), `${role.id}/${sector}: label «${link.label}» appears verbatim`);
      }
    }
  }
});
