"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Megaphone, Plus, Sparkles, Loader2 } from "lucide-react";
import PageHeading from "../../components/shared/PageIdentity";
import TeamDialog from "../../components/Team/TeamDialog";
import { displayDate, teamRequest } from "../../lib/team";

export interface CommunityPost {
  id: string;
  kind: string;
  title: string;
  body: string;
  skills: string;
  link: string;
  happensOn: string;
  audienceUniversity: string | null;
  audienceSector: string | null;
  authorLabel: string;
  revision: number;
}
export interface CommunityEvent {
  id: string;
  title: string;
  eventDate: string;
  university: string | null;
  sector: string | null;
  responsible: string;
}
export interface CommunityData {
  news: CommunityPost[];
  current: CommunityPost[];
  projects: CommunityPost[];
  achievements: CommunityPost[];
  opportunities?: CommunityPost[];
  upcomingEvents: CommunityEvent[];
  weekEvents: CommunityEvent[];
  canPublish: boolean;
  publishScopes: { university: string | null; sector: string | null }[];
}

const SECTOR: Record<string, string> = { youth: "الشباب", women: "الطالبات" };
const PUBLISH_KINDS: Record<string, string> = {
  news: "مستجدات صحوة (ما نعمل عليه الآن)",
  project: "المشاريع القادمة",
  achievement: "إنجازات الأسبوع",
};
const audienceLabel = (u: string | null, s: string | null) =>
  u || s ? [u || "مركزي", s ? SECTOR[s] : ""].filter(Boolean).join(" — ") : "جميع أهل صحوة";

function PostCard({ p }: { p: CommunityPost }) {
  return (
    <article className="platform-item">
      <div className="platform-row">
        <h4>{p.title}</h4>
        <span className="platform-chip platform-chip-muted">{audienceLabel(p.audienceUniversity, p.audienceSector)}</span>
      </div>
      {p.body && <p>{p.body}</p>}
      <p className="mt-1">
        {[p.happensOn && displayDate(p.happensOn), p.authorLabel && `نشره: ${p.authorLabel}`].filter(Boolean).join(" · ")}
      </p>
      {p.link && (
        <a className="team-text-button" href={p.link} target="_blank" rel="noopener noreferrer">
          رابط التفاصيل
        </a>
      )}
    </article>
  );
}

function EventCard({ e }: { e: CommunityEvent }) {
  return (
    <article className="platform-item">
      <div className="platform-row">
        <h4>{e.title}</h4>
        <span className="platform-chip platform-chip-muted">{audienceLabel(e.university, e.sector)}</span>
      </div>
      <p>{[e.eventDate && displayDate(e.eventDate), e.responsible && `المسؤول: ${e.responsible}`].filter(Boolean).join(" · ")}</p>
    </article>
  );
}

function Publisher({ scopes, onClose }: { scopes: CommunityData["publishScopes"]; onClose: () => void }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [scopeIndex, setScopeIndex] = useState(0);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const scope = scopes[scopeIndex] || { university: null, sector: null };
    setBusy(true);
    setError("");
    try {
      await teamRequest(
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            kind: form.get("kind"),
            title: form.get("title"),
            body: form.get("body"),
            link: form.get("link"),
            happensOn: form.get("happensOn"),
            audienceUniversity: scope.university === "*central*" ? null : scope.university,
            audienceSector: scope.sector,
          }),
        },
        "/api/posts",
      );
      onClose();
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "تعذر النشر.");
      setBusy(false);
    }
  }

  return (
    <TeamDialog title="نشر في أهل صحوة" onClose={onClose} busy={busy}>
      <form className="team-form-body platform-form" onSubmit={submit}>
        <label className="team-field">
          <span>القسم</span>
          <select name="kind" required defaultValue="news">
            {Object.entries(PUBLISH_KINDS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <label className="team-field">
          <span>العنوان</span>
          <input name="title" required maxLength={160} />
        </label>
        <label className="team-field">
          <span>
            التفاصيل <small>اختياري</small>
          </span>
          <textarea name="body" maxLength={2000} />
        </label>
        <label className="team-field">
          <span>
            التاريخ <small>اختياري</small>
          </span>
          <input type="date" name="happensOn" />
        </label>
        <label className="team-field">
          <span>
            رابط <small>اختياري، https فقط</small>
          </span>
          <input name="link" type="url" dir="ltr" autoCorrect="off" autoCapitalize="none" spellCheck={false} maxLength={500} />
        </label>
        <label className="team-field">
          <span>الجمهور</span>
          <select value={scopeIndex} onChange={(e) => setScopeIndex(Number(e.target.value))}>
            {scopes.map((s, i) => (
              <option key={i} value={i}>
                {audienceLabel(s.university === "*central*" ? null : s.university, s.sector)}
              </option>
            ))}
          </select>
        </label>
        {error && (
          <p className="team-error" role="alert">
            {error}
          </p>
        )}
        <div className="team-dialog-footer">
          <button type="button" className="team-button team-button-secondary" onClick={onClose} disabled={busy}>
            إلغاء
          </button>
          <button type="submit" className="team-button" disabled={busy}>
            {busy && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
            نشر
          </button>
        </div>
      </form>
    </TeamDialog>
  );
}

export default function Community({
  data,
  university,
  embedded = false,
}: {
  data: CommunityData;
  university: string;
  embedded?: boolean;
}) {
  const [filter, setFilter] = useState<"all" | "university" | "central">("all");
  const [publishing, setPublishing] = useState(false);

  const keep = useMemo(
    () => (u: string | null) => filter === "all" || (filter === "university" ? Boolean(university) && u === university : !u),
    [filter, university],
  );

  // Merged into 3 clear sections:
  // 1) مستجدات صحوة (news + current)
  // 2) المشاريع والفعاليات القادمة (projects + upcomingEvents)
  // 3) إنجازات الأسبوع (weekEvents + achievements)
  const updates = useMemo(() => [...data.news, ...data.current].filter((p) => keep(p.audienceUniversity)), [data, keep]);
  const upcomingProjects = useMemo(() => data.projects.filter((p) => keep(p.audienceUniversity)), [data, keep]);
  const upcomingEvents = useMemo(() => data.upcomingEvents.filter((e) => keep(e.university)), [data, keep]);
  const weekEvents = useMemo(() => data.weekEvents.filter((e) => keep(e.university)), [data, keep]);
  const achievements = useMemo(() => data.achievements.filter((p) => keep(p.audienceUniversity)), [data, keep]);

  const filterOptions = university
    ? ([["all", "الكل"], ["university", "جامعتي"], ["central", "المركزي"]] as const)
    : ([["all", "الكل"], ["central", "المركزي"]] as const);

  return (
    <section id="community" aria-labelledby="community-heading">
      {!embedded ? (
        <PageHeading title="أهل صحوة" description="مستجدات صحوة، المشاريع والفعاليات القادمة، وإنجازات الأسبوع." />
      ) : (
        <div className="platform-row mt-10 mb-4">
          <div>
            <h2 id="community-heading" className="platform-section-title font-heading" style={{ margin: 0 }}>
              أهل صحوة
            </h2>
            <p className="platform-muted mt-1">مستجدات صحوة وما نعمل عليه، المشاريع والفعاليات القادمة، وإنجازات الأسبوع.</p>
          </div>
          {data.canPublish && (
            <button type="button" className="team-button" onClick={() => setPublishing(true)}>
              <Plus size={17} aria-hidden="true" />
              نشر جديد
            </button>
          )}
        </div>
      )}

      <div className="platform-row mb-4">
        <div className="platform-tabs" role="tablist" aria-label="تصفية أهل صحوة">
          {filterOptions.map(([id, label]) => (
            <button key={id} type="button" role="tab" aria-selected={filter === id} onClick={() => setFilter(id)}>
              {label}
            </button>
          ))}
        </div>
        {!embedded && data.canPublish && (
          <button type="button" className="team-button" onClick={() => setPublishing(true)}>
            <Plus size={17} aria-hidden="true" />
            نشر جديد
          </button>
        )}
      </div>

      <div className="platform-grid platform-grid-3">
        <section className="platform-card" aria-labelledby="comm-updates">
          <h3 id="comm-updates" className="font-heading flex items-center gap-2 mb-3">
            <Megaphone size={18} aria-hidden="true" />
            مستجدات صحوة
          </h3>
          {updates.length ? (
            <div className="platform-list">
              {updates.map((p) => (
                <PostCard key={p.id} p={p} />
              ))}
            </div>
          ) : (
            <p className="platform-empty">لا توجد مستجدات منشورة حاليًا.</p>
          )}
        </section>

        <section className="platform-card" aria-labelledby="comm-upcoming">
          <h3 id="comm-upcoming" className="font-heading flex items-center gap-2 mb-3">
            <CalendarDays size={18} aria-hidden="true" />
            المشاريع والفعاليات القادمة
          </h3>
          {upcomingProjects.length || upcomingEvents.length ? (
            <div className="platform-list">
              {upcomingEvents.map((e) => (
                <EventCard key={`e-${e.id}`} e={e} />
              ))}
              {upcomingProjects.map((p) => (
                <PostCard key={`p-${p.id}`} p={p} />
              ))}
            </div>
          ) : (
            <p className="platform-empty">لا توجد مشاريع أو فعاليات قادمة منشورة حاليًا.</p>
          )}
        </section>

        <section className="platform-card" aria-labelledby="comm-week">
          <h3 id="comm-week" className="font-heading flex items-center gap-2 mb-3">
            <Sparkles size={18} aria-hidden="true" />
            إنجازات الأسبوع
          </h3>
          {weekEvents.length || achievements.length ? (
            <div className="platform-list">
              {weekEvents.map((e) => (
                <EventCard key={`w-${e.id}`} e={e} />
              ))}
              {achievements.map((p) => (
                <PostCard key={`a-${p.id}`} p={p} />
              ))}
            </div>
          ) : (
            <p className="platform-empty">لا توجد إنجازات مسجلة لهذا الأسبوع بعد.</p>
          )}
        </section>
      </div>

      {publishing && <Publisher scopes={data.publishScopes} onClose={() => setPublishing(false)} />}
    </section>
  );
}
