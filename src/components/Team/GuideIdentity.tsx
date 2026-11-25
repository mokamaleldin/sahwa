"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import {
  BookOpen,
  Compass,
  Globe2,
  GraduationCap,
  Heart,
  Leaf,
  Lightbulb,
  Megaphone,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

type Block =
  | { kind: "heading"; level: number; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "list"; items: string[] };

interface SubSection {
  title: string;
  blocks: Block[];
}

interface Chapter {
  key: string;
  label: string;
  sections: SubSection[];
}

const CHAPTER_KEYS = ["about", "vision", "audience", "principles", "fields"] as const;

const SECTION_ANCHORS: Record<string, string> = {
  "أولًا: من نحن؟": "guide-identity-about",
  "ثانيًا: كيف بدأت صحوة؟": "guide-identity-story",
  "أولًا: رؤيتنا": "guide-identity-vision",
  "ثالثًا: أهدافنا الأربعة": "guide-identity-goals",
  "أولًا: من نستهدف؟": "guide-identity-audience",
  "ثالثًا: مستويات العلاقة بصحوة": "guide-identity-community",
  "ثانيًا: مبادئنا العامة": "guide-identity-principles",
  "أولًا: منهجنا في اختيار الأنشطة": "guide-identity-fields",
};

const HASH_TO_CHAPTER: Record<string, string> = {
  "#guide-identity": "about",
  "#guide-identity-details": "about",
  "#guide-identity-about": "about",
  "#guide-identity-story": "about",
  "#guide-identity-vision": "vision",
  "#guide-identity-goals": "vision",
  "#guide-identity-audience": "audience",
  "#guide-identity-community": "audience",
  "#guide-identity-principles": "principles",
  "#guide-identity-fields": "fields",
};

const GOAL_ICONS = [BookOpen, Heart, Globe2, Compass];
const PRINCIPLE_ICONS = [Sparkles, Heart, Users, ShieldCheck, Lightbulb, GraduationCap, Leaf];
const DOMAIN_ICONS = [BookOpen, Heart, GraduationCap, Compass, Lightbulb, Megaphone];

function inline(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
    part.startsWith("**") && part.endsWith("**")
      ? <strong key={index}>{part.slice(2, -2)}</strong>
      : part,
  );
}

function isPureBold(block: Block | undefined): boolean {
  return (
    block?.kind === "paragraph" &&
    block.text.startsWith("**") &&
    block.text.endsWith("**") &&
    block.text.indexOf("**", 2) === block.text.length - 2
  );
}

function unwrapBold(text: string) {
  return text.slice(2, -2);
}

function parseIdentity(source: string): Chapter[] {
  const rawChapters = source
    .replace(/^[\r\n]+|[\r\n]+$/g, "")
    .split(/\r?\n---\r?\n/);

  return rawChapters.map((rawChapter, index) => {
    const rawBlocks = rawChapter
      .replace(/^[\r\n]+|[\r\n]+$/g, "")
      .split(/\r?\n(?:[ \t]*\r?\n)+/);

    let label = "";
    const sections: SubSection[] = [];
    let current: SubSection | null = null;

    for (const raw of rawBlocks) {
      const heading = /^(#{1,4}) (.+)$/.exec(raw);
      if (heading) {
        const level = heading[1].length;
        const text = heading[2];
        if (level === 2) {
          label = text.replace(/^الفصل\s+[\d.]+\s*—\s*/, "");
          continue;
        }
        if (level === 3) {
          current = { title: text, blocks: [] };
          sections.push(current);
          continue;
        }
        if (current) {
          current.blocks.push({ kind: "heading", level, text });
        }
        continue;
      }
      if (!current) continue;
      if (raw.startsWith("- ")) {
        current.blocks.push({
          kind: "list",
          items: raw.split(/\r?\n/).map((line) => line.slice(2)),
        });
      } else {
        current.blocks.push({ kind: "paragraph", text: raw });
      }
    }

    return {
      key: CHAPTER_KEYS[index] || `section-${index}`,
      label,
      sections,
    };
  });
}

function renderAboutSection(section: SubSection) {
  const paragraphs = section.blocks.filter(
    (block): block is { kind: "paragraph"; text: string } => block.kind === "paragraph",
  );
  return (
    <article
      id={SECTION_ANCHORS[section.title]}
      className="guide-identity-hero"
      aria-labelledby="guide-identity-about-heading"
    >
      <div className="guide-identity-hero-decoration" aria-hidden="true">
        <span /><span /><span />
      </div>
      <div className="guide-identity-hero-content">
        <h3 id="guide-identity-about-heading" className="font-heading">
          {section.title}
        </h3>
        {paragraphs.map((block, index) => {
          const pureBold = isPureBold(block);
          const className =
            index === 0 && pureBold
              ? "guide-identity-hero-meta"
              : pureBold
                ? "guide-identity-hero-callout"
                : undefined;
          return (
            <p key={index} className={className}>
              {inline(block.text)}
            </p>
          );
        })}
      </div>
    </article>
  );
}

function renderStorySection(section: SubSection) {
  const intro: string[] = [];
  let timelineLabel = "";
  const milestones: { when: string; title: string; paragraphs: string[] }[] = [];

  for (const block of section.blocks) {
    if (block.kind !== "paragraph") continue;
    if (isPureBold(block)) {
      const inner = unwrapBold(block.text);
      if (inner.includes(" — ")) {
        const [when, ...rest] = inner.split(" — ");
        milestones.push({ when, title: rest.join(" — "), paragraphs: [] });
      } else if (!timelineLabel) {
        timelineLabel = inner;
      }
    } else if (milestones.length > 0) {
      milestones[milestones.length - 1].paragraphs.push(block.text);
    } else {
      intro.push(block.text);
    }
  }

  return (
    <section
      id={SECTION_ANCHORS[section.title]}
      className="guide-identity-section"
      aria-labelledby="guide-identity-story-heading"
    >
      <div className="guide-identity-heading">
        <h3 id="guide-identity-story-heading" className="font-heading">
          {section.title}
        </h3>
      </div>
      <div className="guide-identity-story-intro">
        {intro.map((text, index) => (
          <p key={index}>{inline(text)}</p>
        ))}
      </div>
      {timelineLabel && (
        <h4 className="guide-identity-timeline-label">{timelineLabel}</h4>
      )}
      <ol className="guide-identity-timeline">
        {milestones.map((milestone, index) => (
          <li key={index}>
            <span className="guide-identity-timeline-point" aria-hidden="true" />
            <article>
              <time>{milestone.when}</time>
              <h5>{milestone.title}</h5>
              {milestone.paragraphs.map((text, pIndex) => (
                <p key={pIndex}>{inline(text)}</p>
              ))}
            </article>
          </li>
        ))}
      </ol>
    </section>
  );
}

function renderVisionMission(vision: SubSection, mission: SubSection) {
  const cards = [
    { section: vision, primary: true },
    { section: mission, primary: false },
  ];
  return (
    <div id={SECTION_ANCHORS[vision.title]} className="guide-identity-vision-grid">
      {cards.map(({ section, primary }) => (
        <article
          key={section.title}
          className={`guide-identity-vision-card${primary ? " guide-identity-vision-card-primary" : ""}`}
        >
          <h3 className="font-heading">{section.title}</h3>
          {section.blocks.map((block, index) =>
            block.kind === "paragraph" ? (
              <p
                key={index}
                className={index === 0 && isPureBold(block) ? "guide-identity-vision-lead" : undefined}
              >
                {inline(block.text)}
              </p>
            ) : null,
          )}
        </article>
      ))}
    </div>
  );
}

function renderGoalsSection(section: SubSection) {
  const intro: string[] = [];
  const goals: { number: string; title: string; paragraphs: { text: string; pureBold: boolean }[] }[] = [];

  for (const block of section.blocks) {
    if (block.kind === "heading") {
      const [number, ...rest] = block.text.split(" — ");
      goals.push({
        number: rest.length ? number : "",
        title: rest.length ? rest.join(" — ") : block.text,
        paragraphs: [],
      });
    } else if (block.kind === "paragraph") {
      if (goals.length === 0) intro.push(block.text);
      else goals[goals.length - 1].paragraphs.push({ text: block.text, pureBold: isPureBold(block) });
    }
  }

  return (
    <section
      id={SECTION_ANCHORS[section.title]}
      className="guide-identity-section"
      aria-labelledby="guide-identity-goals-heading"
    >
      <div className="guide-identity-heading">
        <h3 id="guide-identity-goals-heading" className="font-heading">
          {section.title}
        </h3>
        {intro.map((text, index) => (
          <p key={index}>{inline(text)}</p>
        ))}
      </div>
      <div className="guide-identity-goal-grid">
        {goals.map((goal, index) => {
          const Icon = GOAL_ICONS[index % GOAL_ICONS.length];
          const last = goal.paragraphs.at(-1);
          const hasClosing = Boolean(last?.pureBold);
          const body = hasClosing ? goal.paragraphs.slice(0, -1) : goal.paragraphs;
          return (
            <article className="guide-identity-goal" key={goal.title}>
              <div className="guide-identity-goal-top">
                <span className="guide-identity-goal-icon">
                  <Icon size={24} strokeWidth={1.7} aria-hidden="true" />
                </span>
                {goal.number && (
                  <span className="guide-identity-goal-number">{goal.number}</span>
                )}
              </div>
              <h4>{goal.title}</h4>
              {body.map((paragraph, pIndex) => (
                <p key={pIndex}>{inline(paragraph.text)}</p>
              ))}
              {hasClosing && last && (
                <p className="guide-identity-goal-closing">{inline(last.text)}</p>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

function renderHighlightCard(section: SubSection, headingId: string) {
  return (
    <section
      id={SECTION_ANCHORS[section.title]}
      className="guide-identity-community"
      aria-labelledby={headingId}
    >
      <div className="guide-identity-community-body">
        <h3 id={headingId} className="font-heading">
          {section.title}
        </h3>
        {section.blocks.map((block, index) =>
          block.kind === "paragraph" ? (
            <p key={index}>{inline(block.text)}</p>
          ) : null,
        )}
      </div>
    </section>
  );
}

function renderPrioritiesSection(section: SubSection) {
  const cards: { badge: string; title: string; paragraphs: string[] }[] = [];
  const notes: string[] = [];

  for (const block of section.blocks) {
    if (block.kind !== "paragraph") continue;
    if (isPureBold(block) && block.text.includes(" — ")) {
      const [badge, ...rest] = unwrapBold(block.text).split(" — ");
      cards.push({ badge, title: rest.join(" — "), paragraphs: [] });
    } else if (block.text.startsWith("**")) {
      notes.push(block.text);
    } else if (cards.length > 0) {
      cards[cards.length - 1].paragraphs.push(block.text);
    } else {
      notes.push(block.text);
    }
  }

  return (
    <section
      className="guide-identity-section"
      aria-labelledby="guide-identity-priorities-heading"
    >
      <div className="guide-identity-heading">
        <h3 id="guide-identity-priorities-heading" className="font-heading">
          {section.title}
        </h3>
      </div>
      <div className="guide-identity-priorities-grid">
        {cards.map((card, index) => (
          <article className="guide-identity-priority-card" key={index}>
            <span className="guide-identity-badge">{card.badge}</span>
            <h4>{card.title}</h4>
            {card.paragraphs.map((text, pIndex) => (
              <p key={pIndex}>{inline(text)}</p>
            ))}
          </article>
        ))}
      </div>
      {notes.map((text, index) => (
        <p key={index} className="guide-identity-callout">
          {inline(text)}
        </p>
      ))}
    </section>
  );
}

function renderLevelsSection(section: SubSection) {
  const intro: string[] = [];
  const levels: { number: string; title: string; paragraphs: string[] }[] = [];
  let footerNote = "";

  for (let i = 0; i < section.blocks.length; i += 1) {
    const block = section.blocks[i];
    if (block.kind !== "paragraph") continue;
    if (isPureBold(block)) {
      const inner = unwrapBold(block.text);
      const numbered = /^(\d+)\.\s*(.+)$/.exec(inner);
      if (numbered) {
        levels.push({ number: numbered[1], title: numbered[2], paragraphs: [] });
        continue;
      }
    }
    if (levels.length === 0) {
      intro.push(block.text);
    } else if (i === section.blocks.length - 1 && block.text.includes("الباب الرابع")) {
      footerNote = block.text;
    } else {
      levels[levels.length - 1].paragraphs.push(block.text);
    }
  }

  return (
    <section
      id={SECTION_ANCHORS[section.title]}
      className="guide-identity-section"
      aria-labelledby="guide-identity-levels-heading"
    >
      <div className="guide-identity-heading">
        <h3 id="guide-identity-levels-heading" className="font-heading">
          {section.title}
        </h3>
        {intro.map((text, index) => (
          <p key={index}>{inline(text)}</p>
        ))}
      </div>
      <ol className="guide-identity-levels">
        {levels.map((level) => (
          <li key={level.number} className="guide-identity-level-card">
            <span className="guide-identity-level-num">{level.number}</span>
            <div className="guide-identity-level-body">
              <h4>{level.title}</h4>
              {level.paragraphs.map((text, pIndex) => (
                <p key={pIndex}>{inline(text)}</p>
              ))}
            </div>
          </li>
        ))}
      </ol>
      {footerNote && <p className="guide-identity-callout">{inline(footerNote)}</p>}
    </section>
  );
}

function renderPrinciplesSection(section: SubSection) {
  const principles: { name: string; detail: string }[] = [];
  for (const block of section.blocks) {
    if (block.kind !== "paragraph") continue;
    if (isPureBold(block)) {
      principles.push({ name: unwrapBold(block.text), detail: "" });
    } else if (principles.length > 0) {
      const last = principles[principles.length - 1];
      last.detail = last.detail ? `${last.detail} ${block.text}` : block.text;
    }
  }

  return (
    <section
      id={SECTION_ANCHORS[section.title]}
      className="guide-identity-section"
      aria-labelledby="guide-identity-principles-heading"
    >
      <div className="guide-identity-heading">
        <h3 id="guide-identity-principles-heading" className="font-heading">
          {section.title}
        </h3>
      </div>
      <div className="guide-identity-principles">
        {principles.map((principle, index) => {
          const Icon = PRINCIPLE_ICONS[index % PRINCIPLE_ICONS.length];
          return (
            <article key={principle.name} className="guide-identity-principle">
              <span className="guide-identity-principle-icon">
                <Icon size={20} strokeWidth={1.8} aria-hidden="true" />
              </span>
              <div>
                <h4>{principle.name}</h4>
                <p>{inline(principle.detail)}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function renderConstantsSection(section: SubSection) {
  const items = section.blocks.filter(
    (block): block is { kind: "paragraph"; text: string } => block.kind === "paragraph",
  );
  return (
    <section
      className="guide-identity-section"
      aria-labelledby="guide-identity-constants-heading"
    >
      <div className="guide-identity-heading">
        <h3 id="guide-identity-constants-heading" className="font-heading">
          {section.title}
        </h3>
      </div>
      <div className="guide-identity-split-grid">
        {items.map((block, index) => {
          const match = /^\*\*([^*]+)\*\*\s*(.+)$/.exec(block.text);
          return (
            <article
              key={index}
              className={`guide-identity-split-card${index === 0 ? " guide-identity-split-card-primary" : ""}`}
            >
              {match ? (
                <>
                  <h4>{match[1]}</h4>
                  <p>{inline(match[2])}</p>
                </>
              ) : (
                <p>{inline(block.text)}</p>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

function renderDomainsSection(section: SubSection) {
  const domains: { number: string; title: string; items: string[] }[] = [];
  for (const block of section.blocks) {
    if (block.kind === "paragraph" && isPureBold(block)) {
      const inner = unwrapBold(block.text);
      const numbered = /^(\d+)\.\s*(.+)$/.exec(inner);
      domains.push({
        number: numbered ? numbered[1] : "",
        title: numbered ? numbered[2] : inner,
        items: [],
      });
    } else if (block.kind === "list" && domains.length > 0) {
      domains[domains.length - 1].items.push(...block.items);
    }
  }

  return (
    <section
      className="guide-identity-section"
      aria-labelledby="guide-identity-domains-heading"
    >
      <div className="guide-identity-heading">
        <h3 id="guide-identity-domains-heading" className="font-heading">
          {section.title}
        </h3>
      </div>
      <div className="guide-identity-domains-grid">
        {domains.map((domain, index) => {
          const Icon = DOMAIN_ICONS[index % DOMAIN_ICONS.length];
          return (
            <article key={domain.title} className="guide-identity-domain-card">
              <div className="guide-identity-domain-head">
                <span className="guide-identity-principle-icon">
                  <Icon size={19} strokeWidth={1.8} aria-hidden="true" />
                </span>
                {domain.number && (
                  <span className="guide-identity-domain-num">{domain.number}</span>
                )}
              </div>
              <h4>{domain.title}</h4>
              <ul>
                {domain.items.map((item, itemIndex) => (
                  <li key={itemIndex}>{inline(item)}</li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function renderCriteriaSection(section: SubSection) {
  const intro: string[] = [];
  const listItems: string[] = [];
  const closing: string[] = [];

  for (const block of section.blocks) {
    if (block.kind === "list") {
      listItems.push(...block.items);
    } else if (block.kind === "paragraph") {
      if (listItems.length === 0) intro.push(block.text);
      else closing.push(block.text);
    }
  }

  return (
    <section
      className="guide-identity-section"
      aria-labelledby="guide-identity-criteria-heading"
    >
      <div className="guide-identity-heading">
        <h3 id="guide-identity-criteria-heading" className="font-heading">
          {section.title}
        </h3>
        {intro.map((text, index) => (
          <p key={index}>{inline(text)}</p>
        ))}
      </div>
      <div className="guide-identity-criteria-card">
        <ul className="guide-identity-criteria-list">
          {listItems.map((item, index) => (
            <li key={index}>{inline(item)}</li>
          ))}
        </ul>
      </div>
      {closing.map((text, index) => (
        <p key={index} className="guide-identity-callout">
          {inline(text)}
        </p>
      ))}
    </section>
  );
}

function renderChapterBody(chapter: Chapter) {
  if (chapter.key === "about") {
    return (
      <>
        {chapter.sections[0] && renderAboutSection(chapter.sections[0])}
        {chapter.sections[1] && renderStorySection(chapter.sections[1])}
      </>
    );
  }
  if (chapter.key === "vision") {
    return (
      <>
        {chapter.sections[0] && chapter.sections[1] && renderVisionMission(chapter.sections[0], chapter.sections[1])}
        {chapter.sections[2] && renderGoalsSection(chapter.sections[2])}
      </>
    );
  }
  if (chapter.key === "audience") {
    return (
      <>
        {chapter.sections[0] && renderHighlightCard(chapter.sections[0], "guide-identity-audience-heading")}
        {chapter.sections[1] && renderPrioritiesSection(chapter.sections[1])}
        {chapter.sections[2] && renderLevelsSection(chapter.sections[2])}
      </>
    );
  }
  if (chapter.key === "principles") {
    return (
      <>
        {chapter.sections[0] && renderHighlightCard(chapter.sections[0], "guide-identity-reference-heading")}
        {chapter.sections[1] && renderPrinciplesSection(chapter.sections[1])}
        {chapter.sections[2] && renderConstantsSection(chapter.sections[2])}
      </>
    );
  }
  if (chapter.key === "fields") {
    return (
      <>
        {chapter.sections[0] && renderHighlightCard(chapter.sections[0], "guide-identity-approach-heading")}
        {chapter.sections[1] && renderDomainsSection(chapter.sections[1])}
        {chapter.sections[2] && renderCriteriaSection(chapter.sections[2])}
      </>
    );
  }
  return null;
}

export default function GuideIdentity({ source }: { source: string }) {
  const chapters = useMemo(() => parseIdentity(source), [source]);
  const [activeKey, setActiveKey] = useState<string>(chapters[0]?.key || "about");
  const panelsRef = useRef<HTMLDivElement>(null);

  const revealTab = useCallback((key: string, updateHash = false) => {
    setActiveKey(key);
    if (updateHash && typeof window !== "undefined") {
      const hash = key === "about" ? "#guide-identity" : `#guide-identity-${key}`;
      window.history.replaceState(
        window.history.state,
        "",
        window.location.pathname + window.location.search + hash,
      );
    }
    document.getElementById(`guide-identity-tab-${key}`)?.scrollIntoView?.({
      block: "nearest",
      inline: "nearest",
    });
  }, []);

  useEffect(() => {
    const syncFromHash = () => {
      const hash = window.location.hash;
      const target = HASH_TO_CHAPTER[hash];
      if (!target) return;
      setActiveKey(target);
      if (hash !== "#guide-identity" && hash !== "#guide-identity-details") {
        const scroll = () => {
          document.getElementById(hash.slice(1))?.scrollIntoView?.({ block: "start" });
        };
        if (typeof window.requestAnimationFrame === "function") {
          window.requestAnimationFrame(scroll);
        } else {
          scroll();
        }
      }
    };
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  useEffect(() => {
    const container = panelsRef.current;
    if (!container) return;
    for (const panel of container.querySelectorAll<HTMLElement>("[data-chapter-key]")) {
      if (panel.dataset.chapterKey === activeKey) panel.removeAttribute("hidden");
      else panel.setAttribute("hidden", "until-found");
    }
  }, [activeKey]);

  useEffect(() => {
    const container = panelsRef.current;
    if (!container) return;
    const onBeforeMatch = (event: Event) => {
      const panel = (event.target as HTMLElement | null)?.closest?.<HTMLElement>("[data-chapter-key]");
      const key = panel?.dataset.chapterKey;
      if (key) revealTab(key, false);
    };
    container.addEventListener("beforematch", onBeforeMatch);
    return () => container.removeEventListener("beforematch", onBeforeMatch);
  }, [revealTab]);

  function onTabListKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const currentIndex = chapters.findIndex((chapter) => chapter.key === activeKey);
    const nextIndex =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? chapters.length - 1
          : (currentIndex + (event.key === "ArrowLeft" ? 1 : -1) + chapters.length) % chapters.length;
    const next = chapters[nextIndex].key;
    revealTab(next, true);
    document.getElementById(`guide-identity-tab-${next}`)?.focus();
  }

  return (
    <section
      id="guide-identity-details"
      className="guide-identity"
      data-identity=""
      aria-label="الهوية والنظام الأساسي والمرجعية"
    >
      <div
        className="guide-identity-nav"
        role="tablist"
        aria-label="أقسام الهوية والنظام الأساسي والمرجعية"
        onKeyDown={onTabListKeyDown}
      >
        {chapters.map((chapter) => {
          const selected = chapter.key === activeKey;
          return (
            <button
              key={chapter.key}
              type="button"
              id={`guide-identity-tab-${chapter.key}`}
              role="tab"
              aria-selected={selected}
              tabIndex={selected ? 0 : -1}
              className="guide-identity-tab"
              onClick={() => revealTab(chapter.key, true)}
            >
              {chapter.label}
            </button>
          );
        })}
      </div>
      <div ref={panelsRef} className="guide-identity-panels">
        {chapters.map((chapter) => {
          const selected = chapter.key === activeKey;
          return (
            <div
              key={chapter.key}
              id={`guide-identity-panel-${chapter.key}`}
              data-chapter-key={chapter.key}
              role="tabpanel"
              tabIndex={selected ? 0 : undefined}
              aria-labelledby={`guide-identity-tab-${chapter.key}`}
              hidden={selected ? undefined : ("until-found" as unknown as boolean)}
              className="guide-identity-tabpanel"
            >
              <div className="guide-identity-panel-inner">
                {renderChapterBody(chapter)}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
