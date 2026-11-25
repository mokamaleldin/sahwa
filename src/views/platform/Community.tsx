"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Megaphone, Plus, Sparkles, Hammer, Rocket, HandHeart, Lightbulb, Loader2 } from "lucide-react";
import Link from "next/link";
import PageHeading from "../../components/shared/PageIdentity";
import TeamDialog from "../../components/Team/TeamDialog";
import { displayDate, teamRequest } from "../../lib/team";

interface Post { id: string; kind: string; title: string; body: string; skills: string; link: string; happensOn: string; audienceUniversity: string | null; audienceSector: string | null; authorLabel: string; revision: number }
interface EventItem { id: string; title: string; eventDate: string; university: string | null; sector: string | null; responsible: string }
interface Data {
  news: Post[]; current: Post[]; projects: Post[]; achievements: Post[]; opportunities: Post[];
  upcomingEvents: EventItem[]; weekEvents: EventItem[];
  canPublish: boolean; publishScopes: { university: string | null; sector: string | null }[];
}

const SECTOR: Record<string, string> = { youth: "الشباب", women: "الطالبات" };
const KIND_LABELS: Record<string, string> = { news: "مستجدات صحوة", current: "نعمل الآن على", project: "المشاريع القادمة", achievement: "إنجازات الأسبوع", opportunity: "فرصة مشاركة" };
const audienceLabel = (u: string | null, s: string | null) => (u || s ? [u || "مركزي", s ? SECTOR[s] : ""].filter(Boolean).join(" — ") : "جميع أهل صحوة");

function PostList({ posts, empty }: { posts: Post[]; empty: string }) {
  if (!posts.length) return <p className="platform-empty">{empty}</p>;
  return (
    <div className="platform-list">
      {posts.map((p) => (
        <article className="platform-item" key={p.id}>
          <div className="platform-row"><h4>{p.title}</h4><span className="platform-chip platform-chip-muted">{audienceLabel(p.audienceUniversity, p.audienceSector)}</span></div>
          {p.body && <p>{p.body}</p>}
          {p.skills && <p className="mt-1"><strong>المهارات المطلوبة:</strong> {p.skills}</p>}
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
    const scope = scopes[scopeIndex] || { university: null, sector: null };
    setBusy(true);
    setError("");
    try {
      await teamRequest({ method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
        kind: form.get("kind"), title: form.get("title"), body: form.get("body"), skills: form.get("skills"), link: form.get("link"), happensOn: form.get("happensOn"),
        audienceUniversity: scope.university === "*central*" ? null : scope.university, audienceSector: scope.sector,
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
        <label className="team-field"><span>المهارات المطلوبة <small>للفرص فقط</small></span><input name="skills" maxLength={300} placeholder="تصوير، تصميم، تنظيم…" /></label>
        <label className="team-field"><span>التاريخ <small>اختياري</small></span><input type="date" name="happensOn" /></label>
        <label className="team-field"><span>رابط <small>اختياري، https فقط</small></span><input name="link" type="url" dir="ltr" maxLength={500} /></label>
        <label className="team-field"><span>الجمهور</span>
          <select value={scopeIndex} onChange={(e) => setScopeIndex(Number(e.target.value))}>
            {scopes.map((s, i) => <option key={i} value={i}>{audienceLabel(s.university === "*central*" ? null : s.university, s.sector)}</option>)}
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

export default function Community({ data, university }: { data: Data; university: string }) {
  const [filter, setFilter] = useState<"all" | "university" | "central">("all");
  const [publishing, setPublishing] = useState(false);
  const keep = useMemo(() => (u: string | null) => filter === "all" || (filter === "university" ? Boolean(university) && u === university : !u), [filter, university]);
  const posts = (list: Post[]) => list.filter((p) => keep(p.audienceUniversity));
  const events = (list: EventItem[]) => list.filter((e) => keep(e.university));
  return (
    <>
      <PageHeading title="أهل صحوة" description="ما نعمل عليه، وما هو قادم، وكيف تشارك." />
      <div className="platform-row mb-4">
        <div className="platform-tabs" role="tablist" aria-label="تصفية">
          {([["all", "الكل"], ["university", "جامعتي"], ["central", "المركزي"]] as const).map(([id, label]) => (
            <button key={id} role="tab" aria-selected={filter === id} onClick={() => setFilter(id)}>{label}</button>
          ))}
        </div>
        {data.canPublish && <button className="team-button" onClick={() => setPublishing(true)}><Plus size={17} aria-hidden="true" />نشر جديد</button>}
      </div>
      <div className="platform-grid">
        <section><h2 className="platform-section-title font-heading"><Megaphone size={20} aria-hidden="true" />مستجدات صحوة</h2><PostList posts={posts(data.news)} empty="لا توجد مستجدات منشورة داخليًا بعد." /></section>
        <section><h2 className="platform-section-title font-heading"><Hammer size={20} aria-hidden="true" />نعمل الآن على</h2><PostList posts={posts(data.current)} empty="لم تُنشر أعمال جارية بعد." /></section>
        <section><h2 className="platform-section-title font-heading"><Rocket size={20} aria-hidden="true" />المشاريع القادمة</h2><PostList posts={posts(data.projects)} empty="لم تُنشر مشروعات قادمة بعد." /></section>
        <section><h2 className="platform-section-title font-heading"><CalendarDays size={20} aria-hidden="true" />الفعاليات القادمة</h2><EventList events={events(data.upcomingEvents)} empty="لا توجد فعاليات قادمة مشاركة داخليًا. تظهر الفعالية هنا عندما يختار مسؤولها مشاركتها مع أهل صحوة." /></section>
        <section><h2 className="platform-section-title font-heading"><Sparkles size={20} aria-hidden="true" />إنجازات الأسبوع</h2>
          <EventList events={events(data.weekEvents)} empty="لا توجد فعاليات مشاركة داخليًا خلال الأيام السبعة الماضية." />
          {posts(data.achievements).length > 0 && <div className="mt-3"><PostList posts={posts(data.achievements)} empty="" /></div>}
        </section>
        <section><h2 className="platform-section-title font-heading"><HandHeart size={20} aria-hidden="true" />فرص المشاركة والمهارات المطلوبة</h2><PostList posts={posts(data.opportunities)} empty="لا توجد فرص مشاركة منشورة حاليًا." /></section>
      </div>
      <section className="platform-card mt-6">
        <div className="platform-row">
          <div><h2 className="font-heading flex items-center gap-2"><Lightbulb size={20} aria-hidden="true" />عندك فكرة؟</h2><p>شاركها في بنك الأنشطة أو العلاقات أو الأفكار الإعلامية.</p></div>
          <Link className="team-button" href="/team/forms">النماذج والاقتراحات</Link>
        </div>
      </section>
      {publishing && <Publisher scopes={data.publishScopes} onClose={() => setPublishing(false)} />}
    </>
  );
}
