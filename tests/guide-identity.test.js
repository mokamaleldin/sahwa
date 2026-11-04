import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

const view = readFileSync("src/views/TeamGuide.tsx", "utf8");
const chapter = readFileSync("src/components/Team/GuideIdentity.tsx", "utf8");
const css = readFileSync("src/guide-identity.css", "utf8");
const layout = readFileSync("src/app/layout.tsx", "utf8");

test("chapter tabs display only identity or structure, with upcoming chapters disabled", () => {
  assert.ok(view.includes('import GuideIdentity from "../components/Team/GuideIdentity"'));
  assert.match(view, /title: "هوية صحوة",[\s\S]*?available: true/);
  assert.ok(view.includes('role="tablist" aria-label="أبواب دليل صحوة"') || view.includes('aria-label="أبواب دليل صحوة"'));
  assert.ok(view.includes('aria-selected={activeChapter === chapter.number}'));
  assert.ok(view.includes('aria-disabled="true"'));
  assert.ok(view.includes('{activeChapter === "01" && <GuideIdentity />}'));
  assert.ok(view.includes('{activeChapter === "03" && <section'));
  assert.ok(view.includes('role="tabpanel"'));
  assert.ok(view.includes('const syncChapterFromHash = () =>'));
  assert.ok(view.includes('event.key === "ArrowLeft"'));
  assert.ok(layout.includes('import "../guide-identity.css"'));
});

test("identity has valid TSX syntax and all major text sections", () => {
  const result = ts.transpileModule(chapter, {
    fileName: "GuideIdentity.tsx",
    reportDiagnostics: true,
    compilerOptions: {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.ESNext,
      jsx: ts.JsxEmit.ReactJSX,
    },
  });
  const errors = (result.diagnostics || []).filter(item => item.category === ts.DiagnosticCategory.Error);
  assert.deepEqual(errors.map(error => ts.flattenDiagnosticMessageText(error.messageText, "\n")), []);
  for (const id of [
    "guide-identity",
    "guide-identity-story",
    "guide-identity-vision",
    "guide-identity-goals",
    "guide-identity-principles",
    "guide-identity-community",
    "guide-identity-numbers",
  ]) {
    assert.ok(chapter.includes('id="' + id + '"'), "missing anchor: " + id);
  }
  for (const date of ["9 ديسمبر 2025", "12 ديسمبر 2025", "2026"]) {
    assert.ok(chapter.includes(date), "missing milestone: " + date);
  }
  for (const statement of [
    "القرآن مرجعنا",
    "الصحبة الصالحة بيئتنا",
    "الأمة الواحدة هويتنا",
    "النفع والأثر غايتنا العملية",
    "رؤيتنا",
    "رسالتنا",
    "الإخلاص",
    "الأخوة",
    "التعاون",
    "المبادرة",
    "المسؤولية",
    "التعلم والتطور",
    "الاستمرارية",
    "نحو 90",
    "800+",
    "61",
  ]) {
    assert.ok(chapter.includes(statement), "missing user content: " + statement);
  }
  assert.ok(chapter.includes('aria-labelledby="guide-identity-title"'));
  assert.ok(chapter.includes('aria-label="أقسام هوية صحوة"'));
  for (const tab of ["about", "story", "vision", "goals", "principles", "community", "numbers"]) {
    assert.ok(chapter.includes('key: "' + tab + '"'), "missing sub-tab: " + tab);
    assert.ok(chapter.includes('activeSection === "' + tab + '" && ('), "sub-section not conditional: " + tab);
  }
  assert.ok(chapter.includes('aria-selected={activeSection === key}'));
  assert.ok(chapter.includes('role="tabpanel"'));
  assert.ok(chapter.includes('const syncSectionFromHash = () =>'));
});

test("identity navigation and layouts work at tablet and mobile breakpoints", () => {
  assert.ok(css.includes("@media (max-width: 900px)"));
  assert.ok(css.includes("@media (max-width: 640px)"));
  assert.ok(css.includes(".guide-identity-nav .guide-identity-tab:focus-visible"));
  assert.ok(css.includes(".guide-identity-tab-selected"));
  assert.ok(css.includes(".guide-identity-tab-panel"));
  assert.ok(css.includes("@media (prefers-reduced-motion: reduce)"));
  assert.ok(css.includes(".guide-identity-timeline::before"));
  assert.ok(css.includes(".guide-identity-goal-grid"));
  assert.ok(css.includes(".guide-identity-stats-grid"));
});
