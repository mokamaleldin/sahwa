"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UserRound,
  UsersRound,
} from "lucide-react";
import PageHeading from "../components/shared/PageIdentity";
import EventForm from "../components/Team/EventForm";
import TeamDialog from "../components/Team/TeamDialog";
import {
  displayDate,
  teamRequest,
  type SahwaEvent,
  type SahwaEventInput,
  type ResponsibleVolunteer,
  type EventScope,
  type EventExtra,
} from "../lib/team";
import { normalizeSearch } from "../../shared/team-options.js";

const PAGE_SIZE = 12;
const PROGRESS_LABELS: Record<string, string> = {
  planned: "مخططة",
  completed: "مكتملة",
  cancelled: "ملغاة",
};

function eventScopeText(event: SahwaEvent) {
  if (!event.university && !event.sector) return "";
  return [
    event.university || "مركزي",
    event.sector === "youth" ? "الشباب" : event.sector === "women" ? "الطالبات" : "",
  ]
    .filter(Boolean)
    .join(" — ");
}

function EventDetails({
  event,
  onClose,
  onEdit,
  onDelete,
}: {
  event: SahwaEvent;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => Promise<void>;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const scopeText = eventScopeText(event);

  async function remove() {
    if (deleting) return;
    setDeleting(true);
    setError("");
    try {
      await onDelete();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "تعذر حذف الفعالية.");
      setDeleting(false);
    }
  }

  return (
    <TeamDialog title={event.title} busy={deleting} onClose={onClose}>
      <div className="team-form-body">
        <div className="platform-chips mb-5">
          {scopeText && <span className="platform-chip">{scopeText}</span>}
          {event.progress && PROGRESS_LABELS[event.progress] && (
            <span className="platform-chip platform-chip-gold">{PROGRESS_LABELS[event.progress]}</span>
          )}
          <span className="platform-chip platform-chip-muted">
            {event.audience === "internal" ? "مشاركة مع أهل صحوة" : "مسجلة في السجل فقط"}
          </span>
        </div>

        <dl className="team-detail-grid">
          <div>
            <dt>تاريخ الفعالية</dt>
            <dd>{event.eventDate ? displayDate(event.eventDate) : "التاريخ غير محدد"}</dd>
          </div>
          <div>
            <dt>المسؤول عنها</dt>
            <dd>{event.responsible || "بدون مسؤول محدد"}</dd>
          </div>
          <div>
            <dt>عدد الحضور</dt>
            <dd>
              {event.attendance === null
                ? "غير مسجل"
                : `${event.attendance.toLocaleString("ar-EG")} حضور`}
            </dd>
          </div>
          <div>
            <dt>النطاق</dt>
            <dd>{scopeText || "سجل صحوة العام"}</dd>
          </div>
        </dl>

        {event.notes && (
          <div className="mt-5 rounded-2xl border border-[#75202618] bg-white/70 p-4">
            <h3 className="mb-2 text-xs font-semibold text-brand-primary">ملاحظات وتفاصيل</h3>
            <p className="whitespace-pre-wrap text-sm leading-7 text-brand-muted">{event.notes}</p>
          </div>
        )}

        {error && (
          <p className="team-error mt-4" role="alert">
            {error}
          </p>
        )}

        {confirmDelete && (
          <div className="team-delete-confirm" role="alert">
            <p>هل تريد حذف فعالية «{event.title}» من السجل؟</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                className="team-button team-button-secondary"
                autoFocus
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
              >
                تراجع
              </button>
              <button
                type="button"
                className="team-button team-button-danger"
                onClick={() => void remove()}
                disabled={deleting}
              >
                {deleting && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
                {deleting ? "جارٍ الحذف…" : "نعم، احذف الفعالية"}
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="team-dialog-footer">
        {event.canEdit === true && (
          <button
            type="button"
            className="team-button"
            onClick={onEdit}
            disabled={deleting || confirmDelete}
          >
            <Pencil size={16} aria-hidden="true" />
            تعديل الفعالية
          </button>
        )}
        <button
          type="button"
          className="team-button team-button-secondary"
          onClick={onClose}
          disabled={deleting}
        >
          إغلاق
        </button>
        {event.canDelete === true && (
          <button
            type="button"
            className="team-text-button team-delete-action"
            onClick={() => setConfirmDelete(true)}
            disabled={deleting || confirmDelete}
          >
            <Trash2 size={16} aria-hidden="true" />
            حذف الفعالية
          </button>
        )}
      </div>
    </TeamDialog>
  );
}

export default function TeamEvents({ openNew = false }: { openNew?: boolean } = {}) {
  const [volunteers, setVolunteers] = useState<ResponsibleVolunteer[]>([]);
  const [scopes, setScopes] = useState<EventScope[]>([]);
  const [canCreate, setCanCreate] = useState(false);
  const [events, setEvents] = useState<SahwaEvent[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [query, setQuery] = useState(""),
    [page, setPage] = useState(1);
  const [selected, setSelected] = useState<SahwaEvent | null>(null);
  const [editing, setEditing] = useState<SahwaEvent | null | undefined>(
    undefined,
  );
  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");
    try {
      const data = await teamRequest<{
        events: SahwaEvent[];
        volunteers: ResponsibleVolunteer[];
        scopes?: EventScope[];
        canCreate?: boolean;
      }>({ signal }, "/api/events");
      if (!signal?.aborted) {
        setEvents(data.events);
        setVolunteers(data.volunteers);
        setScopes(data.scopes || []);
        setCanCreate(data.canCreate === true);
        setSelected((curr) => (curr ? data.events.find((e) => e.id === curr.id) || null : null));
        if (openNew && data.canCreate) setEditing(null);
      }
    } catch (e) {
      if (!signal?.aborted)
        setError(e instanceof Error ? e.message : "تعذر تحميل السجل.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [openNew]);
  useEffect(() => {
    const c = new AbortController();
    void load(c.signal);
    return () => c.abort();
  }, [load]);
  const results = useMemo(
    () =>
      events
        .filter((e) =>
          normalizeSearch(`${e.title} ${e.responsible} ${e.university || ""}`).includes(
            normalizeSearch(query),
          ),
        )
        .sort((a, b) => b.eventDate.localeCompare(a.eventDate)),
    [events, query],
  );
  const overview = useMemo(() => {
    let attendanceTotal = 0;
    const yearly = new Map<
      string,
      { year: string; count: number; total: number; hasAttendance: boolean }
    >();
    for (const event of events) {
      const year = event.eventDate ? event.eventDate.slice(0, 4) : "غير محددة";
      const group = yearly.get(year) ?? {
        year,
        count: 0,
        total: 0,
        hasAttendance: false,
      };
      group.count += 1;
      if (event.attendance !== null) {
        attendanceTotal += event.attendance;
        group.total += event.attendance;
        group.hasAttendance = true;
      }
      yearly.set(year, group);
    }
    return {
      attendanceTotal,
      yearly: [...yearly.values()].sort((a, b) =>
        a.year === "غير محددة"
          ? 1
          : b.year === "غير محددة"
            ? -1
            : Number(b.year) - Number(a.year),
      ),
    };
  }, [events]);
  const pages = Math.max(1, Math.ceil(results.length / PAGE_SIZE)),
    current = Math.min(page, pages);
  async function save(event: SahwaEventInput, extra?: EventExtra) {
    const data = await teamRequest<{ event: SahwaEvent }>(
      {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event,
          ...(extra || {}),
          ...(editing ? { id: editing.id, revision: editing.revision } : {}),
        }),
      },
      "/api/events",
    );
    setEvents((all) =>
      editing
        ? all.map((e) => (e.id === data.event.id ? data.event : e))
        : [data.event, ...all],
    );
    setEditing(undefined);
    setNotice(
      editing ? "تم حفظ التعديلات." : "تمت إضافة الفعالية إلى سجل صحوة.",
    );
    setQuery("");
    setPage(1);
  }
  async function removeEvent(target: SahwaEvent) {
    await teamRequest(
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: target.id, revision: target.revision }),
      },
      "/api/events",
    );
    setEvents((all) => all.filter((e) => e.id !== target.id));
    setEditing(undefined);
    setSelected(null);
    setNotice("تم حذف الفعالية.");
  }
  return (
    <>
      <Helmet>
        <title>سجل الفعاليات | صحوة</title>
      </Helmet>
      <PageHeading
        title="سجل الفعاليات"
        description="ما أنجزناه معًا، محفوظ في سجل واحد لجميع أهل صحوة."
      />
      <section aria-label="فعاليات صحوة">
        <div className="team-directory-toolbar">
          <div className="flex items-center gap-3">
            <span className="team-icon team-icon-small">
              <CalendarDays size={24} />
            </span>
            <span className="text-sm text-brand-muted">
              {events.length.toLocaleString("ar-EG")} فعالية في السجل
            </span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="team-button team-button-secondary"
              onClick={() => void load()}
              disabled={loading}
            >
              <RefreshCw size={16} />
              تحديث
            </button>
            {canCreate && <button
              type="button"
              className="team-button"
              onClick={() => {
                setNotice("");
                setEditing(null);
              }}
              disabled={loading || Boolean(error)}
            >
              <Plus size={18} />
              إضافة فعالية
            </button>}
          </div>
        </div>
        {notice && (
          <p className="team-success" role="status">
            {notice}
          </p>
        )}
        {error && (
          <p className="team-error mb-5" role="alert">
            {error}{" "}
            <button type="button" className="underline" onClick={() => void load()}>
              إعادة المحاولة
            </button>
          </p>
        )}
        {!loading && !error && events.length > 0 && (
          <section
            aria-label="إحصائيات الفعاليات"
            className="mb-6 rounded-2xl border border-brand-primary/10 bg-brand-background p-4 sm:p-6"
          >
            <div className="grid grid-cols-2 gap-3">
              {[
                { title: "إجمالي الفعاليات", value: events.length, icon: CalendarDays },
                { title: "مجموع الأعداد المسجلة", value: overview.attendanceTotal, icon: UsersRound },
              ].map(({ title, value, icon: Icon }) => (
                <div
                  key={title}
                  className="rounded-xl border border-brand-primary/10 bg-white/70 p-3 sm:p-4"
                >
                  <p className="flex items-center gap-2 text-xs text-brand-muted sm:text-sm">
                    <Icon size={16} aria-hidden="true" />
                    {title}
                  </p>
                  <p className="mt-2 text-2xl font-bold tabular-nums text-brand-primary sm:text-3xl">
                    {value.toLocaleString("ar-EG")}
                  </p>
                </div>
              ))}
            </div>
            <details className="group mt-5">
              <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg py-2 font-heading text-base text-brand-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 [&::-webkit-details-marker]:hidden">
                <ChevronDown
                  size={19}
                  className="shrink-0 transition-transform duration-200 group-open:rotate-180"
                  aria-hidden="true"
                />
                تفصيل السجل حسب السنة
              </summary>
              <div className="mt-2 overflow-x-auto">
                <table className="w-full min-w-[300px] text-right text-sm">
                  <thead>
                    <tr className="border-b border-brand-primary/15 text-brand-muted">
                      <th scope="col" className="px-2 py-2 font-medium">السنة</th>
                      <th scope="col" className="px-2 py-2 font-medium">الفعاليات</th>
                      <th scope="col" className="px-2 py-2 font-medium">مجموع أعداد الحضور</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overview.yearly.map((year) => (
                      <tr key={year.year} className="border-b border-brand-primary/10 last:border-0">
                        <th scope="row" className="px-2 py-2 font-medium text-brand-primary">
                          {year.year === "غير محددة" ? "غير محددة" : Number(year.year).toLocaleString("ar-EG", { useGrouping: false })}
                        </th>
                        <td className="px-2 py-2">{year.count.toLocaleString("ar-EG")}</td>
                        <td className="px-2 py-2">
                          {year.hasAttendance ? year.total.toLocaleString("ar-EG") : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          </section>
        )}
        <search>
          <label className="team-search">
            <span className="sr-only">البحث في الفعاليات</span>
            <Search size={20} />
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="ابحث باسم الفعالية أو المسؤول عنها…"
              maxLength={160}
            />
          </label>
        </search>
        <p className="team-results-count" role="status">
          {loading
            ? "جارٍ تحميل الفعاليات…"
            : `${results.length.toLocaleString("ar-EG")} نتيجة · الأحدث أولًا`}
        </p>
        {loading ? (
          <div className="team-loading">
            <Loader2 className="animate-spin" />
            <p>جارٍ تحميل السجل…</p>
          </div>
        ) : !results.length ? (
          <div className="team-empty">
            <CalendarDays size={38} />
            <h3>
              {error
                ? "تعذر تحميل السجل"
                : events.length
                  ? "لا توجد نتائج مطابقة"
                  : "كل فعالية تترك أثرًا"}
            </h3>
            <p>
              {error
                ? "أعد المحاولة لعرض الفعاليات."
                : events.length
                  ? "جرّب اسمًا آخر."
                  : canCreate ? "أضف أول فعالية لنحفظ ما أنجزه فريق صحوة." : "لا توجد فعاليات مسجلة بعد."}
            </p>
          </div>
        ) : (
          <div className="team-events-grid">
            {results
              .slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)
              .map((event) => {
                const scopeText = eventScopeText(event);
                return (
                  <article className="team-event-card" key={event.id}>
                    <div className="team-event-top">
                      <span className="team-event-date">
                        <CalendarDays size={15} aria-hidden="true" />
                        {event.eventDate ? (
                          <time dateTime={event.eventDate}>
                            {displayDate(event.eventDate)}
                          </time>
                        ) : (
                          <span>بدون تاريخ</span>
                        )}
                      </span>
                      {event.canEdit === true && (
                        <button
                          type="button"
                          className="team-icon-button"
                          onClick={() => setEditing(event)}
                          aria-label={`تعديل فعالية ${event.title}`}
                        >
                          <Pencil size={16} aria-hidden="true" />
                        </button>
                      )}
                    </div>
                    <h2 className="font-heading">
                      <button
                        type="button"
                        className="card-trigger"
                        onClick={() => setSelected(event)}
                      >
                        {event.title}
                      </button>
                    </h2>
                    {(scopeText || (event.progress && PROGRESS_LABELS[event.progress])) && (
                      <div className="platform-chips mt-2">
                        {scopeText && <span className="platform-chip platform-chip-muted">{scopeText}</span>}
                        {event.progress && PROGRESS_LABELS[event.progress] && (
                          <span className="platform-chip platform-chip-gold">{PROGRESS_LABELS[event.progress]}</span>
                        )}
                      </div>
                    )}
                    <div className="team-event-meta">
                      <p>
                        <UserRound size={15} aria-hidden="true" />
                        <span>{event.responsible || "بدون مسؤول"}</span>
                      </p>
                      <p>
                        <UsersRound size={15} aria-hidden="true" />
                        <span>
                          {event.attendance === null
                            ? "غير مسجل"
                            : `${event.attendance.toLocaleString("ar-EG")} حضور`}
                        </span>
                      </p>
                    </div>
                    <footer className="team-event-footer">
                      <span className="team-event-hint">
                        {event.notes ? (
                          <>
                            <FileText size={13} aria-hidden="true" />
                            توجد ملاحظات
                          </>
                        ) : (
                          "عرض التفاصيل"
                        )}
                      </span>
                      <ChevronLeft size={15} aria-hidden="true" />
                    </footer>
                  </article>
                );
              })}
          </div>
        )}
        {pages > 1 && (
          <nav className="team-pagination" aria-label="صفحات الفعاليات">
            <button
              type="button"
              className="team-button team-button-secondary"
              disabled={current === 1}
              onClick={() => setPage(current - 1)}
            >
              <ChevronRight size={16} />
              السابق
            </button>
            <span>
              {current} / {pages}
            </span>
            <button
              type="button"
              className="team-button team-button-secondary"
              disabled={current === pages}
              onClick={() => setPage(current + 1)}
            >
              التالي
              <ChevronLeft size={16} />
            </button>
          </nav>
        )}
      </section>
      {selected && editing === undefined && (
        <EventDetails
          event={selected}
          onClose={() => setSelected(null)}
          onEdit={() => {
            setEditing(selected);
            setSelected(null);
          }}
          onDelete={() => removeEvent(selected)}
        />
      )}
      {editing !== undefined && (
        <EventForm
          event={editing}
          volunteers={volunteers}
          onSave={save}
          onDelete={() => (editing ? removeEvent(editing) : Promise.resolve())}
          onClose={() => setEditing(undefined)}
          scopes={scopes}
        />
      )}
    </>
  );
}
