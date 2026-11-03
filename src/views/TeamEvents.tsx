"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  UserRound,
  UsersRound,
} from "lucide-react";
import PageHeading from "../components/shared/PageIdentity";
import EventForm from "../components/Team/EventForm";
import {
  displayDate,
  teamRequest,
  type SahwaEvent,
  type SahwaEventInput,
} from "../lib/team";
import { normalizeSearch } from "../../shared/team-options.js";

const PAGE_SIZE = 12;
export default function TeamEvents() {
  const [events, setEvents] = useState<SahwaEvent[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [query, setQuery] = useState(""),
    [page, setPage] = useState(1);
  const [editing, setEditing] = useState<SahwaEvent | null | undefined>(
    undefined,
  );
  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");
    try {
      const data = await teamRequest<{ events: SahwaEvent[] }>(
        { signal },
        "/api/events",
      );
      if (!signal?.aborted) setEvents(data.events);
    } catch (e) {
      if (!signal?.aborted)
        setError(e instanceof Error ? e.message : "تعذر تحميل السجل.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);
  useEffect(() => {
    const c = new AbortController();
    void load(c.signal);
    return () => c.abort();
  }, [load]);
  const results = useMemo(
    () =>
      events
        .filter((e) =>
          normalizeSearch(`${e.title} ${e.responsible}`).includes(
            normalizeSearch(query),
          ),
        )
        .sort((a, b) => b.eventDate.localeCompare(a.eventDate)),
    [events, query],
  );
  const pages = Math.max(1, Math.ceil(results.length / PAGE_SIZE)),
    current = Math.min(page, pages);
  async function save(event: SahwaEventInput) {
    const data = await teamRequest<{ event: SahwaEvent }>(
      {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event,
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
  async function remove() {
    if (!editing) return;
    await teamRequest(
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editing.id, revision: editing.revision }),
      },
      "/api/events",
    );
    setEvents((all) => all.filter((e) => e.id !== editing.id));
    setEditing(undefined);
    setNotice("تم حذف الفعالية.");
  }
  return (
    <>
      <Helmet>
        <title>سجل الفعاليات | صحوة</title>
      </Helmet>
      <PageHeading
        title="سجل الفعاليات"
        description="ما أنجزناه معًا، محفوظ ببساطة. أضف الفعالية وتفاصيلها الأساسية."
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
              className="team-button team-button-secondary"
              onClick={() => void load()}
              disabled={loading}
            >
              <RefreshCw size={16} />
              تحديث
            </button>
            <button
              className="team-button"
              onClick={() => {
                setNotice("");
                setEditing(null);
              }}
              disabled={loading || Boolean(error)}
            >
              <Plus size={18} />
              إضافة فعالية
            </button>
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
            <button className="underline" onClick={() => void load()}>
              إعادة المحاولة
            </button>
          </p>
        )}
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
                  : "أضف أول فعالية لنحفظ ما أنجزه فريق صحوة."}
            </p>
          </div>
        ) : (
          <div className="team-events-grid">
            {results
              .slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)
              .map((event) => (
                <article className="team-event-card" key={event.id}>
                  <div className="team-event-top">
                    <span className="team-event-date">
                      <CalendarDays size={16} />
                      <time dateTime={event.eventDate}>
                        {displayDate(event.eventDate)}
                      </time>
                    </span>
                    <button
                      className="team-icon-button"
                      onClick={() => setEditing(event)}
                      aria-label={`تعديل فعالية ${event.title}`}
                    >
                      <Pencil size={17} />
                    </button>
                  </div>
                  <h2 className="font-heading">{event.title}</h2>
                  <div className="team-event-meta">
                    <p>
                      <UserRound size={16} />
                      <span>{event.responsible}</span>
                    </p>
                    <p>
                      <UsersRound size={16} />
                      <span>
                        {event.attendance === null
                          ? "عدد الحضور غير مسجل"
                          : `${event.attendance.toLocaleString("ar-EG")} حضور`}
                      </span>
                    </p>
                  </div>
                  {event.notes && (
                    <p className="team-event-notes">{event.notes}</p>
                  )}
                </article>
              ))}
          </div>
        )}
        {pages > 1 && (
          <nav className="team-pagination" aria-label="صفحات الفعاليات">
            <button
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
      {editing !== undefined && (
        <EventForm
          event={editing}
          onSave={save}
          onDelete={remove}
          onClose={() => setEditing(undefined)}
        />
      )}
    </>
  );
}
