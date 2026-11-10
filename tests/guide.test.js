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

test("guide exposes the identity and structure tabs without showing unselected content", () => {
  const html = renderToStaticMarkup(h(TeamGuide));
  const dom = new JSDOM(html);
  const { document } = dom.window;

  assert.match(document.body.textContent, /دليل صحوة/);
  assert.equal(document.querySelectorAll(".guide-chapter-card-soon").length, 2);
  assert.equal(document.querySelectorAll(".guide-chapter-card-active").length, 2);
  assert.equal(document.querySelectorAll(".guide-map").length, 0);
  assert.ok(document.body.textContent.includes("الهيكل والصلاحيات"));
  assert.ok(document.body.textContent.includes("هوية صحوة"));
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

test("role and team cards keep brief permissions visible and extra details optional", async () => {
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
    await React.act(async () =>
      document.querySelector("#guide-chapter-tab-03").click(),
    );
    assert.equal(document.querySelectorAll(".guide-map-council-member").length, 6);
    assert.equal(document.querySelectorAll(".guide-map-planned-item").length, 4);
    const roleButton = document.querySelector(
      '[data-role-id="university-youth-coordinator"]',
    );
    assert.ok(roleButton);
    await React.act(async () => roleButton.click());

    const dialog = document.querySelector("dialog");
    assert.ok(dialog?.open);
    assert.match(dialog.textContent, /منسق شباب الجامعة/);
    assert.equal(dialog.querySelectorAll(".guide-role-fields-short > div").length, 3);
    const extra = dialog.querySelector("details.guide-more-details");
    assert.ok(extra && !extra.open, "extra role details should be closed initially");
    for (const label of ["الدور باختصار", "ما الذي يمكنك فعله؟", "متى تحتاج موافقة؟"]) {
      assert.ok(dialog.querySelector(".guide-role-fields-short").textContent.includes(label), label);
    }
    for (const label of ["مهام أخرى", "المخرجات", "التنسيق مع", "البديل عند الغياب"]) {
      assert.ok(extra.textContent.includes(label), label);
    }
    await React.act(async () =>
      dialog.querySelector('[aria-label="إغلاق"]').click(),
    );
    assert.equal(document.querySelector("dialog"), null);

    await React.act(async () =>
      document.querySelector('[data-unit-id="university-media"]').click(),
    );
    const unitDialog = document.querySelector("dialog");
    assert.ok(unitDialog?.open);
    assert.match(unitDialog.textContent, /الإعلام الميداني/);
    assert.equal(unitDialog.querySelectorAll(".guide-role-fields-short > div").length, 3);
    assert.match(unitDialog.querySelector(".guide-role-fields-short").textContent, /حدود الصلاحيات/);
    assert.ok(!unitDialog.querySelector("details.guide-more-details").open);
    await React.act(async () =>
      unitDialog.querySelector('[aria-label="إغلاق"]').click(),
    );

    await React.act(async () =>
      document.querySelector('[data-unit-id="technology"]').click(),
    );
    const proposedDialog = document.querySelector("dialog");
    assert.match(proposedDialog.textContent, /لم تُفعّل بعد/);
    assert.equal(proposedDialog.querySelectorAll(".guide-map-dialog-roles .guide-role-button").length, 0);
  } finally {
    await React.act(async () => root.unmount());
    dom.window.close();
    globalThis.window = previous.window;
    globalThis.document = previous.document;
    globalThis.IS_REACT_ACT_ENVIRONMENT = previous.act;
  }
});
