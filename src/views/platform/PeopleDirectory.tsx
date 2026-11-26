"use client";

import { useMemo, useState } from "react";
import { Search, UserRound, ExternalLink } from "lucide-react";
import Link from "next/link";
import PageHeading from "../../components/shared/PageIdentity";
import { normalizeSearch } from "../../../shared/team-options.js";

interface Card {
  id: string; name: string; university: string; major: string; bio: string; skills: string; work: string;
  roles: { title: string; scope: string; team: string }[]; profileUrl: string;
}
interface Group { id: string; title: string; teamTitle: string; scope: string; people: Card[]; managerIds: string[]; canManage: boolean }
interface Data { all: Card[]; university: Card[]; team: Card[]; groups: Group[] }

const TABS = [
  { id: "team", label: "فريقي" },
  { id: "university", label: "جامعتي" },
  { id: "all", label: "أهل صحوة" },
] as const;

function PersonCard({ c, manager = false }: { c: Card; manager?: boolean }) {
  return (<article  className="platform-card">
              <div className="flex items-start gap-3">
                <span className="team-avatar"><UserRound size={22} aria-hidden="true" /></span>
                <div className="min-w-0">
                  <h3 className="font-heading">{c.name}</h3>{manager && <span className="platform-chip">المسؤول المباشر</span>}
                  <p className="platform-muted">{[c.university, c.major, c.work].filter(Boolean).join(" — ")}</p>
                </div>
              </div>
              {c.roles.length > 0 && (
                <div className="platform-chips mt-3">{c.roles.map((r, i) => <span key={i} className="platform-chip" title={r.scope}>{r.title}</span>)}</div>
              )}
              {c.bio && <p className="mt-3">{c.bio}</p>}
              {c.skills && <p className="platform-muted mt-1">المهارات: {c.skills}</p>}
              {c.profileUrl && <a className="team-text-button mt-2" href={c.profileUrl} target="_blank" rel="noopener noreferrer">الصفحة الشخصية <ExternalLink size={14} aria-hidden="true" /></a>}
            </article>);
}

export default function PeopleDirectory({ data, policy }: { data: Data; policy: string }) {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>(data.groups.length ? "team" : data.university.length ? "university" : "all");
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
      {tab === "team" && data.groups.length ? data.groups.map((g) => {
        const members = g.people.filter((p) => list.some((c) => c.id === p.id));
        return <section key={g.id} className="mb-5"><div className="platform-row">
          <h2 className="platform-section-title font-heading">{g.teamTitle} · {g.scope} <small>{g.title}</small></h2>
          {g.canManage && <Link className="team-text-button" href={`/team/volunteers?assignment=${g.id}`}>إدارة الفريق</Link>}
        </div>
        {members.length ? <div className="team-people-grid">{members.map((c) => <PersonCard key={c.id} c={c} manager={g.managerIds.includes(c.id)} />)}</div> : <p className="platform-muted">لا يوجد أعضاء مطابقون.</p>}
        </section>;
      }) : list.length ? (
        <div className="team-people-grid">
          {list.map((c) => (
            <PersonCard key={c.id} c={c} />
          ))}
        </div>
      ) : (
        <p className="platform-empty">{tab === "team" ? "لا يوجد زملاء فرق مسجلون لك بعد. يظهر هنا أعضاء الفرق التي تحمل فيها دورًا." : "لا توجد نتائج مطابقة."}</p>
      )}
    </>
  );
}
