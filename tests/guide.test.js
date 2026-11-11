import test from "node:test";
import assert from "node:assert/strict";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { JSDOM } from "jsdom";
import { compileUI } from "./helpers/compile-ui.js";

const output = "tmp/guide-tests";
const at = compileUI(output, [
  "src/data/sahwaGuide.ts",
  "src/data/sahwaStructure.ts",
  "src/data/sahwaGovernance.ts",
  "src/components/shared/PageIdentity.tsx",
  "src/components/Team/TeamDialog.tsx",
  "src/components/Team/GuideIdentity.tsx",
  "src/components/Team/GuideGovernance.tsx",
  "src/views/TeamGuide.tsx",
]);
const [{ default: TeamGuide }, { responsibilityCards }, { governanceRoles, governanceTopics }] = await Promise.all([
  at("src/views/TeamGuide.js"),
  at("src/data/sahwaGuide.js"),
  at("src/data/sahwaGovernance.js"),
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


test("new governance data retains all eighteen source roles and four chapters", () => {
  const expected = [
    "board", "sahwa-lead", "women-sector-lead", "central-youth-lead",
    "central-women-lead", "central-media-lead", "central-relations-lead",
    "university-youth-coordinator", "university-women-coordinator",
    "internal-youth-activities", "internal-women-activities", "university-activities-member",
    "field-media-member", "university-relations-lead", "university-relations-member",
    "central-media-member", "central-relations-member", "central-youth-member", "central-women-member",
  ];
  assert.deepEqual(Object.keys(governanceRoles).sort(), expected.sort());
  assert.equal(governanceTopics.length, 4);
  assert.ok(!responsibilityCards.some(role => role.id === "field-media-lead"));
  const studentSector = JSON.stringify(governanceRoles["women-sector-lead"].blocks);
  assert.match(studentSector, /بناء الأخوة داخل القطاع/);
  assert.match(studentSector, /متابعة مسؤولات الطالبات داخل الجامعات/);
  const centralWomen = JSON.stringify(governanceRoles["central-women-lead"].blocks);
  assert.match(centralWomen, /اختيار قائدات الفعاليات/);
  assert.match(centralWomen, /لا يحق لها إدارة الأنشطة الداخلية لفرق الطالبات بالجامعات/);
  const centralYouth = JSON.stringify(governanceRoles["central-youth-lead"].blocks);
  assert.match(centralYouth, /ما ليس من صلاحياته/);
  assert.match(centralYouth, /لا يحق له إدارة الأنشطة الداخلية للجامعات/);
  const events = governanceTopics.find(topic => topic.id === "events");
  assert.ok(events.blocks.some(block => block.kind === "table" && block.rows.length >= 10));
  assert.ok(governanceTopics.find(topic => topic.id === "pending").blocks.some(block => block.kind === "paragraph" && block.text.includes("آلية التعيين والإعفاء")));
});


test("corresponding youth and women roles have equal detail and sector-specific authority", () => {
  const headings = id => governanceRoles[id].blocks.filter(block => block.kind === "heading").map(block => block.text);
  const bullets = id => governanceRoles[id].blocks.reduce(
    (total, block) => total + (block.kind === "list" ? block.items.length : 0), 0,
  );
  const full = id => JSON.stringify(governanceRoles[id].blocks);
  for (const [youth, women, expectedHeadings, expectedBullets] of [
    ["central-youth-lead", "central-women-lead", 7, 29],
    ["university-youth-coordinator", "university-women-coordinator", 6, 44],
    ["internal-youth-activities", "internal-women-activities", 3, 10],
  ]) {
    assert.equal(headings(youth).length, expectedHeadings, youth);
    assert.equal(headings(women).length, expectedHeadings, women);
    assert.equal(bullets(youth), expectedBullets, youth);
    assert.equal(bullets(women), expectedBullets, women);
  }

  const femaleCentral = full("central-women-lead");
  for (const term of [
    "نطاق عملها", "مهامها التفصيلية", "صلاحياتها التنفيذية", "ما ليس من صلاحياتها",
    "الأنشطة المشتركة بين الشباب والطالبات", "التقارير والمخرجات",
    "مسؤولة قطاع الطالبات", "لا تصدر مسؤولة أنشطة الطالبات تكليفات منفردة إلى أعضاء فريق الشباب",
  ]) assert.ok(femaleCentral.includes(term), term);

  const femaleUniversity = full("university-women-coordinator");
  for (const term of [
    "بناء حضور صحوة داخل الجامعة", "إدارة الفريق", "الأخوة وبناء المجتمع",
    "كيف نعرف أنها ناجحة؟", "مسؤولة قطاع الطالبات",
  ]) assert.ok(femaleUniversity.includes(term), term);

  const femaleInternal = full("internal-women-activities");
  assert.match(femaleInternal, /تولي قيادة فعالية بنفسها/);
  assert.match(femaleInternal, /لا تصبح مسؤوليتها عن الأنشطة سلطة/);

  const womenSector = full("women-sector-lead");
  assert.match(womenSector, /قيادة العمل الإداري لقطاع الطالبات/);
  assert.match(womenSector, /تمثيل الطالبات في مجلس إدارة صحوة/);
  assert.match(womenSector, /دورها أثناء فعاليات الطالبات/);
  assert.match(womenSector, /ولا يعني ذلك انفرادها بإدارة المجلس/);
  assert.equal(bullets("women-sector-lead") >= 44, true);

  assert.match(full("central-media-lead"), /مشتركة تخدم فرق الشباب والطالبات معًا/);
  assert.match(full("central-relations-lead"), /مشتركة تخدم فرق الشباب والطالبات معًا/);
  assert.match(full("central-youth-member"), /عضو أنشطة الشباب/);
  assert.match(full("central-women-member"), /عضوة أنشطة الطالبات/);
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

test("the guide shows each role's full source-specific duties and keeps team and policy pages accessible", async () => {
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
    assert.match(dialog.textContent, /مسؤول الشباب داخل الجامعة/);
    const detail = dialog.querySelector(".guide-governance-content");
    assert.ok(detail, "full role-specific document should be visible");
    for (const label of ["بناء حضور صحوة داخل الجامعة", "الأخوة وبناء المجتمع", "صلاحياته", "حدود صلاحياته"]) {
      assert.ok(detail.textContent.includes(label), label);
    }
    assert.equal(dialog.querySelector("details.guide-more-details"), null);
    await React.act(async () =>
      dialog.querySelector('[aria-label="إغلاق"]').click(),
    );
    assert.equal(document.querySelector("dialog"), null);

    await React.act(async () =>
      document.querySelector('[data-role-id="women-sector-lead"]').click(),
    );
    const sector = document.querySelector("dialog");
    assert.ok(sector?.open);
    for (const text of [
      "مسؤولة قطاع الطالبات",
      "قيادة فرق الطالبات الجامعية",
      "بناء الأخوة داخل القطاع",
      "حدود صلاحياتها",
      "التوسع والتطوير",
    ]) assert.ok(sector.textContent.includes(text), text);
    assert.ok(!sector.textContent.includes("مسؤول أنشطة الشباب المركزية هو"), "women's sector must have its own duties");
    await React.act(async () => sector.querySelector('[aria-label="إغلاق"]').click());

    await React.act(async () =>
      document.querySelector('[data-role-id="university-women-coordinator"]').click(),
    );
    const womenUniversity = document.querySelector("dialog");
    assert.match(womenUniversity.textContent, /مسؤولة الطالبات داخل الجامعة/);
    assert.match(womenUniversity.textContent, /تنظيم لقاءات دورية للتعلم والصحبة/);
    await React.act(async () => womenUniversity.querySelector('[aria-label="إغلاق"]').click());

    await React.act(async () =>
      document.querySelector('[data-role-id="central-women-lead"]').click(),
    );
    const centralWomenDialog = document.querySelector("dialog");
    assert.ok(centralWomenDialog?.open);
    assert.match(centralWomenDialog.textContent, /نطاق عملها/);
    assert.match(centralWomenDialog.textContent, /ما ليس من صلاحياتها/);
    assert.match(centralWomenDialog.textContent, /التقارير والمخرجات/);
    await React.act(async () => centralWomenDialog.querySelector('[aria-label="إغلاق"]').click());

    await React.act(async () =>
      document.querySelector('[data-role-id="internal-women-activities"]').click(),
    );
    const internalWomenDialog = document.querySelector("dialog");
    assert.match(internalWomenDialog.textContent, /اختيار فرق التنفيذ وتوزيع المسؤوليات/);
    await React.act(async () => internalWomenDialog.querySelector('[aria-label="إغلاق"]').click());

    await React.act(async () =>
      document.querySelector('[data-unit-id="university-media"]').click(),
    );
    const unitDialog = document.querySelector("dialog");
    assert.ok(unitDialog?.open);
    assert.match(unitDialog.textContent, /الإعلام الميداني/);
    assert.equal(unitDialog.querySelectorAll(".guide-role-fields-short > div").length, 3);
    assert.equal(unitDialog.querySelectorAll(".guide-map-dialog-roles .guide-role-button").length, 1);
    assert.ok(!unitDialog.textContent.includes("مسؤول الإعلام الميداني"));
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
