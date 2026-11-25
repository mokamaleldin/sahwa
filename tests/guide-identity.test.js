import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createElement as h, act } from "react";
import { JSDOM } from "jsdom";
import { compileUI } from "./helpers/compile-ui.js";

const outline = readFileSync("docs/guide/bylaws.md", "utf8");
const identity = readFileSync("docs/guide/identity.md", "utf8");
const structure = readFileSync("docs/guide/structure.md", "utf8");
const decisions = readFileSync("docs/guide/decisions.md", "utf8");
const books = outline.split(/(?=^# الباب )/m);
const at = compileUI("tmp/bylaws-tests", [
  "src/components/shared/PageIdentity.tsx",
  "src/components/Team/GuideBooklet.tsx",
  "src/components/Team/GuideDecisions.tsx",
  "src/components/Team/GuideIdentity.tsx",
  "src/components/Team/GuideText.tsx",
  "src/components/Team/GuideStructure.tsx",
  "src/components/Team/TeamDialog.tsx",
  "src/components/Team/GuideGovernance.tsx",
  "src/lib/bookletHtml.ts",
  "src/lib/structureParser.ts",
  "src/data/sahwaGuide.ts",
  "src/data/sahwaStructure.ts",
  "src/data/sahwaGovernance.ts",
  "src/components/Team/GuideTabs.tsx",
  "src/views/TeamGuide.tsx",
]);
const { default: TeamGuide } = await at("src/views/TeamGuide.js");
const { parseDecisionsBook, parseIdentityBook, parseStructureBook } = await at("src/lib/structureParser.js");
const { buildBookletHtml } = await at("src/lib/bookletHtml.js");

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
function wordsFromBlocks(blocks) {
  return normalizeWords(
    blocks
      .flatMap((block) => {
        if (block.kind === "heading" || block.kind === "paragraph") return [block.text.replaceAll("**", "")];
        if (block.kind === "list") return block.items.map((item) => item.replaceAll("**", ""));
        if (block.kind === "table") return [...block.headers, ...block.rows.flat()].map((cell) => cell.replaceAll("**", ""));
        return [];
      })
      .join(" "),
  );
}
function wordsFromMarkdown(markdown) {
  return normalizeWords(
    markdown
      .replace(/\r\n/g, "\n")
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && line !== "---" && line !== "2.5" && !/^\|[\s:|-]+\|$/.test(line))
      .map((line) => {
        if (line.startsWith("|")) {
          return line.replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim()).join(" ");
        }
        if (/^#{1,4}\s+/.test(line)) return line.replace(/^#{1,4}\s+/, "");
        return line.replace(/^- /, "").replace(/^\d+\.\s+/, "");
      })
      .join(" ")
      .replaceAll("**", ""),
  );
}

test("the guide sources match the supplied UTF-8 files byte for byte", () => {
  const hash = source => createHash("sha256").update(source).digest("hex");
  assert.equal(hash(outline), "e304a76b4ea70eb072f53c40127b81569da3e4c914b58488c9652164d0d00edf");
  assert.equal(hash(identity), "94dac43f535482c8281b9c75345e1105c8decca6361ec4a94ffc416b991d2f29");
  assert.equal(hash(decisions), "283cc3a4a76a146e5f5ae2eb7f0da0d0b679f1d6ad67018c215211eb255369cc");
  assert.equal(books.length, 7);
});

test("all three booklets (Book 1 identity, Book 2 structure, Book 3 decisions) preserve 100% verbatim text and build printable HTML", () => {
  const idChapters = parseIdentityBook(identity);
  assert.equal(idChapters.length, 5);
  assert.equal(wordsFromBlocks(idChapters.flatMap((c) => c.blocks)), wordsFromMarkdown(identity));

  const parsed = parseStructureBook(structure);
  assert.equal(parsed.chapters.length, 9);
  for (const chapter of parsed.chapters) assert.ok(chapter.blocks.length > 0, chapter.id);
  assert.ok(parsed.entries.size >= 45);
  for (const [id, entry] of parsed.entries) assert.ok(entry.blocks.length > 0, `empty entry: ${id}`);
  assert.equal(wordsFromBlocks(parsed.chapters.flatMap((c) => c.blocks)), wordsFromMarkdown(structure));

  const decisionChapters = parseDecisionsBook(decisions);
  assert.equal(decisionChapters.length, 5);
  for (const chapter of decisionChapters) assert.ok(chapter.blocks.length > 0, chapter.id);
  assert.equal(
    wordsFromBlocks(decisionChapters.flatMap((c) => c.blocks)),
    wordsFromMarkdown(decisions),
  );
  const decisionTables = decisionChapters.flatMap((c) => c.blocks).filter((b) => b.kind === "table");
  assert.equal(decisionTables.length, 3);
  assert.equal(decisionTables[0].rows.length, 14);
  assert.equal(decisionTables[1].rows.length, 4);
  assert.equal(decisionTables[2].rows.length, 12);

  const html = buildBookletHtml("الهوية والنظام الأساسي والمرجعية", idChapters);
  assert.match(html, /dir="rtl"/);
  assert.match(html, /صحوة مبادرة طلابية إسلامية تأسست عام 2025 في تركيا/);
  assert.match(html, /@media print/);

  const decisionsHtml = buildBookletHtml("اتخاذ القرار والمجلس والتفويض", decisionChapters);
  assert.match(decisionsHtml, /dir="rtl"/);
  assert.match(decisionsHtml, /مصفوفة الصلاحيات والاعتماد/);
  assert.match(decisionsHtml, /المقاعد المشغولة/);
  assert.match(decisionsHtml, /مجلس المتابعة والمراجعة والتظلمات/);
});

test("Tab 1 offers simple overview and verbatim flip-through booklet; Tab 2 offers chart and booklet with no bottom BookDetails", async () => {
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
    assert.equal(current().querySelector('[data-book="2"]'), null);
    assert.ok(current().querySelector(".guide-map"));

    await press("Home");
    assert.equal(document.activeElement, tab("identity"));
    assert.equal(current().querySelector('[data-book="1"]'), null);

    // Simple intro view ("تعريف بصحوة")
    const identitySection = current().querySelector("[data-identity]");
    assert.ok(identitySection);
    assert.equal(identitySection.querySelectorAll(".guide-identity-nav .guide-identity-tab").length, 7);
    assert.ok(identitySection.querySelector("#guide-identity-about"));

    // Switch Tab 1 to flip-through booklet ("الكتيب")
    await act(async () => identitySection.querySelector("#guide-identity-mode-booklet").click());
    const idBooklet = identitySection.querySelector('[data-guide-booklet="sahwa-identity-booklet"]');
    assert.ok(idBooklet);
    assert.equal(idBooklet.querySelectorAll("[data-booklet-chapter]").length, 5);
    assert.equal(idBooklet.querySelector('[data-booklet-chapter="1.1"]').hasAttribute("hidden"), false);
    assert.equal(idBooklet.querySelector('[data-booklet-chapter="1.2"]').getAttribute("hidden"), "until-found");

    // Flip to page 2 with "الصفحة التالية"
    const nextBtn = [...idBooklet.querySelectorAll("button")].find((b) => b.textContent.includes("الصفحة التالية"));
    assert.ok(nextBtn);
    await act(async () => nextBtn.click());
    assert.equal(idBooklet.querySelector('[data-booklet-chapter="1.2"]').hasAttribute("hidden"), false);
    assert.match(idBooklet.textContent, /أهدافنا الأربعة/);

    // beforematch flips booklet automatically to chapter 1.5
    const ch5 = idBooklet.querySelector('[data-booklet-chapter="1.5"]');
    await act(async () => {
      ch5.dispatchEvent(new dom.window.Event("beforematch", { bubbles: true }));
    });
    assert.equal(ch5.hasAttribute("hidden"), false);

    // Tab 4 holds books 4..7 verbatim
    await press("ArrowRight");
    assert.equal(document.activeElement, tab("policies"));
    assert.equal(current().id, "guide-policies");
    const grouped = [...current().querySelectorAll("details[data-book]")];
    assert.equal(grouped.length, 4);
    for (const [i, section] of grouped.entries()) {
      assert.equal(section.dataset.book, String(i + 4));
      if (!section.open) section.querySelector("summary").click();
      assert.ok(section.open);
      checkContent(section, books[i + 3]);
    }
    assert.equal(grouped.at(-1).querySelector("p:last-child").textContent, "website");

    // Tab 3 opens Book 3 decisions booklet verbatim with no bottom BookDetails
    await press("ArrowRight");
    assert.equal(document.activeElement, tab("decisions"));
    assert.equal(current().id, "guide-decisions");
    assert.equal(current().querySelector('[data-book="3"]'), null);
    const decBooklet = current().querySelector('[data-guide-booklet="sahwa-decisions-booklet"]');
    assert.ok(decBooklet);
    assert.equal(decBooklet.querySelectorAll("[data-booklet-chapter]").length, 5);
    assert.equal(decBooklet.querySelector('[data-booklet-chapter="3.1"]').hasAttribute("hidden"), false);
    assert.equal(decBooklet.querySelector('[data-booklet-chapter="3.3"]').getAttribute("hidden"), "until-found");
    assert.match(decBooklet.querySelector('[data-booklet-chapter="3.1"]').textContent, /مصفوفة الصلاحيات/);

    // beforematch flips Book 3 booklet to chapter 3.5
    const decCh5 = decBooklet.querySelector('[data-booklet-chapter="3.5"]');
    await act(async () => {
      decCh5.dispatchEvent(new dom.window.Event("beforematch", { bubbles: true }));
    });
    assert.equal(decCh5.hasAttribute("hidden"), false);
    assert.match(decCh5.textContent, /القرارات المشتركة بين الجهات/);

    // Hash deep-link to #guide-decisions opens Tab 3 directly
    await act(async () => {
      dom.window.location.hash = "#guide-identity-story";
      dom.window.dispatchEvent(new dom.window.HashChangeEvent("hashchange"));
    });
    assert.equal(current().id, "guide-identity");
    assert.ok(current().querySelector("#guide-identity-story"));

    await act(async () => {
      dom.window.location.hash = "#guide-decisions";
      dom.window.dispatchEvent(new dom.window.HashChangeEvent("hashchange"));
    });
    assert.equal(current().id, "guide-decisions");
    assert.ok(current().querySelector('[data-guide-booklet="sahwa-decisions-booklet"]'));
  } finally {
    await act(async () => root.unmount());
    dom.window.close();
    globalThis.window = previous.window;
    globalThis.document = previous.document;
    globalThis.IS_REACT_ACT_ENVIRONMENT = previous.act;
  }
});
