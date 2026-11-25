"use client";

import { useEffect, useState, type KeyboardEvent } from "react";
import { BookOpen, ChevronDown, Network, ScrollText } from "lucide-react";
import PageHeading from "../shared/PageIdentity";
import GuideText from "./GuideText";

interface Book {
  title: string;
  body: string;
}

const tabs = [
  { id: "guide-identity", range: "الباب الأول", icon: BookOpen },
  { id: "guide-structure", range: "الباب الثاني", icon: Network },
  { id: "guide-policies", range: "من الباب الثالث إلى السابع", icon: ScrollText },
] as const;

function tabForHash(hash: string) {
  if (hash === "#guide-structure") return 1;
  if (hash === "#guide-policies") return 2;
  return 0;
}

export default function GuideTabs({ books, identity }: { books: Book[]; identity: string }) {
  const [active, setActive] = useState(0);
  useEffect(() => {
    function sync() {
      setActive(tabForHash(window.location.hash));
    }
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  useEffect(() => {
    const hash = window.location.hash;
    if (active === 0 && hash.startsWith("#guide-identity-")) {
      document.getElementById(hash.slice(1))?.scrollIntoView?.({ block: "start" });
    }
  }, [active]);

  function choose(index: number) {
    setActive(index);
    window.history.replaceState(window.history.state, "", `#${tabs[index].id}`);
  }

  function navigate(event: KeyboardEvent<HTMLDivElement>) {
    let next: number;
    switch (event.key) {
      case "ArrowLeft": next = (active + 1) % tabs.length; break;
      case "ArrowRight": next = (active + tabs.length - 1) % tabs.length; break;
      case "Home": next = 0; break;
      case "End": next = tabs.length - 1; break;
      default: return;
    }
    event.preventDefault();
    choose(next);
    document.getElementById(`tab-${tabs[next].id}`)?.focus();
  }

  return (
    <>
      <PageHeading title="لائحة صحوة" />
      <div className="guide-chapter-grid guide-book-tabs" role="tablist" aria-label="أبواب لائحة صحوة" onKeyDown={navigate}>
        {tabs.map(({ id, range, icon: Icon }, index) => (
          <button
            key={id}
            id={`tab-${id}`}
            type="button"
            role="tab"
            aria-selected={active === index}
            aria-controls={id}
            tabIndex={active === index ? 0 : -1}
            className={`guide-chapter-card guide-chapter-card-active${active === index ? " guide-chapter-card-selected" : ""}`}
            onClick={() => choose(index)}
          >
            <span className="guide-chapter-top"><span>{range}</span><Icon size={20} aria-hidden="true" /></span>
            <span className="guide-chapter-title">
              {index < 2 ? books[index].title.replace(/^[^:]+: /, "") : "الميثاق والقيم والسياسات والإجراءات"}
            </span>
          </button>
        ))}
      </div>
      {tabs.map(({ id }, index) => (
        <section key={id} id={id} role="tabpanel" aria-labelledby={`tab-${id}`} hidden={active !== index}
          tabIndex={0} className="guide-chapter-panel guide-reading-panel">
          {active === index && (index < 2 ? (
            <>
              <article className="guide-reading-sheet" data-book={index + 1}>
                <h2 className="font-heading">{books[index].title}</h2>
                <GuideText source={books[index].body} />
              </article>
              {index === 0 && (
                <article id="guide-identity-details" className="guide-reading-sheet" data-identity>
                  <GuideText source={identity} identity />
                </article>
              )}
            </>
          ) : books.slice(2).map((book, i) => (
            <details key={book.title} className="guide-reading-sheet guide-reading-book" data-book={i + 3} open={i === 0}>
              <summary><span className="font-heading">{book.title}</span><ChevronDown size={20} aria-hidden="true" /></summary>
              <GuideText source={book.body} />
            </details>
          )))}
        </section>
      ))}
    </>
  );
}
