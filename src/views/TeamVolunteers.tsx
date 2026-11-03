"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  UsersRound,
} from "lucide-react";
import {
  filterVolunteers,
  PERSON_STATUSES,
  GENDERS,
  STUDY_YEARS,
  UNIVERSITIES,
} from "../../shared/team-options.js";
import PageHeading from "../components/shared/PageIdentity";
import PersonForm from "../components/Team/PersonForm";
import PersonDetails from "../components/Team/PersonDetails";
import VolunteerCard from "../components/Team/VolunteerCard";
import { teamRequest, type Volunteer, type VolunteerInput } from "../lib/team";
const PAGE_SIZE = 12;
export default function TeamVolunteers() {
  const [people, setPeople] = useState<Volunteer[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const [filters, setFilters] = useState({
      query: "",
      university: "",
      status: "",
      gender: "",
      studyYear: "",
    }),
    [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Volunteer | null>(null),
    [editing, setEditing] = useState<Volunteer | null | undefined>(undefined);
  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");
    try {
      const result = await teamRequest<{ volunteers: Volunteer[] }>({ signal });
      if (!signal?.aborted) setPeople(result.volunteers);
    } catch (reason) {
      if (!signal?.aborted)
        setError(
          reason instanceof Error ? reason.message : "تعذر تحميل المتطوعين.",
        );
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);
  const results = useMemo(
    () => filterVolunteers(people, filters),
    [people, filters],
  );
  const statuses = useMemo(
    () => [
      ...new Set([
        ...PERSON_STATUSES,
        ...people.map((person) => person.status).filter((status) => status && !PERSON_STATUSES.includes(status)),
      ]),
    ],
    [people],
  );
  const universities = useMemo(
    () => [...new Set([...UNIVERSITIES, ...people.map((person) => person.university).filter(Boolean)])],
    [people],
  );
  const studyYears = useMemo(
    () => [...new Set([...STUDY_YEARS, ...people.map((person) => person.studyYear).filter(Boolean)])],
    [people],
  );
  const pages = Math.max(1, Math.ceil(results.length / PAGE_SIZE)),
    current = Math.min(page, pages);
  const update = (key: keyof typeof filters, value: string) => {
    setFilters((previous) => ({ ...previous, [key]: value }));
    setPage(1);
  };
  async function remove(person: Volunteer) {
    await teamRequest<{ deleted: true }>({
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: person.id, revision: person.revision }),
    });
    setPeople((previous) => previous.filter((value) => value.id !== person.id));
    setSelected(null);
    setNotice(`تم حذف «${person.fullName}» من سجل المتطوعين.`);
  }
  async function save(person: VolunteerInput) {
    const result = await teamRequest<{ person: Volunteer }>({
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        person,
        ...(editing ? { id: editing.id, revision: editing.revision } : {}),
      }),
    });
    setPeople((previous) =>
      editing
        ? previous.map((value) =>
            value.id === result.person.id ? result.person : value,
          )
        : [...previous, result.person],
    );
    setEditing(undefined);
    setNotice(editing ? "تم حفظ البيانات." : "تمت إضافة المتطوع إلى سجل صحوة.");
    if (!editing) {
      setFilters({ query: "", university: "", status: "", gender: "", studyYear: "" });
      setPage(1);
    }
  }
  return (
    <>
      <Helmet>
        <title>المتطوعون | صحوة</title>
      </Helmet>
      <PageHeading
        title="أهل صحوة"
        description="سجل المتطوعين وبياناتهم ومجالات مشاركتهم في صحوة."
      />
      <section aria-label="دليل المتطوعين">
        <div className="team-directory-toolbar">
          <div className="flex items-center gap-3">
            <span className="team-icon team-icon-small">
              <UsersRound size={24} aria-hidden="true" />
            </span>
            <span className="text-sm text-brand-muted">
              {people.length.toLocaleString("ar-EG")} متطوع في السجل
            </span>
          </div>
          <div className="flex gap-2">
            <button
              className="team-button team-button-secondary"
              onClick={() => void load()}
              disabled={loading}
            >
              <RefreshCw size={16} aria-hidden="true" />
              تحديث
            </button>
            <button
              className="team-button"
              disabled={loading || Boolean(error)}
              onClick={() => {
                setNotice("");
                setEditing(null);
              }}
            >
              <Plus size={18} aria-hidden="true" />
              إضافة متطوع
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
        <div className="team-filter-panel team-simple-filters team-volunteer-filters">
          <label className="team-search">
            <span className="sr-only">البحث في المتطوعين</span>
            <Search size={20} aria-hidden="true" />
            <input
              type="search"
              value={filters.query}
              onChange={(event) => update("query", event.target.value)}
              placeholder="ابحث بالاسم…"
              maxLength={120}
            />
          </label>
          <label className="team-field">
            <span>الجامعة</span>
            <select
              value={filters.university}
              onChange={(event) => update("university", event.target.value)}
            >
              <option value="">كل الجامعات</option>
              {universities.map((university) => (
                <option key={university}>{university}</option>
              ))}
            </select>
          </label>
          <label className="team-field">
            <span>الحالة</span>
            <select
              value={filters.status}
              onChange={(event) => update("status", event.target.value)}
            >
              <option value="">كل الحالات</option>
              {statuses.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </label>
          <label className="team-field">
            <span>النوع</span>
            <select
              value={filters.gender}
              onChange={(event) => update("gender", event.target.value)}
            >
              <option value="">الكل</option>
              {GENDERS.map((gender) => (
                <option key={gender} value={gender}>{gender}</option>
              ))}
            </select>
          </label>
          <label className="team-field">
            <span>السنة الدراسية</span>
            <select
              value={filters.studyYear}
              onChange={(event) => update("studyYear", event.target.value)}
            >
              <option value="">كل السنوات</option>
              {studyYears.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </label>
        </div>
        <p className="team-results-count" role="status">
          {loading
            ? "جارٍ تحميل السجل…"
            : `${results.length.toLocaleString("ar-EG")} نتيجة`}
        </p>
        {loading ? (
          <div className="team-loading">
            <Loader2 className="animate-spin" aria-hidden="true" />
            <p>جارٍ تحميل بيانات المتطوعين…</p>
          </div>
        ) : !results.length ? (
          <div className="team-empty">
            <UsersRound size={38} aria-hidden="true" />
            <h3>
              {error
                ? "تعذر تحميل السجل"
                : people.length
                  ? "لا توجد نتائج مطابقة"
                  : "هنا يبدأ سجل أهل صحوة"}
            </h3>
            <p>
              {error
                ? "أعد المحاولة لعرض البيانات."
                : people.length
                  ? "غيّر البحث أو الفلاتر."
                  : "أضف أول متطوع وسجّل بياناته الأساسية من هنا."}
            </p>
          </div>
        ) : (
          <div className="team-people-grid">
            {results
              .slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)
              .map((person) => (
                <VolunteerCard
                  key={person.id}
                  person={person}
                  onOpen={() => setSelected(person)}
                />
              ))}
          </div>
        )}
        {pages > 1 && (
          <nav className="team-pagination" aria-label="صفحات المتطوعين">
            <button
              className="team-button team-button-secondary"
              disabled={current <= 1}
              onClick={() => setPage(current - 1)}
            >
              <ChevronRight size={16} aria-hidden="true" />
              السابق
            </button>
            <span>
              {current} / {pages}
            </span>
            <button
              className="team-button team-button-secondary"
              disabled={current >= pages}
              onClick={() => setPage(current + 1)}
            >
              التالي
              <ChevronLeft size={16} aria-hidden="true" />
            </button>
          </nav>
        )}
      </section>
      {editing !== undefined && (
        <PersonForm
          person={editing}
          onSave={save}
          onClose={() => setEditing(undefined)}
        />
      )}
      {selected && editing === undefined && (
        <PersonDetails
          person={selected}
          onClose={() => setSelected(null)}
          onEdit={() => {
            setEditing(selected);
            setSelected(null);
          }}
          onDelete={() => remove(selected)}
        />
      )}
    </>
  );
}
