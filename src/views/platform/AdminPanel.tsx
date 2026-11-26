"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { ChevronDown, Download, KeyRound, Loader2, Plus, RefreshCw, Search, ShieldCheck, UserPlus } from "lucide-react";
import PageHeading from "../../components/shared/PageIdentity";
import TeamDialog from "../../components/Team/TeamDialog";
import { teamRequest } from "../../lib/team";
import CreateAccountForm from "../../components/Team/CreateAccountForm";
import { UNIVERSITIES, normalizeSearch } from "../../../shared/team-options.js";

type Json = Record<string, unknown>;
const post = <T,>(body: Json) =>
  teamRequest<T>({ method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }, "/api/admin");
const get = <T,>(view: string) => teamRequest<T>({}, `/api/admin?view=${view}`);
const SECTOR: Record<string, string> = { youth: "الشباب", women: "الطالبات" };
const ACCOUNT_STATUS: Record<string, string> = { none: "بدون حساب", active: "فعال", suspended: "موقوف" };

export interface Credential {
  fullName: string;
  university?: string;
  role?: string;
  login: string;
  status: string;
  temporaryPassword?: string;
  expiresAt?: string;
}

// One-time credentials: shown here only, never stored in plain text.
export function CredentialsReport({ items, onClear }: { items: Credential[]; onClear: () => void }) {
  if (!items.length) return null;
  function download() {
    const rows = [
      ["اسم الشخص", "الجامعة", "الدور", "بيانات الدخول", "حالة الحساب", "كلمة المرور", "تنتهي في"],
      ...items.map((c) => [
        c.fullName,
        c.university || "",
        c.role || "",
        c.login,
        c.status,
        c.temporaryPassword || "",
        c.expiresAt ? new Date(c.expiresAt).toLocaleString("ar-EG") : "",
      ]),
    ];
    const csv = "\uFEFF" + rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `sahwa-accounts-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <section className="platform-card mb-6" aria-label="بيانات التفعيل" style={{ borderColor: "#D6AD63" }}>
      <div className="platform-row mb-3">
        <h2 className="font-heading flex items-center gap-2">
          <KeyRound size={19} aria-hidden="true" />
          بيانات الدخول (تظهر مرة واحدة)
        </h2>
        <div className="flex gap-2">
          <button type="button" className="team-button" onClick={download}>
            <Download size={16} aria-hidden="true" />
            تنزيل
          </button>
          <button type="button" className="team-button team-button-secondary" onClick={onClear}>
            إخفاء
          </button>
        </div>
      </div>
      <p className="platform-notice">
        سلّم كل شخص بياناته عبر وسيلة خاصة. لا يمكن عرض كلمة المرور مرة أخرى؛ عند فقدانها أعد ضبط الحساب.
      </p>
      <div className="platform-table-wrap">
        <table className="platform-table">
          <thead>
            <tr>
              <th>الاسم</th>
              <th>الجامعة</th>
              <th>الدور</th>
              <th>الدخول</th>
              <th>كلمة المرور</th>
            </tr>
          </thead>
          <tbody>
            {items.map((c, i) => (
              <tr key={i}>
                <td>{c.fullName}</td>
                <td>{c.university || "—"}</td>
                <td>{c.role || "—"}</td>
                <td className="platform-secret">{c.login}</td>
                <td>
                  {c.temporaryPassword ? (
                    <span className="platform-secret">{c.temporaryPassword}</span>
                  ) : (
                    "حساب موجود — لم تتغير كلمة مروره"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

interface AccountRow {
  volunteerId: string;
  fullName: string;
  university: string;
  role: { title: string; scope: string };
  roles?: { title: string; scope: string }[];
  account: { status: string; username?: string; email?: string | null; pending?: boolean; lastResetAt?: string; lastLoginAt?: string };
  canCreate: boolean;
  canReset: boolean;
  canSuspend: boolean;
}

function Accounts({ onCredentials }: { onCredentials: (c: Credential[]) => void }) {
  const [groups, setGroups] = useState<{ id: string; title: string; people: AccountRow[] }[] | null>(null);
  const [creatingFor, setCreatingFor] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [universityFilter, setUniversityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "none" | "active" | "suspended">("all");
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      setGroups((await get<{ groups: { id: string; title: string; people: AccountRow[] }[] }>("accounts")).groups);
    } catch (r) {
      setError(r instanceof Error ? r.message : "تعذر التحميل.");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const byId = useMemo(() => new Map((groups || []).flatMap((g) => g.people.map((p) => [p.volunteerId, p] as const))), [groups]);

  async function run(action: string, volunteerId: string) {
    setBusy(true);
    setError("");
    const person = byId.get(volunteerId);
    try {
      const r = await post<Json>({ action, volunteerId });
      if (r.temporaryPassword) {
        onCredentials([
          {
            fullName: person?.fullName || "",
            university: person?.university,
            role: person?.role.title,
            login: person?.account.email || String(r.username),
            status: "فعال",
            temporaryPassword: String(r.temporaryPassword),
            expiresAt: r.expiresAt as string | undefined,
          },
        ]);
      }
      await load();
    } catch (reason) {
      setError(`${person?.fullName || ""}: ${reason instanceof Error ? reason.message : "تعذر التنفيذ"}`);
    } finally {
      setBusy(false);
    }
  }

  const filteredGroups = useMemo(() => {
    if (!groups) return [];
    const q = normalizeSearch(query);
    return groups
      .filter((g) => !universityFilter || g.title === universityFilter)
      .map((g) => ({
        ...g,
        people: g.people.filter((p) => {
          if (statusFilter !== "all" && p.account.status !== statusFilter) return false;
          if (!q) return true;
          const hay = normalizeSearch(
            [p.fullName, p.university, p.role.title, ...(p.roles || []).map((r) => r.title), p.account.email || ""].join(" "),
          );
          return hay.includes(q);
        }),
      }))
      .filter((g) => g.people.length > 0);
  }, [groups, universityFilter, statusFilter, query]);

  if (!groups) {
    return error ? (
      <p className="team-error">{error}</p>
    ) : (
      <p className="team-loading">
        <Loader2 className="animate-spin" aria-hidden="true" /> جارٍ التحميل…
      </p>
    );
  }

  const totalCount = groups.reduce((acc, g) => acc + g.people.length, 0);

  return (
    <>
      <div className="platform-row mb-4">
        <p className="platform-muted">
          جميع الأشخاص ضمن نطاقك ({totalCount.toLocaleString("ar-EG")}) مقسّمين حسب الجامعة. أنشئ حسابًا لأي شخص ببريده وكلمة مرور فقط.
        </p>
        <button type="button" className="team-button team-button-secondary" onClick={() => void load()} disabled={busy}>
          <RefreshCw size={15} aria-hidden="true" />
          تحديث
        </button>
      </div>

      <div className="team-filter-panel mb-6">
        <div className="platform-grid platform-grid-3" style={{ marginBottom: 0 }}>
          <label className="team-search">
            <span className="sr-only">بحث بالاسم أو البريد</span>
            <Search size={18} aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث بالاسم أو الدور أو البريد…"
              maxLength={100}
            />
          </label>
          <label className="team-field">
            <span>الجامعة</span>
            <select value={universityFilter} onChange={(e) => setUniversityFilter(e.target.value)}>
              <option value="">كل الجامعات ({groups.length.toLocaleString("ar-EG")})</option>
              {groups.map((g) => (
                <option key={g.id} value={g.title}>
                  {g.title} ({g.people.length.toLocaleString("ar-EG")})
                </option>
              ))}
            </select>
          </label>
          <label className="team-field">
            <span>حالة الحساب</span>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}>
              <option value="all">الكل</option>
              <option value="none">بدون حساب</option>
              <option value="active">حساب فعال</option>
              <option value="suspended">حساب موقوف</option>
            </select>
          </label>
        </div>
      </div>

      {error && (
        <p className="team-error mb-4" role="alert">
          {error}
        </p>
      )}

      {filteredGroups.length ? (
        filteredGroups.map((g) => (
          <section key={g.id} className="mb-6">
            <h3 className="platform-section-title font-heading">
              {g.title} <small>{g.people.length.toLocaleString("ar-EG")}</small>
            </h3>
            <div className="platform-table-wrap">
              <table className="platform-table">
                <thead>
                  <tr>
                    <th>الاسم</th>
                    <th>الدور</th>
                    <th>البريد / الدخول</th>
                    <th>الحالة</th>
                    <th>إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {g.people.map((p) => [
                    <tr key={p.volunteerId}>
                      <td>
                        <strong>{p.fullName}</strong>
                      </td>
                      <td>
                        {p.roles && p.roles.length > 0 ? (
                          <div className="platform-chips">
                            {p.roles.map((r, i) => (
                              <span key={i} className="platform-chip">
                                {r.title}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="platform-muted">{p.role.title}</span>
                        )}
                      </td>
                      <td className="platform-ltr">{p.account.email || p.account.username || "—"}</td>
                      <td>
                        <span className={`platform-chip ${p.account.status === "active" ? "" : "platform-chip-muted"}`}>
                          {ACCOUNT_STATUS[p.account.status] || p.account.status}
                        </span>
                        {p.account.pending && p.account.status === "active" && (
                          <small className="platform-muted block">بانتظار أول دخول</small>
                        )}
                      </td>
                      <td className="whitespace-nowrap">
                        {p.account.status === "none" && p.canCreate && (
                          <button
                            type="button"
                            className="team-text-button"
                            disabled={busy}
                            onClick={() => setCreatingFor(creatingFor === p.volunteerId ? null : p.volunteerId)}
                          >
                            <UserPlus size={14} aria-hidden="true" />
                            إنشاء حساب
                          </button>
                        )}
                        {p.account.status !== "none" && p.canReset && (
                          <button
                            type="button"
                            className="team-text-button"
                            disabled={busy}
                            onClick={() =>
                              confirm(`إعادة ضبط كلمة مرور ${p.fullName}؟ سيتم توليد كلمة مرور مؤقتة جديدة.`) &&
                              void run("reset-account", p.volunteerId)
                            }
                          >
                            إعادة ضبط
                          </button>
                        )}
                        {p.account.status === "active" && p.canSuspend && (
                          <button
                            type="button"
                            className="team-text-button"
                            disabled={busy}
                            onClick={() => confirm(`إيقاف حساب ${p.fullName}؟`) && void run("suspend-account", p.volunteerId)}
                          >
                            إيقاف
                          </button>
                        )}
                        {p.account.status === "suspended" && p.canSuspend && (
                          <button type="button" className="team-text-button" disabled={busy} onClick={() => void run("reactivate-account", p.volunteerId)}>
                            إعادة تفعيل
                          </button>
                        )}
                      </td>
                    </tr>,
                    creatingFor === p.volunteerId && (
                      <tr key={`${p.volunteerId}-create`}>
                        <td colSpan={5}>
                          <CreateAccountForm
                            volunteerId={p.volunteerId}
                            fullName={p.fullName}
                            onCancel={() => setCreatingFor(null)}
                            onCreated={(a) => {
                              setCreatingFor(null);
                              onCredentials([
                                {
                                  fullName: a.fullName,
                                  university: p.university,
                                  role: p.role.title,
                                  login: a.email || a.username,
                                  status: "فعال",
                                  temporaryPassword: a.password,
                                },
                              ]);
                              void load();
                            }}
                          />
                        </td>
                      </tr>
                    ),
                  ])}
                </tbody>
              </table>
            </div>
          </section>
        ))
      ) : (
        <p className="platform-empty">لا توجد نتائج مطابقة.</p>
      )}
    </>
  );
}

interface Grant {
  id: string;
  fullName: string;
  permission: string;
  effect: string;
  university: string | null;
  sector: string | null;
  team: string | null;
  reason: string;
  expiresAt: string | null;
  grantedBy: string;
  createdAt: string;
}
interface PermissionDef {
  key: string;
  label: string;
  base?: boolean;
  delegable: boolean;
}
interface GrantPerson {
  id: string;
  fullName: string;
  university: string;
  roles?: string[];
}

function Grants() {
  const [data, setData] = useState<{
    grants: Grant[];
    people: GrantPerson[];
    permissions: PermissionDef[];
    teams: { id: string; title: string }[];
  } | null>(null);
  const [universityFilter, setUniversityFilter] = useState("");
  const [effect, setEffect] = useState<"allow" | "deny">("allow");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    try {
      setData(await get("grants"));
    } catch (r) {
      setError(r instanceof Error ? r.message : "تعذر التحميل.");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const groupedPeople = useMemo(() => {
    if (!data) return [];
    const map = new Map<string, GrantPerson[]>();
    for (const p of data.people) {
      const key = p.university || "مركزي / بدون جامعة";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    }
    return [...map.entries()]
      .sort(([a], [b]) => {
        if (a === "مركزي / بدون جامعة") return 1;
        if (b === "مركزي / بدون جامعة") return -1;
        return a.localeCompare(b, "ar");
      })
      .map(([university, people]) => ({ university, people }));
  }, [data]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const f = new FormData(event.currentTarget);
    setError("");
    setNotice("");
    try {
      await post({
        action: "grant",
        volunteerId: f.get("volunteerId"),
        permission: f.get("permission"),
        effect,
        university: f.get("university") || "",
        sector: f.get("sector") || "",
        team: f.get("team") || "",
        expiresOn: f.get("expiresOn") || "",
        reason: f.get("reason"),
      });
      setNotice(effect === "deny" ? "تم حفظ منع الصلاحية." : "تم منح الصلاحية.");
      (event.target as HTMLFormElement).reset();
      setEffect("allow");
      await load();
    } catch (r) {
      setError(r instanceof Error ? r.message : "تعذر الحفظ.");
    }
  }

  if (!data) {
    return error ? (
      <p className="team-error">{error}</p>
    ) : (
      <p className="team-loading">
        <Loader2 className="animate-spin" aria-hidden="true" /> جارٍ التحميل…
      </p>
    );
  }

  const label = (key: string) => data.permissions.find((p) => p.key === key)?.label || key;
  const visibleGroups = universityFilter ? groupedPeople.filter((g) => g.university === universityFilter) : groupedPeople;

  return (
    <>
      <p className="platform-muted mb-4">
        امنح صلاحية إضافية لشخص أو امنع عنه صفحة أو أداة معينة. المنع يتقدم على أي منح، وكل تغيير يُسجل تلقائيًا.
      </p>
      <form className="platform-card platform-form mb-6" onSubmit={submit}>
        <h3 className="font-heading flex items-center gap-2">
          <ShieldCheck size={18} aria-hidden="true" />
          منح صلاحية أو منعها
        </h3>

        <div className="platform-grid" style={{ marginBottom: 0 }}>
          <label className="team-field">
            <span>الجامعة <small>لتصفية القائمة</small></span>
            <select value={universityFilter} onChange={(e) => setUniversityFilter(e.target.value)}>
              <option value="">كل الجامعات</option>
              {groupedPeople.map((g) => (
                <option key={g.university} value={g.university}>
                  {g.university} ({g.people.length.toLocaleString("ar-EG")})
                </option>
              ))}
            </select>
          </label>

          <label className="team-field">
            <span>الشخص</span>
            <select name="volunteerId" required defaultValue="">
              <option value="" disabled>
                اختر الشخص مباشرة…
              </option>
              {visibleGroups.map((g) => (
                <optgroup key={g.university} label={g.university}>
                  {g.people.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.fullName}
                      {p.roles && p.roles.length > 0 ? ` — ${p.roles[0]}` : ""}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>

          <label className="team-field">
            <span>الصلاحية / الصفحة</span>
            <select name="permission" required>
              {data.permissions.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>

          <fieldset className="team-field">
            <legend className="text-[#350E15] font-medium text-[13px] mb-1">الإجراء</legend>
            <div className="platform-radio-group">
              <label className={`platform-radio-pill${effect === "allow" ? " is-selected" : ""}`}>
                <input type="radio" name="effectChoice" value="allow" checked={effect === "allow"} onChange={() => setEffect("allow")} />
                منح الصلاحية
              </label>
              <label className={`platform-radio-pill is-deny${effect === "deny" ? " is-selected" : ""}`}>
                <input type="radio" name="effectChoice" value="deny" checked={effect === "deny"} onChange={() => setEffect("deny")} />
                منع الصلاحية
              </label>
            </div>
          </fieldset>
        </div>

        <label className="team-field">
          <span>السبب</span>
          <input name="reason" required maxLength={300} placeholder="مثال: تنسيق فعالية الاستقبال" />
        </label>

        <details className="platform-details">
          <summary>
            تحديد نطاق أو مدة محددة (اختياري — الافتراضي بدون تقييد)
            <ChevronDown size={17} aria-hidden="true" />
          </summary>
          <div className="platform-grid" style={{ marginBottom: 0 }}>
            <label className="team-field">
              <span>نطاق الجامعة</span>
              <select name="university" defaultValue="">
                <option value="">أي جامعة</option>
                {UNIVERSITIES.map((u: string) => (
                  <option key={u}>{u}</option>
                ))}
                <option value="*central*">المركزي فقط</option>
              </select>
            </label>
            <label className="team-field">
              <span>نطاق القطاع</span>
              <select name="sector" defaultValue="">
                <option value="">أي قطاع</option>
                <option value="youth">الشباب</option>
                <option value="women">الطالبات</option>
              </select>
            </label>
            <label className="team-field">
              <span>نطاق الفريق</span>
              <select name="team" defaultValue="">
                <option value="">أي فريق</option>
                {data.teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="team-field">
              <span>تنتهي في</span>
              <input type="date" name="expiresOn" />
            </label>
          </div>
        </details>

        {error && (
          <p className="team-error" role="alert">
            {error}
          </p>
        )}
        {notice && (
          <p className="team-success" role="status">
            {notice}
          </p>
        )}
        <div>
          <button type="submit" className="team-button">
            حفظ الصلاحية
          </button>
        </div>
      </form>

      <h3 className="platform-section-title font-heading">الصلاحيات الإضافية الفعالة</h3>
      {data.grants.length ? (
        <div className="platform-table-wrap">
          <table className="platform-table">
            <thead>
              <tr>
                <th>الشخص</th>
                <th>الصلاحية</th>
                <th>النطاق</th>
                <th>السبب</th>
                <th>المانح</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.grants.map((g) => (
                <tr key={g.id}>
                  <td>{g.fullName}</td>
                  <td>
                    {g.effect === "deny" ? <strong className="text-red-800">منع: </strong> : "منح: "}
                    {label(g.permission)}
                  </td>
                  <td>
                    {[
                      g.university === "*central*" ? "المركزي" : g.university,
                      g.sector && SECTOR[g.sector],
                      g.team && data.teams.find((t) => t.id === g.team)?.title,
                    ]
                      .filter(Boolean)
                      .join(" — ") || "الكل"}
                    {g.expiresAt && (
                      <>
                        <br />
                        <small>حتى {new Date(g.expiresAt).toLocaleDateString("ar-EG")}</small>
                      </>
                    )}
                  </td>
                  <td>{g.reason}</td>
                  <td>{g.grantedBy}</td>
                  <td>
                    <button
                      type="button"
                      className="team-text-button"
                      onClick={async () => {
                        if (!confirm("إلغاء هذه الصلاحية؟")) return;
                        try {
                          await post({ action: "revoke-grant", grantId: g.id });
                          await load();
                        } catch (r) {
                          setError(r instanceof Error ? r.message : "تعذر الإلغاء.");
                        }
                      }}
                    >
                      إلغاء
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="platform-empty">لا توجد صلاحيات إضافية حاليًا.</p>
      )}
    </>
  );
}

interface FieldDef {
  id: string;
  label: string;
  type: string;
  required: boolean;
  options?: string[];
}
interface FormDef {
  id?: string;
  title: string;
  description: string;
  fields: FieldDef[];
  audience: { sectors: string[] };
  active: boolean;
  confidential: boolean;
  sortOrder: number;
  revision?: number;
  routing: Json;
}

const NEW_FORM_TEMPLATE = (defaultRole: string): FormDef => ({
  title: "",
  description: "",
  fields: [
    { id: "title", label: "العنوان", type: "short_text", required: true },
    { id: "details", label: "التفاصيل", type: "long_text", required: true },
  ],
  audience: { sectors: ["youth", "women"] },
  active: true,
  confidential: false,
  sortOrder: 50,
  routing: { by: "fixed", role: defaultRole },
});

function Forms() {
  const [data, setData] = useState<{ forms: FormDef[]; routeRoles: { id: string; title: string }[] } | null>(null);
  const [editing, setEditing] = useState<FormDef | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setData(await teamRequest({}, "/api/forms?view=manage"));
    } catch (r) {
      setError(r instanceof Error ? r.message : "تعذر التحميل.");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (!data) {
    return error ? (
      <p className="team-error">{error}</p>
    ) : (
      <p className="team-loading">
        <Loader2 className="animate-spin" aria-hidden="true" /> جارٍ التحميل…
      </p>
    );
  }

  const routeLabel = (r: Json) =>
    r.by === "fixed"
      ? data.routeRoles.find((x) => x.id === r.role)?.title || String(r.role)
      : `جامعي: ${data.routeRoles.find((x) => x.id === r.university)?.title || r.university} / مركزي: ${data.routeRoles.find((x) => x.id === r.central)?.title || r.central}`;

  return (
    <>
      <div className="platform-row mb-4">
        <p className="platform-muted">
          أضف نماذج جديدة أو عدّل النماذج الحالية وحدد الجهة المستقبلة للطلبات دون تعديل الكود.
        </p>
        <button
          type="button"
          className="team-button"
          onClick={() => setEditing(NEW_FORM_TEMPLATE(data.routeRoles[0]?.id || "internal-activities-lead"))}
        >
          <Plus size={16} aria-hidden="true" />
          إضافة نموذج جديد
        </button>
      </div>
      <div className="platform-list">
        {data.forms.map((f) => (
          <div key={f.id} className="platform-item">
            <div className="platform-row">
              <h4>{f.title}</h4>
              <span className="platform-chip">
                {f.active ? "مفعل" : "معطل"}
                {f.confidential ? " — سري" : ""}
              </span>
            </div>
            <p>{f.description}</p>
            <p>
              الحقول: {f.fields.map((x) => x.label).join("، ")} · الجهة المستقبلة:{" "}
              {f.confidential ? "مجلس المتابعة والمراجعة والتظلمات (غير مفعل)" : routeLabel(f.routing)}
            </p>
            <button type="button" className="team-text-button" onClick={() => setEditing(f)}>
              تعديل
            </button>
          </div>
        ))}
      </div>
      {editing && (
        <FormEditor
          form={editing}
          routeRoles={data.routeRoles}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            void load();
          }}
        />
      )}
    </>
  );
}

function FormEditor({
  form,
  routeRoles,
  onClose,
  onSaved,
}: {
  form: FormDef;
  routeRoles: { id: string; title: string }[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const isNew = !form.id;
  const [draft, setDraft] = useState<FormDef>(form);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const routingBy = draft.routing?.by === "scope" ? "scope" : "fixed";
  const setField = (i: number, patch: Partial<FieldDef>) =>
    setDraft((d) => ({ ...d, fields: d.fields.map((f, j) => (j === i ? { ...f, ...patch } : f)) }));

  function setRoutingMode(mode: "fixed" | "scope") {
    setDraft((d) => {
      let nextFields = d.fields;
      if (mode === "scope" && !nextFields.some((f) => f.id === "scope")) {
        nextFields = [
          ...nextFields,
          { id: "scope", label: "النطاق", type: "select", required: true, options: ["جامعي", "مركزي"] },
        ];
      }
      return {
        ...d,
        fields: nextFields,
        routing:
          mode === "fixed"
            ? { by: "fixed", role: String(d.routing?.role || routeRoles[0]?.id || "media-lead") }
            : {
                by: "scope",
                university: String(d.routing?.university || "internal-activities-lead"),
                central: String(d.routing?.central || "central-activities-lead"),
              },
      };
    });
  }

  async function save() {
    setBusy(true);
    setError("");
    try {
      await teamRequest(
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "save-form",
            ...(form.id ? { id: form.id, revision: form.revision } : {}),
            form: draft,
          }),
        },
        "/api/forms",
      );
      onSaved();
    } catch (r) {
      setError(r instanceof Error ? r.message : "تعذر الحفظ.");
      setBusy(false);
    }
  }

  return (
    <TeamDialog title={isNew ? "إضافة نموذج جديد" : `تعديل: ${form.title}`} onClose={onClose} busy={busy}>
      <div className="team-form-body platform-form">
        <label className="team-field">
          <span>عنوان النموذج</span>
          <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} maxLength={120} placeholder="مثال: طلب تطوع أو اقتراح نشاط" />
        </label>
        <label className="team-field">
          <span>وصف مختصر</span>
          <textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} maxLength={600} />
        </label>

        {!form.confidential && (
          <fieldset className="team-field">
            <legend className="text-[#350E15] font-medium text-[13px] mb-1">أين تصل طلبات هذا النموذج؟</legend>
            <div className="platform-radio-group mb-2">
              <label className={`platform-radio-pill${routingBy === "fixed" ? " is-selected" : ""}`}>
                <input type="radio" name="routingBy" checked={routingBy === "fixed"} onChange={() => setRoutingMode("fixed")} />
                جهة واحدة محددة
              </label>
              <label className={`platform-radio-pill${routingBy === "scope" ? " is-selected" : ""}`}>
                <input type="radio" name="routingBy" checked={routingBy === "scope"} onChange={() => setRoutingMode("scope")} />
                حسب النطاق (جامعي / مركزي)
              </label>
            </div>
            {routingBy === "fixed" ? (
              <select
                aria-label="الجهة المستقبلة"
                value={String(draft.routing?.role || "")}
                onChange={(e) => setDraft({ ...draft, routing: { by: "fixed", role: e.target.value } })}
              >
                {routeRoles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title}
                  </option>
                ))}
              </select>
            ) : (
              <div className="platform-grid" style={{ marginBottom: 0 }}>
                <label className="team-field">
                  <span>إذا اختار «جامعي» يصل إلى</span>
                  <select
                    value={String(draft.routing?.university || "")}
                    onChange={(e) => setDraft({ ...draft, routing: { ...draft.routing, by: "scope", university: e.target.value } })}
                  >
                    {routeRoles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.title}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="team-field">
                  <span>إذا اختار «مركزي» يصل إلى</span>
                  <select
                    value={String(draft.routing?.central || "")}
                    onChange={(e) => setDraft({ ...draft, routing: { ...draft.routing, by: "scope", central: e.target.value } })}
                  >
                    {routeRoles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.title}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            )}
          </fieldset>
        )}

        <fieldset className="team-field">
          <legend className="text-[#350E15] font-medium text-[13px] mb-1">حقول النموذج</legend>
          {draft.fields.map((f, i) => (
            <div key={i} className="platform-item">
              <div className="flex flex-wrap gap-2 items-center">
                <input aria-label="اسم الحقل" value={f.label} onChange={(e) => setField(i, { label: e.target.value })} maxLength={120} />
                <select
                  aria-label="نوع الحقل"
                  value={f.type}
                  onChange={(e) => setField(i, { type: e.target.value, options: e.target.value === "select" ? f.options || [] : undefined })}
                  disabled={f.id === "scope" && routingBy === "scope"}
                >
                  <option value="short_text">نص قصير</option>
                  <option value="long_text">نص طويل</option>
                  <option value="select">اختيارات</option>
                  <option value="url">رابط</option>
                </select>
                <label className="platform-check">
                  <input
                    type="checkbox"
                    checked={f.required}
                    onChange={(e) => setField(i, { required: e.target.checked })}
                    disabled={f.id === "scope" && routingBy === "scope"}
                  />
                  مطلوب
                </label>
                {!(f.id === "scope" && routingBy === "scope") && (
                  <button
                    type="button"
                    className="team-text-button"
                    onClick={() => setDraft((d) => ({ ...d, fields: d.fields.filter((_, j) => j !== i) }))}
                  >
                    حذف
                  </button>
                )}
              </div>
              {f.type === "select" && (
                <input
                  className="mt-2"
                  aria-label="الخيارات"
                  value={(f.options || []).join("، ")}
                  onChange={(e) =>
                    setField(i, {
                      options: e.target.value
                        .split(/[،,]/)
                        .map((o) => o.trim())
                        .filter(Boolean),
                    })
                  }
                  disabled={f.id === "scope" && routingBy === "scope"}
                  placeholder="خيار 1، خيار 2، خيار 3"
                />
              )}
            </div>
          ))}
          {draft.fields.length < 20 && (
            <button
              type="button"
              className="team-text-button"
              onClick={() =>
                setDraft((d) => ({
                  ...d,
                  fields: [...d.fields, { id: `f${Date.now().toString(36)}`, label: "سؤال جديد", type: "short_text", required: false }],
                }))
              }
            >
              <Plus size={15} aria-hidden="true" />
              إضافة حقل
            </button>
          )}
        </fieldset>

        <fieldset className="team-field">
          <legend className="text-[#350E15] font-medium text-[13px] mb-1">من يستطيع استخدامه</legend>
          <div className="flex flex-wrap gap-4">
            {(["youth", "women"] as const).map((s) => (
              <label key={s} className="platform-check">
                <input
                  type="checkbox"
                  checked={draft.audience.sectors.includes(s)}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      audience: {
                        sectors: e.target.checked ? [...draft.audience.sectors, s] : draft.audience.sectors.filter((x) => x !== s),
                      },
                    })
                  }
                />
                {SECTOR[s]}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="platform-check">
          <input
            type="checkbox"
            checked={draft.active}
            disabled={form.confidential}
            onChange={(e) => setDraft({ ...draft, active: e.target.checked })}
          />
          مفعل ويظهر للأعضاء
        </label>
        {form.confidential && (
          <p className="platform-notice">لا يُفعّل نموذج الشكاوى قبل اعتماد جهة استقبال مستقلة ومسار وصول آمن.</p>
        )}
        {error && (
          <p className="team-error" role="alert">
            {error}
          </p>
        )}
        <div className="team-dialog-footer">
          <button type="button" className="team-button team-button-secondary" onClick={onClose} disabled={busy}>
            إلغاء
          </button>
          <button type="button" className="team-button" onClick={() => void save()} disabled={busy}>
            {busy && <Loader2 size={15} className="animate-spin" aria-hidden="true" />}
            {isNew ? "إنشاء النموذج" : "حفظ التعديلات"}
          </button>
        </div>
      </div>
    </TeamDialog>
  );
}

const ACTIONS: Record<string, string> = {
  "volunteer.create": "إضافة متطوع",
  "volunteer.edit": "تعديل بيانات متطوع",
  "volunteer.archive": "أرشفة متطوع",
  "volunteer.restore": "استرجاع متطوع",
  "volunteer.level": "تغيير المستوى التنظيمي",
  "role.assign": "إسناد دور",
  "role.end": "إنهاء دور",
  "account.create": "إنشاء حساب",
  "account.reset": "إعادة ضبط حساب",
  "account.suspend": "إيقاف حساب",
  "account.reactivate": "إعادة تفعيل حساب",
  "account.password-change": "تغيير كلمة المرور",
  "permission.grant": "منح صلاحية",
  "permission.deny": "منع صلاحية",
  "permission.revoke": "إلغاء صلاحية",
  "settings.update": "تعديل الإعدادات",
  "form.save": "تعديل نموذج",
  "post.publish": "نشر في أهل صحوة",
};

function Audit() {
  const [log, setLog] = useState<{ id: string; actor: string; action: string; details: Json; createdAt: string; targetName: string | null }[] | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    get<{ log: typeof log }>("audit")
      .then((d) => setLog(d.log))
      .catch((r) => setError(r instanceof Error ? r.message : "تعذر التحميل."));
  }, []);
  if (!log) {
    return error ? (
      <p className="team-error">{error}</p>
    ) : (
      <p className="team-loading">
        <Loader2 className="animate-spin" aria-hidden="true" /> جارٍ التحميل…
      </p>
    );
  }
  return log.length ? (
    <div className="platform-table-wrap">
      <table className="platform-table">
        <thead>
          <tr>
            <th>الوقت</th>
            <th>المنفذ</th>
            <th>الإجراء</th>
            <th>الشخص المعني</th>
            <th>تفاصيل</th>
          </tr>
        </thead>
        <tbody>
          {log.map((e) => (
            <tr key={e.id}>
              <td className="whitespace-nowrap">{new Date(e.createdAt).toLocaleString("ar-EG")}</td>
              <td>{e.actor}</td>
              <td>{ACTIONS[e.action] || e.action}</td>
              <td>{e.targetName || "—"}</td>
              <td className="platform-muted">
                {Object.entries(e.details || {})
                  .filter(([k]) => !["id", "assignmentId"].includes(k))
                  .map(([k, v]) => `${k}: ${v ?? "—"}`)
                  .join(" · ")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <p className="platform-empty">لا توجد تغييرات مسجلة بعد.</p>
  );
}

function Settings({ showArchived }: { showArchived: boolean }) {
  const [value, setValue] = useState<string | null>(null);
  const [archived, setArchived] = useState<{ id: string; fullName: string; university: string; archivedAt: string }[] | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const loadArchived = useCallback(() => {
    if (!showArchived) return;
    get<{ people: { id: string; fullName: string; university: string; archivedAt: string }[] }>("archived")
      .then((d) => setArchived(d.people))
      .catch(() => {});
  }, [showArchived]);

  useEffect(() => {
    get<{ settings: Record<string, string> }>("settings")
      .then((d) => setValue(d.settings["directory.crossSector"]))
      .catch((r) => setError(r instanceof Error ? r.message : "تعذر التحميل."));
    loadArchived();
  }, [loadArchived]);

  async function save(next: string) {
    setError("");
    setNotice("");
    try {
      await post({ action: "settings", key: "directory.crossSector", value: next });
      setValue(next);
      setNotice("تم الحفظ.");
    } catch (r) {
      setError(r instanceof Error ? r.message : "تعذر الحفظ.");
    }
  }

  if (value === null) {
    return error ? (
      <p className="team-error">{error}</p>
    ) : (
      <p className="team-loading">
        <Loader2 className="animate-spin" aria-hidden="true" />
      </p>
    );
  }

  return (
    <div className="platform-form" style={{ maxWidth: 680 }}>
      <section className="platform-card platform-form">
        <h3 className="font-heading">الاطلاع بين الشباب والطالبات في دليل فريق صحوة</h3>
        <p className="platform-muted">زملاء الفرق المشتركة (الإعلام والعلاقات) يرون بعضهم في كل الحالات.</p>
        {[
          ["none", "لا يظهر القطاع الآخر"],
          ["leads", "يظهر من القطاع الآخر شاغلو المناصب الرسمية فقط (الاسم والدور) — الافتراضي"],
          ["all", "يظهر الجميع للجميع"],
        ].map(([k, l]) => (
          <label key={k} className="platform-check">
            <input type="radio" name="crossSector" checked={value === k} onChange={() => void save(k)} />
            {l}
          </label>
        ))}
        {notice && <p className="team-success" role="status">{notice}</p>}
        {error && <p className="team-error" role="alert">{error}</p>}
      </section>

      {showArchived && (
        <section className="platform-card">
          <h3 className="font-heading mb-3">السجلات المؤرشفة</h3>
          {!archived ? (
            <p className="platform-muted">جارٍ التحميل…</p>
          ) : archived.length ? (
            <div className="platform-list">
              {archived.map((p) => (
                <div key={p.id} className="platform-item platform-row">
                  <span>
                    {p.fullName} — {p.university}{" "}
                    <small className="platform-muted">أُرشف {new Date(p.archivedAt).toLocaleDateString("ar-EG")}</small>
                  </span>
                  <button
                    type="button"
                    className="team-text-button"
                    onClick={async () => {
                      await post({ action: "restore", volunteerId: p.id });
                      loadArchived();
                    }}
                  >
                    استرجاع
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="platform-empty">لا توجد سجلات مؤرشفة.</p>
          )}
        </section>
      )}
    </div>
  );
}

const TABS = [
  { id: "accounts", label: "الحسابات", needs: "accounts" },
  { id: "grants", label: "الصلاحيات", needs: "grants" },
  { id: "forms", label: "النماذج", needs: "forms" },
  { id: "audit", label: "سجل التغييرات", needs: "audit" },
  { id: "settings", label: "الإعدادات", needs: "settings" },
] as const;

export default function AdminPanel({ abilities, initialTab }: { abilities: Record<string, boolean>; initialTab?: string }) {
  const tabs = TABS.filter((t) => abilities[t.needs]);
  const defaultTab = tabs.some((t) => t.id === initialTab) ? (initialTab as string) : tabs[0]?.id || "accounts";
  const [tab, setTab] = useState<string>(defaultTab);
  const [credentials, setCredentials] = useState<Credential[]>([]);

  return (
    <>
      <PageHeading title="لوحة التحكم" description="إدارة الحسابات والصلاحيات والنماذج والإعدادات." />
      <CredentialsReport items={credentials} onClear={() => setCredentials([])} />
      <div className="platform-tabs" role="tablist" aria-label="أقسام لوحة التحكم">
        {tabs.map((t) => (
          <button
            key={t.id}
            id={`admin-tab-${t.id}`}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === "accounts" && <Accounts onCredentials={(c) => setCredentials((prev) => [...prev, ...c])} />}
      {tab === "grants" && <Grants />}
      {tab === "forms" && <Forms />}
      {tab === "audit" && <Audit />}
      {tab === "settings" && <Settings showArchived={Boolean(abilities.global)} />}
    </>
  );
}
