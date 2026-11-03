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
  type ResponsibleVolunteer,
} from "../lib/team";
import { normalizeSearch } from "../../shared/team-options.js";

const PAGE_SIZE = 12;
export default function TeamEvents() {
  const [volunteers, setVolunteers] = useState<ResponsibleVolunteer[]>([]);
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
      const data = await teamRequest<{
        events: SahwaEvent[];
        volunteers: ResponsibleVolunteer[];
      }>({ signal }, "/api/events");
      if (!signal?.aborted) {
        setEvents(data.events);
        setVolunteers(data.volunteers);
      }
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
  const overview = useMemo(() => {
    let recorded = 0;
    let attendanceTotal = 0;
    const yearly = new Map<
      string,
      { year: string; count: number; recorded: number; total: number }
    >();
    for (const event of events) {
      const year = event.eventDate ? event.eventDate.slice(0, 4) : "غير محددة";
      const group = yearly.get(year) ?? {
        year,
        count: 0,
        recorded: 0,
        total: 0,
      };
      group.count += 1;
      if (event.attendance !== null) {
        recorded += 1;
        attendanceTotal += event.attendance;
        group.recorded += 1;
        group.total += event.attendance;
      }
      yearly.set(year, group);
    }
    return {
      recorded,
      attendanceTotal,
      missing: events.length - recorded,
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
        {!loading && !error && events.length > 0 && (
          <section
            aria-labelledby="events-overview-title"
            className="mb-6 rounded-2xl border border-brand-primary/10 bg-brand-background p-4 sm:p-6"
          >
            <h2
              id="events-overview-title"
              className="mb-4 font-heading text-xl text-brand-primary"
            >
              ملخص الفعاليات والحضور
            </h2>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[
                { title: "إجمالي الفعاليات", value: events.length, icon: CalendarDays },
                { title: "مجموع الأعداد المسجلة", value: overview.attendanceTotal, icon: UsersRound },
                { title: "فعاليات لها عدد", value: overview.recorded, icon: UserRound },
                { title: "فعاليات دون عدد", value: overview.missing, icon: Search },
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
            <p className="mt-3 text-sm leading-7 text-brand-muted">
              مجموع الأعداد هو جمع القيم المسجلة لكل فعالية، وليس عدد أشخاص
              مختلفين. بعض الأرقام تقديرية، وقد تعبّر عن مسجلين أو زوار وفق
              ملاحظات الفعالية.
            </p>
            <div className="mt-5">
              <h3 className="mb-2 font-heading text-base text-brand-primary">
                تفصيل السجل حسب السنة
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[420px] text-right text-sm">
                  <thead>
                    <tr className="border-b border-brand-primary/15 text-brand-muted">
                      <th scope="col" className="px-2 py-2 font-medium">السنة</th>
                      <th scope="col" className="px-2 py-2 font-medium">الفعاليات</th>
                      <th scope="col" className="px-2 py-2 font-medium">لها عدد</th>
                      <th scope="col" className="px-2 py-2 font-medium">دون عدد</th>
                      <th scope="col" className="px-2 py-2 font-medium">مجموع الأعداد</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overview.yearly.map((year) => (
                      <tr key={year.year} className="border-b border-brand-primary/10 last:border-0">
                        <th scope="row" className="px-2 py-2 font-medium text-brand-primary">
                          {year.year === "غير محددة" ? "غير محددة" : Number(year.year).toLocaleString("ar-EG", { useGrouping: false })}
                        </th>
                        <td className="px-2 py-2">{year.count.toLocaleString("ar-EG")}</td>
                        <td className="px-2 py-2">{year.recorded.toLocaleString("ar-EG")}</td>
                        <td className="px-2 py-2">{(year.count - year.recorded).toLocaleString("ar-EG")}</td>
                        <td className="px-2 py-2">
                          {year.recorded ? year.total.toLocaleString("ar-EG") : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
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
                      {event.eventDate ? (
                        <time dateTime={event.eventDate}>
                          {displayDate(event.eventDate)}
                        </time>
                      ) : (
                        <span>التاريخ غير محدد</span>
                      )}
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
                      <span>{event.responsible || "بدون مسؤول محدد"}</span>
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
          volunteers={volunteers}
          onSave={save}
          onDelete={remove}
          onClose={() => setEditing(undefined)}
        />
      )}
    </>
  );
}
