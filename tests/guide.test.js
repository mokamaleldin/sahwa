import test from "node:test";
import assert from "node:assert/strict";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { JSDOM } from "jsdom";
import { compileUI } from "./helpers/compile-ui.js";

const output = "tmp/guide-tests";
const at = compileUI(output, [
  "src/data/sahwaGuide.ts",
  "src/components/shared/PageIdentity.tsx",
  "src/components/Team/TeamDialog.tsx",
  "src/views/TeamGuide.tsx",
]);
const [{ default: TeamGuide }, { responsibilityCards }] = await Promise.all([
  at("src/views/TeamGuide.js"),
  at("src/data/sahwaGuide.js"),
]);

test("guide presents the agreed structure without inventing future units", () => {
  const html = renderToStaticMarkup(h(TeamGuide));
  const dom = new JSDOM(html);
  const { document } = dom.window;

  assert.match(document.body.textContent, /دليل صحوة/);
  assert.equal(document.querySelectorAll(".guide-chapter-card-soon").length, 3);
  assert.equal(document.querySelectorAll(".guide-chapter-card-active").length, 1);
  assert.equal(document.querySelectorAll(".guide-council-role").length, 6);
  assert.equal(document.querySelectorAll(".guide-unit-active").length, 2);
  assert.equal(document.querySelectorAll(".guide-unit-soon").length, 4);

  for (const text of [
    "الإعلام المركزي",
    "العلاقات العامة المركزية",
    "البرامج والبحث",
    "المتابعة والمراجعة والتظلمات",
    "التوسع والتدريب",
    "التقنية والمنصة",
    "مسودة للنقاش",
    "90 يومًا",
  ]) {
    assert.ok(document.body.textContent.includes(text), text);
  }
  for (const excluded of ["شؤون المتطوعين والخريجين", "الزبالة"]) {
    assert.ok(!document.body.textContent.includes(excluded), excluded);
  }
  dom.window.close();
});

test("every responsibility has the complete seven-field data model", () => {
  assert.ok(responsibilityCards.length >= 20);
  const ids = new Set();
  for (const role of responsibilityCards) {
    assert.ok(role.id && !ids.has(role.id), role.id);
    ids.add(role.id);
    assert.ok(role.title);
    assert.ok(role.connection);
    assert.ok(role.objective);
    assert.ok(role.tasks.length > 0);
    assert.ok(role.approvals.length > 0);
    assert.ok(role.outputs.length > 0);
    assert.ok(role.coordination.length > 0);
    assert.ok(role.substitute);
  }
});

test("clicking a role opens its responsibility card with seven fields", async () => {
  const dom = new JSDOM('<div id="root"></div>', {
    url: "https://sahwa.world/team/guide",
    pretendToBeVisual: true,
  });
  const previous = {
    window: globalThis.window,
    document: globalThis.document,
    act: globalThis.IS_REACT_ACT_ENVIRONMENT,
  };
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  dom.window.HTMLDialogElement.prototype.showModal = function () {
    this.open = true;
  };
  dom.window.HTMLDialogElement.prototype.close = function () {
    this.open = false;
  };
  const React = await import("react");
  const { createRoot } = await import("react-dom/client");
  const { HelmetProvider } = await import("react-helmet-async");
  HelmetProvider.canUseDOM = false;
  const root = createRoot(document.getElementById("root"));

  try {
    await React.act(async () =>
      root.render(h(HelmetProvider, null, h(TeamGuide))),
    );
    const roleButton = document.querySelector(
      '[data-role-id="university-youth-coordinator"]',
    );
    assert.ok(roleButton);
    await React.act(async () => roleButton.click());

    const dialog = document.querySelector("dialog");
    assert.ok(dialog?.open);
    assert.match(dialog.textContent, /منسق شباب الجامعة/);
    assert.equal(dialog.querySelectorAll(".guide-role-fields > div").length, 7);
    for (const label of [
      "المسمى والارتباط",
      "الهدف",
      "المهام والصلاحيات",
      "يحتاج موافقة على",
      "المخرجات",
      "التنسيق",
      "البديل",
    ]) {
      assert.ok(dialog.textContent.includes(label), label);
    }
    await React.act(async () =>
      dialog.querySelector('[aria-label="إغلاق"]').click(),
    );
    assert.equal(document.querySelector("dialog"), null);
  } finally {
    await React.act(async () => root.unmount());
    dom.window.close();
    globalThis.window = previous.window;
    globalThis.document = previous.document;
    globalThis.IS_REACT_ACT_ENVIRONMENT = previous.act;
  }
});
