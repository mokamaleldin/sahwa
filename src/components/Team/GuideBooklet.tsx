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
import { buildBookletHtml } from "../../lib/bookletHtml";
import type { StructureChapter } from "../../lib/structureParser";

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
