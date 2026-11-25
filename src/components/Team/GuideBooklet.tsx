"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import {
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  List,
  Printer,
} from "lucide-react";
import { GuideGovernanceBlocks } from "./GuideGovernance";
import type { GovernanceBlock } from "../../data/sahwaGovernance";
import type { StructureChapter } from "../../lib/structureParser";

function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function inlineHtml(text: string): string {
  return escapeHtml(text).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}

function blockToHtml(block: GovernanceBlock): string {
  if (block.kind === "heading") return `<h3>${inlineHtml(block.text)}</h3>`;
  if (block.kind === "paragraph") return `<p>${inlineHtml(block.text)}</p>`;
  if (block.kind === "list") {
    const tag = block.ordered ? "ol" : "ul";
    const items = block.items.map((item) => `<li>${inlineHtml(item)}</li>`).join("");
    return `<${tag}>${items}</${tag}>`;
  }
  if (block.kind === "table") {
    const head = block.headers.map((cell) => `<th>${inlineHtml(cell)}</th>`).join("");
    const body = block.rows
      .map((row) => `<tr>${row.map((cell) => `<td>${inlineHtml(cell)}</td>`).join("")}</tr>`)
      .join("");
    return `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
  }
  return "";
}

export function buildBookletHtml(title: string, chapters: StructureChapter[]): string {
  const origin = typeof window !== "undefined" && window.location?.origin ? window.location.origin : "";
  const fontFace = origin
    ? `@font-face{font-family:'IBM Plex Sans Arabic';src:url('${origin}/fonts/ibm-plex/IBMPlexSansArabic-Regular.woff2') format('woff2');font-weight:400;font-style:normal;}
@font-face{font-family:'IBM Plex Sans Arabic';src:url('${origin}/fonts/ibm-plex/IBMPlexSansArabic-Bold.woff2') format('woff2');font-weight:700;font-style:normal;}`
    : "";

  const toc = chapters
    .map((chapter, index) => `<li><a href="#ch-${index + 1}">${escapeHtml(chapter.label)}</a></li>`)
    .join("");
  const pages = chapters
    .map(
      (chapter, index) =>
        `<section id="ch-${index + 1}" class="chapter">
          <div class="chapter-meta">${escapeHtml(title)} · ${(index + 1).toLocaleString("ar-EG")} / ${chapters.length.toLocaleString("ar-EG")}</div>
          ${chapter.blocks.map(blockToHtml).join("\n")}
        </section>`,
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${escapeHtml(title)} — صحوة</title>
<style>
${fontFace}
:root{--primary:#752026;--dark:#350e15;--gold:#d6ad63;--bg:#f8f3ee;--paper:#fffcf8;--line:#dccdc7;}
*{box-sizing:border-box;}
body{margin:0;padding:28px 18px;background:var(--bg);color:var(--dark);font-family:'IBM Plex Sans Arabic',system-ui,-apple-system,sans-serif;line-height:2;font-size:15px;}
.cover,.chapter{max-width:780px;margin:0 auto 24px;padding:36px 40px;background:var(--paper);border:1px solid var(--line);border-inline-start:5px solid var(--primary);border-radius:16px;}
.cover{text-align:center;border-inline-start:1px solid var(--line);border-top:5px solid var(--primary);}
.cover h1{margin:0 0 10px;color:var(--primary);font-size:30px;line-height:1.5;}
.cover-bar{width:56px;height:3px;background:var(--gold);margin:14px auto 22px;border-radius:99px;}
.toc{text-align:right;margin:20px auto 0;max-width:460px;padding:0 22px 0 0;}
.toc li{margin:6px 0;}
.toc a{color:var(--primary);text-decoration:none;font-weight:600;}
.chapter-meta{margin:0 0 18px;padding-bottom:10px;border-bottom:1px solid var(--line);color:#765c5e;font-size:12px;}
h3{margin:24px 0 10px;padding-inline-start:12px;border-inline-start:3px solid var(--gold);color:var(--primary);font-size:18px;line-height:1.65;}
h3:first-of-type{margin-top:0;}
p{margin:8px 0 14px;}
ul,ol{margin:8px 0 16px;padding-inline-start:24px;}
li+li{margin-top:5px;}
li::marker{color:var(--primary);}
table{width:100%;border-collapse:collapse;margin:18px 0;font-size:13px;}
th,td{padding:10px 12px;border:1px solid var(--line);text-align:right;vertical-align:top;}
th{background:#d6ad6320;color:var(--primary);}
@page{size:A4;margin:16mm;}
@media print{
  body{background:#fff;padding:0;font-size:13px;line-height:1.85;}
  .cover,.chapter{max-width:none;margin:0;padding:10px 0 0;border:0;border-radius:0;break-after:page;}
  .chapter:last-child{break-after:auto;}
  .toc a{color:var(--dark);}
}
</style>
</head>
<body>
<header class="cover">
  <h1>${escapeHtml(title)}</h1>
  <div class="cover-bar"></div>
  <ol class="toc">${toc}</ol>
</header>
${pages}
</body>
</html>`;
}

export default function GuideBooklet({
  title,
  filename,
  chapters,
  initialChapterId,
}: {
  title: string;
  filename: string;
  chapters: StructureChapter[];
  initialChapterId?: string;
}) {
  const initialIndex = Math.max(
    0,
    initialChapterId ? chapters.findIndex((c) => c.id === initialChapterId) : 0,
  );
  const [pageIndex, setPageIndex] = useState(initialIndex);
  const [tocOpen, setTocOpen] = useState(false);
  const bookletRef = useRef<HTMLDivElement>(null);
  const panelsRef = useRef<HTMLDivElement>(null);

  const safeIndex = Math.min(pageIndex, Math.max(0, chapters.length - 1));
  const current = chapters[safeIndex];

  const goTo = useCallback(
    (nextIndex: number, scrollTop = true) => {
      const clamped = Math.max(0, Math.min(nextIndex, chapters.length - 1));
      setPageIndex(clamped);
      setTocOpen(false);
      if (scrollTop) {
        bookletRef.current?.scrollIntoView?.({ block: "nearest", behavior: "smooth" });
      }
    },
    [chapters.length],
  );

  useEffect(() => {
    const container = panelsRef.current;
    if (!container || !current) return;
    for (const panel of container.querySelectorAll<HTMLElement>("[data-booklet-chapter]")) {
      if (panel.dataset.bookletChapter === current.id) panel.removeAttribute("hidden");
      else panel.setAttribute("hidden", "until-found");
    }
  }, [current]);

  useEffect(() => {
    const container = panelsRef.current;
    if (!container) return;
    const onBeforeMatch = (event: Event) => {
      const panel = (event.target as HTMLElement | null)?.closest?.<HTMLElement>(
        "[data-booklet-chapter]",
      );
      const id = panel?.dataset.bookletChapter;
      if (!id) return;
      const found = chapters.findIndex((chapter) => chapter.id === id);
      if (found >= 0) setPageIndex(found);
    };
    container.addEventListener("beforematch", onBeforeMatch);
    return () => container.removeEventListener("beforematch", onBeforeMatch);
  }, [chapters]);

  function onBookKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.target instanceof HTMLElement && ["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName)) {
      return;
    }
    // In RTL books, ArrowLeft advances to the next page and ArrowRight goes back.
    if (event.key === "ArrowLeft" && safeIndex < chapters.length - 1) {
      event.preventDefault();
      goTo(safeIndex + 1, false);
    } else if (event.key === "ArrowRight" && safeIndex > 0) {
      event.preventDefault();
      goTo(safeIndex - 1, false);
    }
  }

  function handlePrint() {
    if (typeof document === "undefined") return;
    const html = buildBookletHtml(title, chapters);
    const frame = document.createElement("iframe");
    frame.setAttribute("aria-hidden", "true");
    frame.style.position = "fixed";
    frame.style.inset = "0";
    frame.style.width = "0";
    frame.style.height = "0";
    frame.style.border = "0";
    document.body.appendChild(frame);

    const cleanup = () => {
      frame.remove();
    };
    const doc = frame.contentDocument;
    const win = frame.contentWindow;
    if (!doc || !win) {
      cleanup();
      return;
    }
    doc.open();
    doc.write(html);
    doc.close();

    const triggerPrint = () => {
      win.addEventListener("afterprint", cleanup, { once: true });
      win.focus();
      win.print();
      window.setTimeout(cleanup, 60000);
    };
    if (doc.fonts?.ready) {
      void doc.fonts.ready.then(triggerPrint);
    } else {
      window.setTimeout(triggerPrint, 120);
    }
  }

  function handleDownload() {
    if (typeof document === "undefined" || typeof URL === "undefined") return;
    const html = buildBookletHtml(title, chapters);
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.html`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  if (!current) return null;

  return (
    <div
      ref={bookletRef}
      className="guide-booklet"
      data-guide-booklet={filename}
      onKeyDown={onBookKeyDown}
    >
      <div className="guide-booklet-toolbar">
        <div className="guide-booklet-title-wrap">
          <span className="guide-booklet-icon" aria-hidden="true">
            <BookOpen size={20} />
          </span>
          <div>
            <strong>{title}</strong>
            <span>
              صفحة {(safeIndex + 1).toLocaleString("ar-EG")} من{" "}
              {chapters.length.toLocaleString("ar-EG")}
            </span>
          </div>
        </div>
        <div className="guide-booklet-actions">
          <button
            type="button"
            className="guide-booklet-action"
            aria-expanded={tocOpen}
            onClick={() => setTocOpen((open) => !open)}
          >
            <List size={16} aria-hidden="true" />
            <span>فهرس الفصول</span>
            <ChevronDown
              size={15}
              aria-hidden="true"
              className={tocOpen ? "guide-booklet-chevron-open" : undefined}
            />
          </button>
          <button
            type="button"
            className="guide-booklet-action"
            onClick={handlePrint}
          >
            <Printer size={16} aria-hidden="true" />
            <span>طباعة / PDF</span>
          </button>
          <button
            type="button"
            className="guide-booklet-action guide-booklet-action-primary"
            onClick={handleDownload}
          >
            <Download size={16} aria-hidden="true" />
            <span>تحميل الكتيب</span>
          </button>
        </div>
      </div>

      {tocOpen && (
        <nav className="guide-booklet-toc" aria-label={`فهرس ${title}`}>
          {chapters.map((chapter, index) => (
            <button
              key={chapter.id}
              type="button"
              className={`guide-booklet-toc-item${index === safeIndex ? " guide-booklet-toc-active" : ""}`}
              aria-current={index === safeIndex ? "page" : undefined}
              onClick={() => goTo(index)}
            >
              <span className="guide-booklet-toc-num">
                {(index + 1).toLocaleString("ar-EG")}
              </span>
              <span>{chapter.label}</span>
            </button>
          ))}
        </nav>
      )}

      <div className="guide-booklet-shell">
        <div className="guide-booklet-page-head">
          <span className="guide-booklet-running-chapter">{current.label}</span>
          <span className="guide-booklet-running-num">
            {(safeIndex + 1).toLocaleString("ar-EG")} /{" "}
            {chapters.length.toLocaleString("ar-EG")}
          </span>
        </div>

        <div ref={panelsRef} className="guide-booklet-pages">
          {chapters.map((chapter, index) => {
            const active = index === safeIndex;
            return (
              <div
                key={chapter.id}
                data-booklet-chapter={chapter.id}
                hidden={active ? undefined : ("until-found" as unknown as boolean)}
                className="guide-booklet-panel"
              >
                <article className="guide-booklet-sheet">
                  <GuideGovernanceBlocks blocks={chapter.blocks} />
                </article>
              </div>
            );
          })}
        </div>

        <nav className="guide-booklet-pager" aria-label="التنقل بين صفحات الكتيب">
          <button
            type="button"
            className="guide-booklet-nav-btn"
            disabled={safeIndex <= 0}
            onClick={() => goTo(safeIndex - 1)}
          >
            <ChevronRight size={17} aria-hidden="true" />
            <span>الصفحة السابقة</span>
          </button>

          <div className="guide-booklet-dots" role="tablist" aria-label="صفحات الكتيب">
            {chapters.map((chapter, index) => (
              <button
                key={chapter.id}
                type="button"
                role="tab"
                aria-selected={index === safeIndex}
                aria-label={`${chapter.label} (${index + 1})`}
                className="guide-booklet-dot"
                onClick={() => goTo(index)}
              >
                {(index + 1).toLocaleString("ar-EG")}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="guide-booklet-nav-btn"
            disabled={safeIndex >= chapters.length - 1}
            onClick={() => goTo(safeIndex + 1)}
          >
            <span>الصفحة التالية</span>
            <ChevronLeft size={17} aria-hidden="true" />
          </button>
        </nav>
      </div>
    </div>
  );
}
