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
  UserPlus,
  UsersRound,
} from "lucide-react";
import {
  filterVolunteers,
  GENDERS,
  STUDY_YEARS,
  UNIVERSITIES,
  normalizeSearch,
} from "../../shared/team-options.js";
import PageHeading from "../components/shared/PageIdentity";
import PersonForm from "../components/Team/PersonForm";
import PersonDetails from "../components/Team/PersonDetails";
import VolunteerCard from "../components/Team/VolunteerCard";
import TeamDialog from "../components/Team/TeamDialog";
import {
  teamRequest,
  type RoleOptionMeta,
  type Volunteer,
  type VolunteerCandidate,
  type VolunteerInput,
  type VolunteerMeta,
} from "../lib/team";

const PAGE_SIZE = 12;

function roleLabel(role: RoleOptionMeta, gender?: string) {
  return gender === "بنت" && role.titleWomen ? role.titleWomen : role.title;
}

function RecruitDialog({
  candidates,
  roles,
  onClose,
  onRecruited,
}: {
  candidates: VolunteerCandidate[];
  roles: RoleOptionMeta[];
  onClose: () => void;
  onRecruited: (name: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [chosenRoles, setChosenRoles] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const rolesById = useMemo(() => new Map(roles.map((r) => [r.id, r])), [roles]);

  const filtered = useMemo(() => {
    const q = normalizeSearch(query);
    return candidates.filter((c) => {
      if (!q) return true;
      return normalizeSearch([c.name, c.university, ...c.groups].join(" ")).includes(q);
    });
  }, [candidates, query]);

  async function recruit(candidate: VolunteerCandidate) {
    const selectedRoleId = chosenRoles[candidate.id] || candidate.roleIds[0];
    const role = rolesById.get(selectedRoleId);
    if (!role) return;
    setBusyId(candidate.id);
    setError("");
    try {
      await teamRequest(
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "assign-role",
            volunteerId: candidate.id,
            roleId: selectedRoleId,
            ...(role.scope === "university" ? { university: candidate.university } : {}),
          }),
        },
        "/api/admin",
      );
      onRecruited(candidate.name);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "تعذر ضم المتطوع إلى الفريق.");
      setBusyId(null);
    }
  }

  return (
    <TeamDialog title="ضم متطوع موجود إلى الفريق" onClose={onClose} busy={Boolean(busyId)}>
      <div className="team-form-body">
        <p className="platform-muted mb-4">
          اختر شخصًا مسجلًا بالفعل في صحوة لضمّه إلى فريقك دون إنشاء سجل مكرر.
        </p>
        <label className="team-search mb-4">
          <span className="sr-only">ابحث في المتطوعين الموجودين</span>
          <Search size={18} aria-hidden="true" />
          <input
            type="search"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث بالاسم أو الجامعة أو الفريق الحالي…"
            maxLength={100}
          />
        </label>
        {error && (
          <p className="team-error mb-3" role="alert">
            {error}
          </p>
        )}
        {filtered.length ? (
          <div className="platform-list">
            {filtered.slice(0, 40).map((c) => {
              const selectedId = chosenRoles[c.id] || c.roleIds[0];
              const options = c.roleIds
                .map((id) => rolesById.get(id))
                .filter((r): r is RoleOptionMeta => Boolean(r));
              return (
                <div key={c.id} className="platform-item">
                  <div className="platform-row">
                    <div>
                      <h4 className="font-heading text-brand-primary">{c.name}</h4>
                      <p className="platform-muted">
                        {[c.university, c.gender].filter(Boolean).join(" · ")}
                        {c.groups.length ? ` — ${c.groups.join("، ")}` : ""}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {options.length > 1 ? (
                        <select
                          aria-label={`الدور لـ ${c.name}`}
                          className="rounded-xl border border-[#75202624] bg-[#faf4ee] px-3 py-2 text-xs"
                          value={selectedId}
                          disabled={Boolean(busyId)}
                          onChange={(e) =>
                            setChosenRoles((prev) => ({ ...prev, [c.id]: e.target.value }))
                          }
                        >
                          {options.map((r) => (
                            <option key={r.id} value={r.id}>
                              {roleLabel(r, c.gender)}
                            </option>
                          ))}
                        </select>
                      ) : (
                        options[0] && (
                          <span className="platform-chip">{roleLabel(options[0], c.gender)}</span>
                        )
                      )}
                      <button
                        type="button"
                        className="team-button"
                        disabled={Boolean(busyId)}
                        onClick={() => void recruit(c)}
                      >
                        {busyId === c.id ? (
                          <Loader2 size={15} className="animate-spin" aria-hidden="true" />
                        ) : (
                          <UserPlus size={15} aria-hidden="true" />
                        )}
                        ضم للفريق
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            {filtered.length > 40 && (
              <p className="platform-muted text-center">
                يُعرض أول 40 نتيجة — استخدم البحث للوصول السريع للشخص المطلوب.
              </p>
            )}
          </div>
        ) : (
          <p className="platform-empty">لا يوجد متطوعون مطابقون للبحث.</p>
        )}
      </div>
      <div className="team-dialog-footer">
        <button
          type="button"
          className="team-button team-button-secondary"
          onClick={onClose}
          disabled={Boolean(busyId)}
        >
          إغلاق
        </button>
      </div>
    </TeamDialog>
  );
}

export default function TeamVolunteers({ assignment = "" }: { assignment?: string } = {}) {
  const [people, setPeople] = useState<Volunteer[]>([]),
    [candidates, setCandidates] = useState<VolunteerCandidate[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const [filters, setFilters] = useState({
      query: "",
      university: "",
      status: "",
      gender: "",
      studyYear: "",
      roleState: "",
    }),
    [page, setPage] = useState(1);
  const [meta, setMeta] = useState<VolunteerMeta | undefined>(undefined);
  const [selected, setSelected] = useState<Volunteer | null>(null),
    [editing, setEditing] = useState<Volunteer | null | undefined>(undefined),
    [recruiting, setRecruiting] = useState(false);

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");
    try {
      const result = await teamRequest<{
        volunteers: Volunteer[];
        candidates?: VolunteerCandidate[];
        meta?: VolunteerMeta;
      }>(
        { signal },
        assignment ? `/api/team?assignment=${encodeURIComponent(assignment)}` : "/api/team",
      );
      if (!signal?.aborted) {
        setPeople(result.volunteers);
        setCandidates(result.candidates || []);
        setMeta(result.meta);
        setSelected((current) =>
          current ? result.volunteers.find((v) => v.id === current.id) || null : null,
        );
      }
    } catch (reason) {
      if (!signal?.aborted)
        setError(
          reason instanceof Error ? reason.message : "تعذر تحميل المتطوعين.",
        );
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [assignment]);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const hasOversight = useMemo(() => people.some((p) => p.allowed?.oversightOnly), [people]);
  const hasUnassigned = useMemo(
    () => people.some((p) => p.assignments && p.assignments.length === 0),
    [people],
  );

  const results = useMemo(() => {
    const scoped = people.filter((p) => {
      if (filters.status) {
        const active = p.status === "نشط";
        if (filters.status === "نشط" ? !active : active) return false;
      }
      if (filters.roleState === "assigned" && !p.assignments?.length) return false;
      if (filters.roleState === "unassigned" && p.assignments?.length) return false;
      if (filters.roleState === "direct" && p.allowed?.oversightOnly) return false;
      if (filters.roleState === "oversight" && !p.allowed?.oversightOnly) return false;
      return true;
    });
    return filterVolunteers(scoped, { ...filters, status: "" });
  }, [people, filters]);

  const statuses = ["نشط", "غير نشط"];
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
    setNotice(`تمت أرشفة «${person.fullName}».`);
  }

  async function save(person: VolunteerInput, options?: { confirmDuplicate?: boolean }) {
    const result = await teamRequest<{ person: Volunteer }>({
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        person,
        ...(person.assignmentRoleId ? { assignment: { roleId: person.assignmentRoleId } } : {}),
        ...(options?.confirmDuplicate ? { confirmDuplicate: true } : {}),
        ...(editing ? { id: editing.id, revision: editing.revision } : {}),
      }),
    });
    setPeople((previous) =>
      editing
        ? previous.map((value) =>
            value.id === result.person.id ? { ...value, ...result.person } : value,
          )
        : [...previous, { ...result.person, assignments: result.person.assignments ?? [] }],
    );
    setEditing(undefined);
    if (meta) await load();
    setNotice(editing ? "تم حفظ البيانات." : "تمت إضافة المتطوع إلى سجل صحوة.");
    if (!editing) {
      setFilters({ query: "", university: "", status: "", gender: "", studyYear: "", roleState: "" });
      setPage(1);
    }
  }

  return (
    <>
      <Helmet>
        <title>المتطوعون | صحوة</title>
      </Helmet>
      <PageHeading
        title={meta?.globalAdmin ? "إدارة المتطوعين والحسابات" : "إدارة فريقي"}
        description="سجل المتطوعين وبياناتهم وأدوارهم وحساباتهم في نطاقك."
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
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="team-button team-button-secondary"
              onClick={() => void load()}
              disabled={loading}
            >
              <RefreshCw size={16} aria-hidden="true" />
              تحديث
            </button>
            {meta?.canAssign && candidates.length > 0 && (
              <button
                type="button"
                className="team-button team-button-secondary"
                disabled={loading || Boolean(error)}
                onClick={() => {
                  setNotice("");
                  setRecruiting(true);
                }}
              >
                <UserPlus size={17} aria-hidden="true" />
                ضم متطوع موجود
              </button>
            )}
            {meta?.canCreate !== false && (
              <button
                type="button"
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
            )}
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
        <div className="team-filter-panel team-simple-filters team-volunteer-filters">
          <label className="team-search">
            <span className="sr-only">البحث في المتطوعين</span>
            <Search size={20} aria-hidden="true" />
            <input
              type="search"
              value={filters.query}
              onChange={(event) => update("query", event.target.value)}
              placeholder="ابحث بالاسم أو الدور أو اللجنة…"
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
                <option key={gender} value={gender}>
                  {gender}
                </option>
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
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </label>
        </div>
        {(hasUnassigned || hasOversight) && (
          <div className="platform-tabs mt-4" role="tablist" aria-label="تصفية حسب التكليف">
            <button
              type="button"
              role="tab"
              aria-selected={filters.roleState === ""}
              onClick={() => update("roleState", "")}
            >
              الكل ({people.length.toLocaleString("ar-EG")})
            </button>
            {hasUnassigned && (
              <>
                <button
                  type="button"
                  role="tab"
                  aria-selected={filters.roleState === "assigned"}
                  onClick={() => update("roleState", "assigned")}
                >
                  لديهم دور مسند
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={filters.roleState === "unassigned"}
                  onClick={() => update("roleState", "unassigned")}
                >
                  دون دور مسند ({people.filter((p) => !p.assignments?.length).length.toLocaleString("ar-EG")})
                </button>
              </>
            )}
            {hasOversight && (
              <>
                <button
                  type="button"
                  role="tab"
                  aria-selected={filters.roleState === "direct"}
                  onClick={() => update("roleState", "direct")}
                >
                  فريقي المباشر
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={filters.roleState === "oversight"}
                  onClick={() => update("roleState", "oversight")}
                >
                  تبع الجامعات للعرض
                </button>
              </>
            )}
          </div>
        )}
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
                  : "أضف أول متطوع أو ضم متطوعًا موجودًا إلى فريقك من هنا."}
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
              type="button"
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
              type="button"
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
      {recruiting && meta && (
        <RecruitDialog
          candidates={candidates}
          roles={meta.assignableRoles}
          onClose={() => setRecruiting(false)}
          onRecruited={(name) => {
            setRecruiting(false);
            setNotice(`تم ضم «${name}» إلى الفريق بنجاح.`);
            void load();
          }}
        />
      )}
      {editing !== undefined && (
        <PersonForm
          person={editing}
          roles={meta?.assignableRoles}
          volunteers={people}
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
          meta={meta}
          onChanged={() => load()}
        />
      )}
    </>
  );
}
