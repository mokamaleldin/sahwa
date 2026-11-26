"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import TeamDialog from "../../components/Team/TeamDialog";
import { displayDate, teamRequest } from "../../lib/team";

interface Post {
  id: string;
  kind: string;
  title: string;
  body: string;
  skills: string;
  link: string;
  happensOn: string;
  audienceUniversity: string | null;
  audienceSector: string | null;
  canDelete?: boolean;
  canEdit?: boolean;
  revision: number;
}
interface EventItem {
  id: string;
  title: string;
  eventDate: string;
  university: string | null;
  sector: string | null;
  responsible: string;
}
interface Data {
  news: Post[];
  projects: Post[];
  achievements: Post[];
  upcomingEvents: EventItem[];
  weekEvents: EventItem[];
  manageablePosts?: Post[];
  canPublish: boolean;
  publishScopes: { university: string | null; sector: string | null; team: string | null }[];
}

const SECTOR: Record<string, string> = { youth: "الشباب", women: "الطالبات" };
const KIND_LABELS: Record<string, string> = {
  news: "مستجدات صحوة",
  current: "نعمل الآن على",
  project: "المشاريع القادمة",
  achievement: "إنجازات الأسبوع",
};
const audienceLabel = (u: string | null, s: string | null) =>
  u || s
    ? [u === "*central*" ? "مركزي" : u || "كل الجامعات", s ? SECTOR[s] : ""]
        .filter(Boolean)
        .join(" — ")
    : "جميع أهل صحوة";

function PostList({
  posts,
  empty,
  onEdit,
  onRemove,
}: {
  posts: Post[];
  empty: string;
  onEdit?: (post: Post) => void;
  onRemove?: (post: Post) => void;
}) {
  if (!posts.length) return <p className="platform-empty">{empty}</p>;
  return (
    <div className="platform-list">
      {posts.map((p) => (
        <article className="platform-item" key={p.id}>
          <div className="platform-row">
            <h4>{p.title}</h4>
            {(p.canEdit || p.canDelete) && (
              <div className="flex items-center gap-1">
                {(p.canEdit ?? p.canDelete) && onEdit && (
                  <button type="button" className="team-text-button" onClick={() => onEdit(p)}>
                    <Pencil size={14} aria-hidden="true" />
                    تعديل
                  </button>
                )}
                {p.canDelete && onRemove && (
                  <button
                    type="button"
                    className="team-text-button team-delete-action"
                    onClick={() => onRemove(p)}
                  >
                    <Trash2 size={14} aria-hidden="true" />
                    حذف
                  </button>
                )}
              </div>
            )}
          </div>
          {p.body && <p>{p.body}</p>}
          <p className="mt-1">{p.happensOn && displayDate(p.happensOn)}</p>
          {p.link && (
            <a className="team-text-button" href={p.link} target="_blank" rel="noopener noreferrer">
              رابط التفاصيل
            </a>
          )}
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
          <div className="platform-row">
            <h4>{e.title}</h4>
            <span className="platform-chip platform-chip-muted">
              {audienceLabel(e.university, e.sector)}
            </span>
          </div>
          <p>{e.eventDate && displayDate(e.eventDate)}</p>
        </article>
      ))}
    </div>
  );
}

function Publisher({
  post,
  onClose,
  onSaved,
}: {
  post?: Post | null;
  onClose: () => void;
  onSaved: (updated?: Post) => void;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      kind: String(form.get("kind") || "news"),
      title: String(form.get("title") || ""),
      body: String(form.get("body") || ""),
      link: String(form.get("link") || ""),
      happensOn: String(form.get("happensOn") || ""),
    };
    setBusy(true);
    setError("");
    try {
      await teamRequest(
        {
          method: post ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            post ? { ...payload, id: post.id, revision: post.revision } : payload,
          ),
        },
        "/api/posts",
      );
      onSaved(
        post ? { ...post, ...payload, revision: post.revision + 1 } : undefined,
      );
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "تعذر الحفظ.");
      setBusy(false);
    }
  }
  return (
    <TeamDialog title={post ? "تعديل المستجد" : "نشر في أهل صحوة"} onClose={onClose} busy={busy}>
      <form className="team-form-body platform-form" onSubmit={submit}>
        <label className="team-field">
          <span>النوع</span>
          <select name="kind" required defaultValue={post?.kind || "news"}>
            {Object.entries(KIND_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <label className="team-field">
          <span>العنوان</span>
          <input name="title" required autoFocus defaultValue={post?.title || ""} maxLength={160} />
        </label>
        <label className="team-field">
          <span>
            التفاصيل <small>اختياري</small>
          </span>
          <textarea name="body" defaultValue={post?.body || ""} maxLength={2000} />
        </label>
        <label className="team-field">
          <span>
            التاريخ <small>اختياري</small>
          </span>
          <input type="date" name="happensOn" defaultValue={post?.happensOn || ""} />
        </label>
        <label className="team-field">
          <span>
            رابط <small>اختياري، https فقط</small>
          </span>
          <input
            name="link"
            type="url"
            dir="ltr"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            defaultValue={post?.link || ""}
            maxLength={500}
          />
        </label>
        <p className="platform-muted">
          يظهر المستجد لجميع أهل صحوة دون اسم الناشر. لا تنشر معلومات شخصية أو سرية.
        </p>
        {error && (
          <p className="team-error" role="alert">
            {error}
          </p>
        )}
        <div className="team-dialog-footer">
          <button
            type="button"
            className="team-button team-button-secondary"
            onClick={onClose}
            disabled={busy}
          >
            إلغاء
          </button>
          <button type="submit" className="team-button" disabled={busy}>
            {busy && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
            {post ? "حفظ التعديلات" : "نشر"}
          </button>
        </div>
      </form>
    </TeamDialog>
  );
}

export default function Community({
  data,
  showFeed,
  publish,
  workspace = false,
}: {
  data: Data;
  showFeed: boolean;
  publish: boolean;
  workspace?: boolean;
}) {
  const router = useRouter();
  const [dialogPost, setDialogPost] = useState<Post | null | undefined>(
    publish && data.canPublish ? null : undefined,
  );
  const [error, setError] = useState("");
  const [removed, setRemoved] = useState<string[]>([]);
  const [edits, setEdits] = useState<Record<string, Post>>({});

  async function remove(post: Post) {
    if (!confirm("هل تريد حذف هذا المستجد؟")) return;
    setError("");
    try {
      await teamRequest(
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: post.id, revision: post.revision }),
        },
        "/api/posts",
      );
      setRemoved((v) => [...v, post.id]);
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "تعذر الحذف.");
    }
  }

  const remaining = (posts: Post[]) =>
    posts.filter((p) => !removed.includes(p.id)).map((p) => edits[p.id] || p);

  return (
    <section id="community">
      {showFeed && (
        <>
          <h2 className="platform-section-title font-heading">ما يجري في صحوة</h2>
          <div className="community-columns">
            <section>
              <h3 className="font-heading">ما نعمل عليه الآن</h3>
              <PostList
                posts={remaining(data.news)}
                onEdit={setDialogPost}
                onRemove={remove}
                empty="لا توجد مستجدات حتى الآن."
              />
            </section>
            <section>
              <h3 className="font-heading">الفعاليات والمشاريع القادمة</h3>
              {data.upcomingEvents.length > 0 && <EventList events={data.upcomingEvents} empty="" />}
              {(data.projects.length > 0 || !data.upcomingEvents.length) && (
                <PostList
                  posts={remaining(data.projects)}
                  onEdit={setDialogPost}
                  onRemove={remove}
                  empty="لا توجد فعاليات أو مشاريع قادمة."
                />
              )}
            </section>
            <section>
              <h3 className="font-heading">إنجازات الأسبوع</h3>
              {data.weekEvents.length > 0 && <EventList events={data.weekEvents} empty="" />}
              {(data.achievements.length > 0 || !data.weekEvents.length) && (
                <PostList
                  posts={remaining(data.achievements)}
                  onEdit={setDialogPost}
                  onRemove={remove}
                  empty="لا توجد إنجازات مسجلة هذا الأسبوع."
                />
              )}
            </section>
          </div>
        </>
      )}
      {workspace && data.canPublish && (
        <>
          <h1 className="platform-section-title font-heading">نشر مستجد</h1>
          <button type="button" className="team-button" onClick={() => setDialogPost(null)}>
            نشر مستجد جديد
          </button>
          <h2 className="platform-section-title font-heading">المستجدات المنشورة</h2>
          <PostList
            posts={remaining(data.manageablePosts || [])}
            empty="لا توجد مستجدات يمكنك إدارتها."
            onEdit={setDialogPost}
            onRemove={remove}
          />
        </>
      )}
      {error && (
        <p className="team-error mt-3" role="alert">
          {error}
        </p>
      )}
      {dialogPost !== undefined && (
        <Publisher
          post={dialogPost}
          onClose={() => {
            setDialogPost(undefined);
            if (!workspace) router.replace("/team#community", { scroll: false });
          }}
          onSaved={(updated) => {
            if (updated) setEdits((prev) => ({ ...prev, [updated.id]: updated }));
            setDialogPost(undefined);
            if (!workspace) router.replace("/team#community", { scroll: false });
          }}
        />
      )}
    </section>
  );
}
