import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

const view = readFileSync("src/views/TeamGuide.tsx", "utf8");
const units = readFileSync("src/data/sahwaStructure.ts", "utf8");
const roles = readFileSync("src/data/sahwaGuide.ts", "utf8");
const css = readFileSync("src/guide.css", "utf8");

test("interactive guide source has valid TSX syntax", () => {
  const result = ts.transpileModule(view, {
    fileName: "TeamGuide.tsx",
    reportDiagnostics: true,
    compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.ReactJSX },
  });
  const errors = (result.diagnostics || []).filter(item => item.category === ts.DiagnosticCategory.Error);
  assert.deepEqual(errors.map(error => ts.flattenDiagnosticMessageText(error.messageText, "\n")), []);
  assert.ok(result.outputText.includes("guide-map-branches"));
});

test("organizational chart replaces duplicate sections and unwanted phrases", () => {
  for (const removed of [
    "بطاقات المسؤوليات",
    "تفويض واضح",
    "قيادة دون احتكار",
    "مساءلة عادلة",
    "أربعة أبواب، نبدأ بالأكثر إلحاحًا",
    "كيف يتحرك القرار؟",
    "الصلاحية تتحرك مع المسؤولية",
  ]) {
    assert.ok(!view.includes(removed), removed);
  }
  for (const node of ["guide-map-board-trigger", "guide-map-branches", "guide-map-contribution", "UnitDialog", "RoleDialog"]) {
    assert.ok(view.includes(node), node);
  }
});

test("every role remains reachable and proposed units are clearly marked", () => {
  const ids = [...roles.matchAll(/^\s+id: "([^"]+)"/gm)].map(match => match[1]);
  assert.ok(ids.length >= 20);
  for (const roleId of ids) {
    assert.ok(view.includes('"' + roleId + '"') || units.includes('"' + roleId + '"'), "unreachable role: " + roleId);
  }
  const unitIds = [...units.matchAll(/^\s+id: "([^"]+)"/gm)].map(match => match[1]);
  for (const unitId of [...view.matchAll(/unitId="([^"]+)"/g)].map(match => match[1])) {
    assert.ok(unitIds.includes(unitId), "undefined unit: " + unitId);
  }
  for (const future of ["programs", "review", "expansion", "technology"]) {
    assert.ok(units.includes('id: "' + future + '"'));
  }
  assert.ok(units.includes("لم تُفعّل بعد"));
});

test("mobile layout and keyboard focus are supported", () => {
  assert.ok(css.includes("@media(max-width:900px)"));
  assert.ok(css.includes("@media(max-width:640px)"));
  assert.ok(css.includes(".guide-map-unit-trigger:focus-visible"));
});

test("all six council roles branch below the board, not inside its card", () => {
  const boardEnd = view.indexOf("</article>", view.indexOf('className="guide-map-board"'));
  const membersStart = view.indexOf('className="guide-map-council-members"');
  const membersEnd = view.indexOf("</section>", membersStart);
  const branch = view.slice(membersStart, membersEnd);
  assert.ok(boardEnd > 0 && membersStart > boardEnd, "members should be siblings below the board");
  assert.ok(view.slice(boardEnd, membersStart).includes('className="guide-map-council-link"'));
  assert.ok(branch.includes('councilRoles.map((roleId)'));
  assert.equal((branch.match(/className="guide-map-council-member"/g) || []).length, 1);
  assert.ok(css.includes("grid-template-columns: repeat(6,minmax(0,1fr))"));
  assert.ok(css.includes(".guide-map-board-members::before"));
  assert.ok(css.includes(".guide-map-council-member::before"));
  assert.ok(css.includes("grid-template-columns: repeat(2,minmax(0,1fr))"));
});


test("every operational branch connects its units, members and shared volunteers", () => {
  assert.equal((view.match(/<OrganizationTeam\b/g) || []).length, 8);
  for (const id of [
    "universities", "university-youth", "university-women", "university-media", "university-relations",
    "central", "central-youth", "central-women", "central-media", "central-relations", "participation",
  ]) {
    assert.ok(view.includes('unitId="' + id + '"'), "unreachable unit: " + id);
  }
  for (const connector of [
    "guide-map-branch-root-link",
    "guide-map-branch-tree",
    "guide-map-tree-tier",
    "guide-map-team-link",
    "guide-map-team-role",
    "guide-map-collaboration-link",
    "guide-map-contribution-link",
    "guide-map-contribution-role",
  ]) {
    assert.ok(view.includes(connector), "missing chart node: " + connector);
    assert.ok(css.includes("." + connector), "missing styling: " + connector);
  }
  for (const diagramRule of [
    ".guide-map-branch-tree::before",
    ".guide-map-pair::before",
    ".guide-map-team::before",
    ".guide-map-team-roles::before",
    ".guide-map-team-role::before",
    ".guide-map-planned-item:nth-child(-n+2)::after",
    ".guide-map-contribution-roles::before",
  ]) {
    assert.ok(css.includes(diagramRule), "unconnected descendant: " + diagramRule);
  }
  assert.ok(css.includes(".guide-map-pair::before { display: none; }"), "mobile tree needs side-spine variant");
  assert.ok(view.includes("المسار المشترك بين الجامعات"));
  assert.ok(view.includes("فريقا الشباب والطالبات"));
});
