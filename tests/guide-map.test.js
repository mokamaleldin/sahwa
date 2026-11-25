import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

const view = readFileSync("src/components/Team/GuideStructure.tsx", "utf8");
const parser = readFileSync("src/lib/structureParser.ts", "utf8");
const structureDoc = readFileSync("docs/guide/structure.md", "utf8");
const css = readFileSync("src/guide.css", "utf8");

test("interactive guide source has valid TSX syntax", () => {
  const result = ts.transpileModule(view, {
    fileName: "GuideStructure.tsx",
    reportDiagnostics: true,
    compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.ReactJSX },
  });
  const errors = (result.diagnostics || []).filter(item => item.category === ts.DiagnosticCategory.Error);
  assert.deepEqual(errors.map(error => ts.flattenDiagnosticMessageText(error.messageText, "\n")), []);
  assert.ok(result.outputText.includes("guide-map-branches"));
});

test("organizational chart removes draft banner, proposed-unit labels and old governance topics footer", () => {
  for (const removed of [
    "نسخة أولية — غير معتمدة نهائيًا",
    "وحدات مقترحة للتأسيس لاحقًا",
    "غير مفعّلة",
    "GuideGovernanceTopics",
    "القرارات والإجراءات المشتركة",
    "قواعد العمل بين الفرق",
  ]) {
    assert.ok(!view.includes(removed), removed);
  }
  for (const node of [
    "guide-structure-modes",
    "guide-map-board-trigger",
    "guide-map-branches",
    "StructureDialog",
    "GuideBooklet",
  ]) {
    assert.ok(view.includes(node), node);
  }
});

test("every unit and role in the chart is backed by verbatim entries in structureParser", () => {
  const entryIds = [...parser.matchAll(/id:\s*"([^"]+)"/g)].map(match => match[1]);
  for (const unitId of [...view.matchAll(/unitId="([^"]+)"/g)].map(match => match[1])) {
    assert.ok(entryIds.includes(unitId), "undefined unit: " + unitId);
  }
  for (const roleId of [...view.matchAll(/entryId="([^"]+)"/g)].map(match => match[1])) {
    assert.ok(entryIds.includes(roleId), "undefined entry: " + roleId);
  }
  for (const unit of [
    "universities", "university-board", "university-youth", "university-women",
    "university-relations", "university-media", "additional-committees",
    "central", "central-youth", "central-women", "central-media", "central-relations",
    "expansion", "technology", "programs",
    "admin-support", "finance", "records", "review",
  ]) {
    assert.ok(view.includes('unitId="' + unit + '"'), "missing chart unit: " + unit);
  }
});

test("all six council roles branch below the board, not inside its card", () => {
  const boardEnd = view.indexOf("</article>", view.indexOf('className="guide-map-board"'));
  const membersStart = view.indexOf('className="guide-map-council-members"');
  const membersEnd = view.indexOf("</section>", membersStart);
  const branch = view.slice(membersStart, membersEnd);
  assert.ok(boardEnd > 0 && membersStart > boardEnd, "members should be siblings below the board");
  assert.ok(view.slice(boardEnd, membersStart).includes('className="guide-map-council-link"'));
  assert.ok(branch.includes("councilRoles.map((roleId)"));
  assert.equal((branch.match(/className="guide-map-council-member"/g) || []).length, 1);
  assert.ok(css.includes("grid-template-columns: repeat(6,minmax(0,1fr))"));
  assert.ok(css.includes(".guide-map-board-members::before"));
  assert.ok(css.includes(".guide-map-council-member::before"));
});

test("mobile layout, connectors, and keyboard focus are supported", () => {
  assert.ok(css.includes("@media(max-width:900px)"));
  assert.ok(css.includes("@media(max-width:640px)"));
  assert.ok(css.includes(".guide-map-unit-trigger:focus-visible"));
  assert.ok(css.includes(".guide-structure-mode-tab:focus-visible"));
  assert.ok(structureDoc.includes("## الفصل 2.1 — الهيكل التنظيمي العام لصحوة"));
  assert.ok(structureDoc.includes("## الفصل 2.9 — قواعد التبعية والتنسيق والإنابة"));
  assert.ok(!view.includes('"field-media-lead"'));
});
