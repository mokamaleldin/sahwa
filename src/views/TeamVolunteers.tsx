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
  UserRound,
  UsersRound,
} from "lucide-react";
import {
  filterVolunteers,
  PERSON_STATUSES,
} from "../../shared/team-options.js";
import PageHeading from "../components/shared/PageIdentity";
import PersonForm from "../components/Team/PersonForm";
import PersonDetails from "../components/Team/PersonDetails";
import { teamRequest, type Volunteer, type VolunteerInput } from "../lib/team";
import { useSession } from "../auth/useSession";
import { Link } from "../lib/navigation";

const PAGE_SIZE = 12;
export default function TeamVolunteers() {
  const { refresh } = useSession();
  const [people, setPeople] = useState<Volunteer[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const [filters, setFilters] = useState({
      query: "",
      university: "",
      status: "",
    }),
    [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Volunteer | null>(null),
    [editing, setEditing] = useState<Volunteer | undefined>(undefined);
  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");
    try {
      const data = await teamRequest<{ volunteers: Volunteer[] }>({ signal });
      if (!signal?.aborted) setPeople(data.volunteers);
    } catch (e) {
      if (!signal?.aborted)
        setError(e instanceof Error ? e.message : "تعذر تحميل الدليل.");
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
  const universities = useMemo(
    () =>
      [...new Set(people.map((p) => p.university))].sort((a, b) =>
        a.localeCompare(b, "ar"),
      ),
    [people],
  );
  const pages = Math.max(1, Math.ceil(results.length / PAGE_SIZE)),
    current = Math.min(page, pages);
  async function save(person: VolunteerInput) {
    if (!editing) return;
    const data = await teamRequest<{ person: Volunteer }>({
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        person,
        id: editing.id,
        revision: editing.revision,
      }),
    });
    setPeople((p) => p.map((v) => (v.id === data.person.id ? data.person : v)));
    setEditing(undefined);
    setNotice("تم حفظ البيانات الأساسية.");
    await refresh({ force: true });
  }
  const update = (key: keyof typeof filters, value: string) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  };
  return (
    <>
      <Helmet>
        <title>المتطوعون | صحوة</title>
      </Helmet>
      <PageHeading
        title="أهل صحوة"
        description="بيانات أهل صحوة الأساسية وفرقهم ومسؤولياتهم."
      />
      <section aria-label="دليل المتطوعين">
        <div className="team-directory-toolbar">
          <div className="flex items-center gap-3">
            <span className="team-icon team-icon-small">
              <UsersRound size={24} />
            </span>
            <span className="text-sm text-brand-muted">
              {people.length.toLocaleString("ar-EG")} متطوع في الدليل
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
            <Link className="team-button" to="/team/accounts#account-form">
              <Plus size={18} />
              إنشاء حساب لمتطوع
            </Link>
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
            <button onClick={() => void load()} className="underline">
              إعادة المحاولة
            </button>
          </p>
        )}
        <div className="team-filter-panel team-simple-filters">
          <label className="team-search">
            <span className="sr-only">البحث في المتطوعين</span>
            <Search size={20} />
            <input
              type="search"
              placeholder="ابحث بالاسم أو الجامعة أو التخصص…"
              value={filters.query}
              onChange={(e) => update("query", e.target.value)}
              maxLength={120}
            />
          </label>
          <label className="team-field">
            <span>الجامعة</span>
            <select
              value={filters.university}
              onChange={(e) => update("university", e.target.value)}
            >
              <option value="">كل الجامعات</option>
              {universities.map((u) => (
                <option key={u}>{u}</option>
              ))}
            </select>
          </label>
          <label className="team-field">
            <span>الحالة</span>
            <select
              value={filters.status}
              onChange={(e) => update("status", e.target.value)}
            >
              <option value="">كل الحالات</option>
              {PERSON_STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
        </div>
        <p className="team-results-count" role="status">
          {loading
            ? "جارٍ تحميل الدليل…"
            : `${results.length.toLocaleString("ar-EG")} نتيجة`}
        </p>
        {loading ? (
          <div className="team-loading">
            <Loader2 className="animate-spin" />
            <p>جارٍ تحميل بيانات الفريق…</p>
          </div>
        ) : !results.length ? (
          <div className="team-empty">
            <UsersRound size={38} />
            <h3>
              {error
                ? "تعذر تحميل الدليل"
                : people.length
                  ? "لا توجد نتائج مطابقة"
                  : "هنا يبدأ دليل أهل صحوة"}
            </h3>
            <p>
              {error
                ? "أعد المحاولة لعرض البيانات."
                : people.length
                  ? "غيّر البحث أو الفلاتر."
                  : "أنشئ حساب المتطوع من صفحة إدارة الحسابات، ثم أكمل بياناته هنا."}
            </p>
          </div>
        ) : (
          <div className="team-people-grid">
            {results
              .slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)
              .map((person) => (
                <button
                  key={person.id}
                  className="team-person-card"
                  onClick={() => setSelected(person)}
                  aria-label={`عرض بيانات ${person.fullName}`}
                >
                  <div className="team-person-card-top">
                    <span className="team-avatar">
                      <UserRound size={26} />
                    </span>
                    <span
                      className={`team-status${person.status === "نشط" ? " team-status-active" : ""}`}
                    >
                      {person.status}
                    </span>
                  </div>
                  <h3>{person.fullName}</h3>
                  <p className="team-person-university">{person.university}</p>
                  <p className="team-person-major">
                    {[person.major, person.studyYear]
                      .filter(Boolean)
                      .join(" · ") || "—"}
                  </p>
                  <div className="team-person-role">
                    <strong>{person.responsibility || "متطوع"}</strong>
                    <span>{person.team || "الفريق العام"}</span>
                  </div>
                  <span className="team-person-open">
                    عرض الملف
                    <ChevronLeft size={16} />
                  </span>
                </button>
              ))}
          </div>
        )}
        {pages > 1 && (
          <nav className="team-pagination" aria-label="صفحات المتطوعين">
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
        />
      )}
    </>
  );
}
