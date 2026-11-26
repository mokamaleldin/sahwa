"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import TeamDialog from "../../components/Team/TeamDialog";
import { TEAM_TITLES } from "../../../shared/platform-roles.js";
import { displayDate, teamRequest } from "../../lib/team";

interface Post { id: string; kind: string; title: string; body: string; skills: string; link: string; happensOn: string; audienceUniversity: string | null; audienceSector: string | null; authorLabel: string; revision: number }
interface EventItem { id: string; title: string; eventDate: string; university: string | null; sector: string | null; responsible: string }
interface Data {
  news: Post[]; projects: Post[]; achievements: Post[];
  upcomingEvents: EventItem[]; weekEvents: EventItem[];
  canPublish: boolean; publishScopes: { university: string | null; sector: string | null; team: string | null }[];
}

const SECTOR: Record<string, string> = { youth: "الشباب", women: "الطالبات" };
const KIND_LABELS: Record<string, string> = { news: "مستجدات صحوة", current: "نعمل الآن على", project: "المشاريع القادمة", achievement: "إنجازات الأسبوع" };
const audienceLabel = (u: string | null, s: string | null) => (u || s ? [u === "*central*" ? "مركزي" : u || "كل الجامعات", s ? SECTOR[s] : ""].filter(Boolean).join(" — ") : "جميع أهل صحوة");

function PostList({ posts, empty }: { posts: Post[]; empty: string }) {
  if (!posts.length) return <p className="platform-empty">{empty}</p>;
  return (
    <div className="platform-list">
      {posts.map((p) => (
        <article className="platform-item" key={p.id}>
          <div className="platform-row"><h4>{p.title}</h4><span className="platform-chip platform-chip-muted">{audienceLabel(p.audienceUniversity, p.audienceSector)}</span></div>
          {p.body && <p>{p.body}</p>}
          <p className="mt-1">{[p.happensOn && displayDate(p.happensOn), p.authorLabel && `نشره: ${p.authorLabel}`].filter(Boolean).join(" · ")}</p>
          {p.link && <a className="team-text-button" href={p.link} target="_blank" rel="noopener noreferrer">رابط التفاصيل</a>}
        </article>
      ))}
    </div>
  );
}

function EventList({ events, empty }: { events: EventItem[]; empty: string }) {
  if (!events.length) return <p className="platform-empty">{empty}</p>;
  return (
    <div className="platform-list">
      {events.map((e) => (
        <article className="platform-item" key={e.id}>
          <div className="platform-row"><h4>{e.title}</h4><span className="platform-chip platform-chip-muted">{audienceLabel(e.university, e.sector)}</span></div>
          <p>{[e.eventDate && displayDate(e.eventDate), e.responsible && `المسؤول: ${e.responsible}`].filter(Boolean).join(" · ")}</p>
        </article>
      ))}
    </div>
  );
}

function Publisher({ scopes, onClose }: { scopes: Data["publishScopes"]; onClose: () => void }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [scopeIndex, setScopeIndex] = useState(0);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const scope = scopes[scopeIndex];
    setBusy(true);
    setError("");
    try {
      await teamRequest({ method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
        kind: form.get("kind"), title: form.get("title"), body: form.get("body"), link: form.get("link"), happensOn: form.get("happensOn"),
        audienceUniversity: scope.university, audienceSector: scope.sector, audienceTeam: scope.team,
      }) }, "/api/posts");
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
        <label className="team-field"><span>النوع</span>
          <select name="kind" required defaultValue="news">{Object.entries(KIND_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        </label>
        <label className="team-field"><span>العنوان</span><input name="title" required maxLength={160} /></label>
        <label className="team-field"><span>التفاصيل <small>اختياري</small></span><textarea name="body" maxLength={2000} /></label>
        <label className="team-field"><span>التاريخ <small>اختياري</small></span><input type="date" name="happensOn" /></label>
        <label className="team-field"><span>رابط <small>اختياري، https فقط</small></span><input name="link" type="url" dir="ltr" maxLength={500} /></label>
        <label className="team-field"><span>الجمهور</span>
          <select value={scopeIndex} onChange={(e) => setScopeIndex(Number(e.target.value))}>
            {scopes.map((s, i) => <option key={i} value={i}>{audienceLabel(s.university, s.sector) + (s.team ? " · " + (TEAM_TITLES[s.team as keyof typeof TEAM_TITLES] || "") : "")}</option>)}
          </select>
          <small>لا يتحول أي سجل خاص إلى منشور تلقائيًا. انشر فقط ما تسمح الجهة المالكة بمشاركته داخليًا.</small>
        </label>
        {error && <p className="team-error" role="alert">{error}</p>}
        <div className="team-dialog-footer">
          <button type="button" className="team-button team-button-secondary" onClick={onClose} disabled={busy}>إلغاء</button>
          <button className="team-button" disabled={busy}>{busy && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}نشر</button>
        </div>
      </form>
    </TeamDialog>
  );
}

export default function Community({ data, showFeed, publish }: { data: Data; showFeed: boolean; publish: boolean }) {
  const router = useRouter();
  const [publishing, setPublishing] = useState(publish && data.canPublish);
  return <section id="community">
    {showFeed && <>
      <h2 className="platform-section-title font-heading">أهل صحوة</h2>
      <div className="community-columns">
        <section><h3 className="font-heading">مستجدات صحوة</h3><PostList posts={data.news} empty="لا توجد مستجدات حتى الآن." /></section>
        <section><h3 className="font-heading">الفعاليات والمشاريع القادمة</h3>
          {data.upcomingEvents.length > 0 && <EventList events={data.upcomingEvents} empty="" />}
          {(data.projects.length > 0 || !data.upcomingEvents.length) && <PostList posts={data.projects} empty="لا توجد فعاليات أو مشاريع قادمة." />}
        </section>
        <section><h3 className="font-heading">إنجازات الأسبوع</h3>
          {data.weekEvents.length > 0 && <EventList events={data.weekEvents} empty="" />}
          {(data.achievements.length > 0 || !data.weekEvents.length) && <PostList posts={data.achievements} empty="لا توجد إنجازات مسجلة هذا الأسبوع." />}
        </section>
      </div>
    </>}
    {publishing && <Publisher scopes={data.publishScopes} onClose={() => { setPublishing(false); router.replace("/team#community", {scroll: false}); }} />}
  </section>;
}
