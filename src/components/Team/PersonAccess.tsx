import { useState, type FormEvent } from "react";
import { Check, Copy, KeyRound, Loader2, Plus, RefreshCw, ShieldAlert, X } from "lucide-react";
import { teamRequest, type Volunteer, type VolunteerMeta } from "../../lib/team";
import { UNIVERSITIES } from "../../../shared/team-options.js";
import OrganizationalRoleOptions from "./OrganizationalRoleOptions";
import CreateAccountForm from "./CreateAccountForm";

const ACCOUNT_STATUS: Record<string, string> = {
  none: "لا يوجد حساب دخول",
  active: "فعال",
  suspended: "موقوف",
};
const LEVELS = ["متطوع", "عضو فاعل", "مسؤول"];
const SECTOR: Record<string, string> = { youth: "الشباب", women: "الطالبات" };

export interface IssuedCredential {
  fullName: string;
  username: string;
  temporaryPassword: string;
  expiresAt: string;
}

const admin = <T,>(body: Record<string, unknown>) =>
  teamRequest<T>(
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
    "/api/admin",
  );

// Roles, membership level and login account of one volunteer.
// Supports `mode="roles"` | `mode="account"` | `mode="all"` so PersonDetails
// can separate role management cleanly from account management.
export default function PersonAccess({
  person,
  meta,
  onChanged,
  mode = "all",
}: {
  person: Volunteer;
  meta: VolunteerMeta;
  onChanged: () => Promise<void> | void;
  mode?: "roles" | "account" | "all";
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [adding, setAdding] = useState(false);
  const [replacing, setReplacing] = useState<string | null>(null);
  const [roleId, setRoleId] = useState("");
  const [issued, setIssued] = useState<IssuedCredential | null>(null);
  const [copied, setCopied] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [password, setPassword] = useState("");
  const allowed = person.allowed;
  const role = meta.assignableRoles.find((r) => r.id === roleId);
  const women = person.gender === "بنت";

  async function act<T>(body: Record<string, unknown>, after?: (r: T) => void) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const result = await admin<T>(body);
      after?.(result);
      await onChanged();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "تعذر تنفيذ الإجراء.");
    } finally {
      setBusy(false);
    }
  }

  function assign(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    void act(
      {
        action: replacing ? "replace-role" : "assign-role",
        assignmentId: replacing,
        volunteerId: person.id,
        roleId,
        university: form.get("university"),
        startsOn: form.get("startsOn"),
      },
      () => {
        setAdding(false);
        setReplacing(null);
        setRoleId("");
        setNotice(replacing ? "تم تحديث الدور التنظيمي." : "تم إسناد الدور بنجاح.");
      },
    );
  }

  const credential = (r: {
    fullName: string;
    username: string;
    temporaryPassword?: string;
    chosenPassword?: boolean;
    expiresAt?: string | null;
  }) => {
    const secret = r.temporaryPassword || (r.chosenPassword ? password : "");
    if (secret) {
      setIssued({
        fullName: r.fullName,
        username: r.username,
        temporaryPassword: secret,
        expiresAt: r.expiresAt || "",
      });
      setCopied(false);
    }
    setResetOpen(false);
    setPassword("");
  };

  async function copyCredentials() {
    if (!issued) return;
    const text = `بيانات الدخول لمنصة صحوة (${issued.fullName}):\nاسم الدخول: ${issued.username}\nكلمة المرور المؤقتة: ${issued.temporaryPassword}\nرابط الدخول: https://sahwa.world/login`;
    try {
      await navigator.clipboard?.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  if (!allowed) return null;
  const showRoles = mode === "roles" || mode === "all";
  const showAccount = mode === "account" || mode === "all";

  return (
    <section aria-label={mode === "roles" ? "الأدوار التنظيمية" : mode === "account" ? "حساب الدخول" : "الأدوار والحساب"}>
      {showRoles && (
        <div>
          <div className="platform-row mb-3">
            <h3 className="font-heading text-base text-brand-primary m-0">الأدوار التنظيمية</h3>
            {allowed.assign && meta.assignableRoles.length > 0 && !adding && (
              <button
                type="button"
                className="team-button"
                onClick={() => {
                  setReplacing(null);
                  setRoleId("");
                  setAdding(true);
                }}
                disabled={busy}
              >
                <Plus size={15} aria-hidden="true" />
                إضافة دور
              </button>
            )}
          </div>

          {person.assignments.length ? (
            <ul className="platform-list">
              {person.assignments.map((a) => (
                <li key={a.id} className="platform-item platform-row">
                  <div>
                    <strong className="text-[#350E15]">{a.title}</strong>
                    <p className="platform-muted">
                      {a.scope}
                      {a.teamTitle ? ` · ${a.teamTitle}` : ""}
                      {a.deferred ? " · مساحة العمل مؤجلة" : ""}
                    </p>
                  </div>
                  {a.canChange && (
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="team-text-button"
                        disabled={busy}
                        onClick={() => {
                          setReplacing(a.id);
                          setRoleId(a.roleId);
                          setAdding(true);
                        }}
                      >
                        تغيير الدور
                      </button>
                      <button
                        type="button"
                        className="team-text-button team-delete-action"
                        disabled={busy}
                        onClick={() =>
                          confirm(`إنهاء دور «${a.title}»؟ يبقى سجل الشخص وحسابه.`) &&
                          void act({ action: "end-role", assignmentId: a.id }, () => setNotice("تم إنهاء الدور."))
                        }
                      >
                        <X size={14} aria-hidden="true" />
                        إنهاء الدور
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="platform-empty">
              لا يوجد دور تنظيمي مسند حاليًا.
              {person.responsibility && ` (المسمى السابق: ${person.responsibility})`}
            </p>
          )}

          {allowed.assign && meta.assignableRoles.length > 0 && adding && (
            <form className="platform-item platform-form mt-3" onSubmit={assign}>
              <h4 className="font-heading text-sm text-brand-primary m-0">
                {replacing ? "تغيير الدور الحالي" : "إسناد دور جديد"}
              </h4>
              <label className="team-field">
                <span>الدور *</span>
                <select value={roleId} onChange={(e) => setRoleId(e.target.value)} required>
                  <option value="">اختر من التصنيفات المعتمدة</option>
                  <OrganizationalRoleOptions roles={meta.assignableRoles} women={women} />
                </select>
              </label>
              {role?.scope === "university" && (
                <label className="team-field">
                  <span>الجامعة</span>
                  <select name="university" defaultValue={person.university}>
                    {[...new Set([person.university, ...UNIVERSITIES])].filter(Boolean).map((u) => (
                      <option key={u}>{u}</option>
                    ))}
                  </select>
                </label>
              )}
              {role && role.sector !== "none" && (
                <p className="platform-muted">
                  القطاع: {SECTOR[role.sector === "required" ? (women ? "women" : "youth") : role.sector]} (بحسب النوع المسجل)
                </p>
              )}
              <label className="team-field">
                <span>
                  بداية التكليف <small>اختياري</small>
                </span>
                <input type="date" name="startsOn" />
              </label>
              <div className="flex flex-wrap gap-2">
                <button type="submit" className="team-button" disabled={busy || !roleId}>
                  {replacing ? "حفظ التغيير" : "إسناد الدور"}
                </button>
                <button
                  type="button"
                  className="team-button team-button-secondary"
                  onClick={() => {
                    setAdding(false);
                    setReplacing(null);
                  }}
                >
                  إلغاء
                </button>
              </div>
            </form>
          )}

          {allowed.level && (
            <div className="platform-item mt-4">
              <label className="team-field" style={{ maxWidth: 280 }}>
                <span>
                  المستوى التنظيمي <small>متطوع / عضو فاعل / مسؤول</small>
                </span>
                <select
                  value={person.membershipLevel || "متطوع"}
                  disabled={busy}
                  onChange={(e) =>
                    void act(
                      { action: "set-level", volunteerId: person.id, level: e.target.value },
                      () => setNotice("تم تحديث المستوى التنظيمي."),
                    )
                  }
                >
                  {LEVELS.map((l) => (
                    <option key={l}>{l}</option>
                  ))}
                </select>
              </label>
            </div>
          )}
        </div>
      )}

      {showAccount && person.account && (
        <div className={mode === "all" ? "mt-6" : ""}>
          {person.account.status === "none" ? (
            allowed.createAccount ? (
              <CreateAccountForm
                volunteerId={person.id}
                fullName={person.fullName}
                onCreated={async (a) => {
                  setIssued({
                    fullName: a.fullName,
                    username: a.email ? `${a.email} (${a.username})` : a.username,
                    temporaryPassword: a.password,
                    expiresAt: a.expiresAt || "",
                  });
                  setCopied(false);
                  await onChanged();
                }}
              />
            ) : (
              <p className="platform-empty">لا يوجد حساب دخول لهذا المتطوع حاليًا.</p>
            )
          ) : (
            <div className="platform-item platform-form">
              <div className="platform-row">
                <div>
                  <h3 className="font-heading text-base text-brand-primary m-0">حساب الدخول</h3>
                  <p className="platform-muted mt-1">
                    {person.account.pending && person.account.status === "active"
                      ? "بانتظار أول دخول وتغيير كلمة المرور المؤقتة"
                      : person.account.lastLoginAt
                        ? `آخر دخول: ${new Date(person.account.lastLoginAt).toLocaleDateString("ar-EG")}`
                        : "لم يسجل الدخول بعد"}
                  </p>
                </div>
                <span
                  className={`platform-chip${person.account.status === "active" ? "" : " platform-chip-muted"}`}
                >
                  {ACCOUNT_STATUS[person.account.status] || person.account.status}
                </span>
              </div>

              <dl className="team-detail-grid">
                <div>
                  <dt>اسم المستخدم</dt>
                  <dd>
                    <span className="platform-secret">{person.account.username}</span>
                  </dd>
                </div>
                <div>
                  <dt>البريد الإلكتروني</dt>
                  <dd>
                    {person.account.email ? (
                      <span className="platform-secret">{person.account.email}</span>
                    ) : (
                      "—"
                    )}
                  </dd>
                </div>
              </dl>

              <div className="flex flex-wrap gap-2">
                {allowed.resetAccount && (
                  <button
                    type="button"
                    className="team-button team-button-secondary"
                    disabled={busy}
                    onClick={() => {
                      setResetOpen((v) => !v);
                      setError("");
                    }}
                  >
                    <RefreshCw size={15} aria-hidden="true" />
                    إعادة ضبط كلمة المرور
                  </button>
                )}
                {person.account.status === "active" && allowed.suspendAccount && (
                  <button
                    type="button"
                    className="team-button team-button-secondary"
                    disabled={busy}
                    onClick={() =>
                      confirm("إيقاف الحساب؟ يُمنع الدخول فورًا.") &&
                      void act({ action: "suspend-account", volunteerId: person.id }, () =>
                        setNotice("تم إيقاف الحساب."),
                      )
                    }
                  >
                    <ShieldAlert size={15} aria-hidden="true" />
                    إيقاف الحساب
                  </button>
                )}
                {person.account.status === "suspended" && allowed.suspendAccount && (
                  <button
                    type="button"
                    className="team-button"
                    disabled={busy}
                    onClick={() =>
                      void act({ action: "reactivate-account", volunteerId: person.id }, () =>
                        setNotice("تمت إعادة تفعيل الحساب."),
                      )
                    }
                  >
                    <KeyRound size={15} aria-hidden="true" />
                    إعادة التفعيل
                  </button>
                )}
              </div>

              {resetOpen && allowed.resetAccount && (
                <div className="rounded-xl border border-[#75202620] bg-[#faf4ee] p-4 platform-form">
                  <p className="platform-muted">
                    ستتوقف كلمة المرور الحالية وتنتهي جلسات المتطوع فورًا، وسيُطلب منه اختيار كلمة مرور جديدة عند الدخول.
                  </p>
                  <label className="team-field">
                    <span>
                      كلمة مرور محددة <small>اختياري — اتركه فارغًا لتوليد كلمة مؤقتة تلقائيًا</small>
                    </span>
                    <input
                      type="text"
                      dir="ltr"
                      autoCorrect="off"
                      autoCapitalize="none"
                      spellCheck={false}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      maxLength={128}
                      autoComplete="off"
                      placeholder="فارغ = كلمة مؤقتة تلقائية"
                    />
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="team-button"
                      disabled={busy}
                      onClick={() =>
                        void act(
                          {
                            action: "reset-account",
                            volunteerId: person.id,
                            ...(password ? { password } : {}),
                          },
                          credential,
                        )
                      }
                    >
                      تأكيد إعادة الضبط
                    </button>
                    <button
                      type="button"
                      className="team-button team-button-secondary"
                      disabled={busy}
                      onClick={() => {
                        setResetOpen(false);
                        setPassword("");
                      }}
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {busy && (
        <p className="team-loading" role="status">
          <Loader2 size={16} className="animate-spin" aria-hidden="true" />
        </p>
      )}
      {notice && (
        <p className="team-success mt-3" role="status">
          {notice}
        </p>
      )}
      {error && (
        <p className="team-error mt-3" role="alert">
          {error}
        </p>
      )}
      {issued && (
        <div className="platform-notice mt-3" role="status">
          <div className="platform-row mb-2">
            <strong>بيانات الدخول لـ {issued.fullName} (تظهر مرة واحدة):</strong>
            <button type="button" className="team-text-button" onClick={() => void copyCredentials()}>
              {copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
              {copied ? "تم النسخ" : "نسخ البيانات"}
            </button>
          </div>
          الدخول بـ: <span className="platform-secret">{issued.username}</span> · كلمة المرور المؤقتة:{" "}
          <span className="platform-secret">{issued.temporaryPassword}</span>
          <br />
          {issued.expiresAt && `تنتهي في ${new Date(issued.expiresAt).toLocaleString("ar-EG")}. `}سلّمها للشخص عبر وسيلة خاصة.
        </div>
      )}
    </section>
  );
}
