"use client";

import { useMemo, useState } from "react";
import { Search, UserRound, ExternalLink } from "lucide-react";
import PageHeading from "../../components/shared/PageIdentity";
import { normalizeSearch } from "../../../shared/team-options.js";

interface Card {
  id: string; name: string; university: string; major: string; bio: string; skills: string; work: string;
  roles: { title: string; scope: string; team: string }[]; profileUrl: string;
}
interface Data { all: Card[]; university: Card[]; team: Card[] }

const TABS = [
  { id: "all", label: "أهل صحوة" },
  { id: "university", label: "جامعتي" },
  { id: "team", label: "فريقي" },
] as const;

export default function PeopleDirectory({ data, policy }: { data: Data; policy: string }) {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("all");
  const [query, setQuery] = useState("");
  const list = useMemo(() => {
    const q = normalizeSearch(query);
    return data[tab].filter((c) => !q || normalizeSearch([c.name, c.university, c.major, c.skills, ...c.roles.map((r) => `${r.title} ${r.team}`)].join(" ")).includes(q));
  }, [data, tab, query]);
  return (
    <>
      <PageHeading title="فريق صحوة" description="تعرّف على أهل صحوة في جامعتك وفرقك وعبر الجامعات." />
      <div className="platform-row mb-4">
        <div className="platform-tabs" role="tablist" aria-label="نطاق الدليل">
          {TABS.map((t) => (
            <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}>
              {t.label} <span className="opacity-70">({data[t.id].length.toLocaleString("ar-EG")})</span>
            </button>
          ))}
        </div>
        <label className="team-search" style={{ maxWidth: 360 }}>
          <span className="sr-only">ابحث في الدليل</span>
          <Search size={18} aria-hidden="true" />
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ابحث بالاسم أو الجامعة أو الفريق أو المهارة…" maxLength={80} />
        </label>
      </div>
      <p className="platform-muted mb-4">
        يعرض الدليل الاسم والجامعة والأدوار، وما اختار كل شخص مشاركته من ملفه فقط. لا تظهر أرقام الهواتف أو البيانات الإدارية.
        {policy === "leads" && " يظهر من القطاع الآخر شاغلو المناصب الرسمية اللازمة للتنسيق فقط."}
        {policy === "none" && " لا يظهر القطاع الآخر إلا لزملاء الفرق المشتركة."}
      </p>
      {list.length ? (
        <div className="team-people-grid">
          {list.map((c) => (
            <article key={c.id} className="platform-card">
              <div className="flex items-start gap-3">
                <span className="team-avatar"><UserRound size={22} aria-hidden="true" /></span>
                <div className="min-w-0">
                  <h3 className="font-heading">{c.name}</h3>
                  <p className="platform-muted">{[c.university, c.major, c.work].filter(Boolean).join(" — ")}</p>
                </div>
              </div>
              {c.roles.length > 0 && (
                <div className="platform-chips mt-3">{c.roles.map((r, i) => <span key={i} className="platform-chip" title={r.scope}>{r.title}</span>)}</div>
              )}
              {c.bio && <p className="mt-3">{c.bio}</p>}
              {c.skills && <p className="platform-muted mt-1">المهارات: {c.skills}</p>}
              {c.profileUrl && <a className="team-text-button mt-2" href={c.profileUrl} target="_blank" rel="noopener noreferrer">الصفحة الشخصية <ExternalLink size={14} aria-hidden="true" /></a>}
            </article>
          ))}
        </div>
      ) : (
        <p className="platform-empty">{tab === "team" ? "لا يوجد زملاء فرق مسجلون لك بعد. يظهر هنا أعضاء الفرق التي تحمل فيها دورًا." : "لا توجد نتائج مطابقة."}</p>
      )}
    </>
  );
}
