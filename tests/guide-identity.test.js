import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createElement as h, act } from "react";
import { JSDOM } from "jsdom";
import { compileUI } from "./helpers/compile-ui.js";

const outline = readFileSync("docs/guide/bylaws.md", "utf8");
const identity = readFileSync("docs/guide/identity.md", "utf8");
const books = outline.split(/(?=^# الباب )/m);
const at = compileUI("tmp/bylaws-tests", [
  "src/components/shared/PageIdentity.tsx",
  "src/components/Team/GuideIdentity.tsx",
  "src/components/Team/GuideText.tsx",
  "src/components/Team/GuideStructure.tsx",
  "src/components/Team/TeamDialog.tsx",
  "src/components/Team/GuideGovernance.tsx",
  "src/data/sahwaGuide.ts",
  "src/data/sahwaStructure.ts",
  "src/data/sahwaGovernance.ts",
  "src/components/Team/GuideTabs.tsx",
  "src/views/TeamGuide.tsx",
]);
const { default: TeamGuide } = await at("src/views/TeamGuide.js");

function sourceLines(source) {
  return source.split(/\r?\n/).filter(line => line.trim() && line !== "---")
    .map(line => line.replace(/^#{1,4} |^- /, "").replaceAll("**", ""));
}
function checkContent(container, source) {
  const blocks = container.querySelectorAll("h2,h3,h4,h5,p,li,summary");
  assert.deepEqual([...blocks].map(block => block.textContent), sourceLines(source));
}
function normalizeWords(text) {
  return text.replace(/\s+/g, " ").trim();
}
function expectedIdentityText(source) {
  return normalizeWords(
    sourceLines(source)
      .map((line) => line.replace(/^الفصل\s+[\d.]+\s*—\s*/, ""))
      .map((line) => line.replace(/^(\d+)\.\s+/, "$1 ").replace(/ — /g, " "))
      .join(" "),
  );
}
function renderedIdentityText(container) {
  const chapters = [...container.querySelectorAll(".guide-identity-tab")];
  const panels = [...container.querySelectorAll(".guide-identity-tabpanel")];
  assert.equal(chapters.length, 5);
  assert.equal(panels.length, 5);
  const parts = [];
  for (let i = 0; i < chapters.length; i += 1) {
    parts.push(chapters[i].textContent);
    const leaves = panels[i].querySelectorAll("h3,h4,h5,p,li,time,.guide-identity-goal-number,.guide-identity-badge,.guide-identity-level-num,.guide-identity-domain-num");
    for (const node of leaves) {
      if (node.tagName === "LI" && node.querySelector("h4,p")) continue;
      parts.push(node.textContent);
    }
  }
  return normalizeWords(parts.join(" "));
}

test("the two guide sources match the supplied UTF-8 files byte for byte", () => {
  const hash = source => createHash("sha256").update(source).digest("hex");
  assert.equal(hash(outline), "e304a76b4ea70eb072f53c40127b81569da3e4c914b58488c9652164d0d00edf");
  assert.equal(hash(identity), "94dac43f535482c8281b9c75345e1105c8decca6361ec4a94ffc416b991d2f29");
  assert.equal(books.length, 7);
});

test("all source text is reachable verbatim in the three tabs, with interactive identity sections", async () => {
  const dom = new JSDOM('<div id="root"></div>', {
    url: "https://sahwa.world/team/guide#guide-structure-map", pretendToBeVisual: true,
  });
  const previous = { window: globalThis.window, document: globalThis.document, act: globalThis.IS_REACT_ACT_ENVIRONMENT };
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const { createRoot } = await import("react-dom/client");
  const root = createRoot(document.getElementById("root"));
  const tab = id => document.getElementById("tab-guide-" + id);
  const current = () => document.querySelector('.guide-reading-panel:not([hidden])');
  const press = async (key) => act(async () => document.querySelector('.guide-book-tabs [role=tab][aria-selected=true]')
    .dispatchEvent(new dom.window.KeyboardEvent("keydown", { key, bubbles: true, cancelable: true })));
  try {
    await act(async () => root.render(h(TeamGuide)));
    assert.equal(current().id, "guide-structure");
    checkContent(current().querySelector('[data-book="2"]'), books[1]);
    const outlineBook = current().querySelector('[data-book="2"]');
    await act(async () => outlineBook.querySelector("summary").click());
    assert.equal(outlineBook.open, true);
    const jump = outlineBook.querySelector('a[href="#guide-structure-map"]');
    assert.equal(jump.textContent, "رسم خطوط القيادة والتبعية والتنسيق.");
    assert.equal(jump.pathname, "/team/guide");
    assert.ok(current().querySelector(jump.hash));

    await press("Home");
    assert.equal(document.activeElement, tab("identity"));
    assert.equal(dom.window.location.hash, "#guide-identity");
    checkContent(current().querySelector('[data-book="1"]'), books[0]);
    assert.equal(current().querySelector('[data-book="1"]').open, false);

    const identitySection = current().querySelector("[data-identity]");
    assert.ok(identitySection);
    assert.equal(renderedIdentityText(identitySection), expectedIdentityText(identity));

    const sectionTabs = [...identitySection.querySelectorAll(".guide-identity-tab")];
    assert.deepEqual(sectionTabs.map((btn) => btn.textContent), [
      "التعريف بصحوة ونشأتها",
      "الرؤية والرسالة والأهداف",
      "الجمهور المستهدف",
      "القيم والمبادئ والثوابت",
      "مجالات عمل صحوة وأولوياتها",
    ]);
    assert.ok(!identitySection.textContent.includes("الفصل 1."));
    assert.equal(identitySection.querySelectorAll(".guide-identity-tabpanel:not([hidden])").length, 1);
    assert.equal(identitySection.querySelector(".guide-identity-tabpanel:not([hidden])").id, "guide-identity-panel-about");

    await act(async () => sectionTabs[1].click());
    assert.equal(sectionTabs[1].getAttribute("aria-selected"), "true");
    assert.equal(identitySection.querySelector(".guide-identity-tabpanel:not([hidden])").id, "guide-identity-panel-vision");
    assert.ok(identitySection.querySelector("#guide-identity-goals"));

    // Find-in-page beforematch reveals the matching hidden="until-found" panel and syncs tab state.
    const principlesPanel = identitySection.querySelector("#guide-identity-panel-principles");
    assert.equal(principlesPanel.getAttribute("hidden"), "until-found");
    await act(async () => {
      principlesPanel.dispatchEvent(new dom.window.Event("beforematch", { bubbles: true }));
    });
    assert.equal(sectionTabs[3].getAttribute("aria-selected"), "true");
    assert.equal(principlesPanel.hasAttribute("hidden"), false);

    await press("ArrowRight");
    assert.equal(document.activeElement, tab("policies"));
    assert.equal(current().id, "guide-policies");
    assert.equal(document.querySelector(".guide-map"), null);
    const grouped = [...current().querySelectorAll("details[data-book]")];
    assert.equal(grouped.length, 5);
    for (const [i, section] of grouped.entries()) {
      assert.equal(section.dataset.book, String(i + 3));
      if (!section.open) section.querySelector("summary").click();
      assert.ok(section.open);
      checkContent(section, books[i + 2]);
    }
    assert.equal(grouped.at(-1).querySelector("p:last-child").textContent, "website");
    await press("ArrowLeft");
    assert.equal(document.activeElement, tab("identity"));
    await act(async () => tab("structure").click());
    assert.equal(current().id, "guide-structure");
    await act(async () => {
      dom.window.location.hash = "#guide-identity-story";
      dom.window.dispatchEvent(new dom.window.HashChangeEvent("hashchange"));
    });
    assert.equal(current().id, "guide-identity");
    assert.equal(current().querySelector(".guide-identity-tabpanel:not([hidden])").id, "guide-identity-panel-about");
    assert.ok(current().querySelector("#guide-identity-story"));
  } finally {
    await act(async () => root.unmount());
    dom.window.close();
    globalThis.window = previous.window;
    globalThis.document = previous.document;
    globalThis.IS_REACT_ACT_ENVIRONMENT = previous.act;
  }
});
