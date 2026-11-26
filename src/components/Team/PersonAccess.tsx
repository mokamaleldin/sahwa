import { useState, type FormEvent } from "react";
import { KeyRound, Loader2, Plus, X } from "lucide-react";
import { teamRequest, type Volunteer, type VolunteerMeta } from "../../lib/team";
import { UNIVERSITIES } from "../../../shared/team-options.js";
import OrganizationalRoleOptions from "./OrganizationalRoleOptions";
import CreateAccountForm from "./CreateAccountForm";

const ACCOUNT_STATUS: Record<string, string> = { none: "لا يوجد حساب دخول", active: "فعال", suspended: "موقوف" };
const LEVELS = ["متطوع", "عضو فاعل", "مسؤول"];
const SECTOR: Record<string, string> = { youth: "الشباب", women: "الطالبات" };

export interface IssuedCredential { fullName: string; username: string; temporaryPassword: string; expiresAt: string }

const admin = <T,>(body: Record<string, unknown>) => teamRequest<T>({ method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }, "/api/admin");

// Roles, membership level and login account of one volunteer. Every action
// is checked again on the server; the buttons only reflect what it allows.
export default function PersonAccess({ person, meta, onChanged }: { person: Volunteer; meta: VolunteerMeta; onChanged: () => Promise<void> | void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [replacing, setReplacing] = useState<string | null>(null);
  const [roleId, setRoleId] = useState("");
  const [issued, setIssued] = useState<IssuedCredential | null>(null);
  const [password, setPassword] = useState("");
  const [creating, setCreating] = useState(false);
  const allowed = person.allowed;
  const role = meta.assignableRoles.find((r) => r.id === roleId);
  const women = person.gender === "بنت";
  async function act<T>(body: Record<string, unknown>, after?: (r: T) => void) {
    setBusy(true);
    setError("");
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
    void act({ action: replacing ? "replace-role" : "assign-role", assignmentId: replacing, volunteerId: person.id, roleId, university: form.get("university"), startsOn: form.get("startsOn") }, () => { setAdding(false); setReplacing(null); setRoleId(""); });
  }
  const credential = (r: { fullName: string; username: string; temporaryPassword?: string; chosenPassword?: boolean; expiresAt?: string | null }) => {
    const secret = r.temporaryPassword || (r.chosenPassword ? password : "");
    if (secret) setIssued({ fullName: r.fullName, username: r.username, temporaryPassword: secret, expiresAt: r.expiresAt || "" });
  };
  const chosen = password ? { password } : {};
  if (!allowed) return null;
  return (
    <section className="mt-6" aria-label="الأدوار والحساب">
      <h3 className="platform-section-title font-heading" style={{ marginTop: 0 }}>الأدوار التنظيمية</h3>
      {person.assignments.length ? (
        <ul className="platform-list">
          {person.assignments.map((a) => (
            <li key={a.id} className="platform-item platform-row">
              <span><strong>{a.title}</strong> <span className="platform-muted">— {a.scope}{a.deferred ? " — مساحة العمل مؤجلة" : ""}</span></span>
              {a.canChange && (<>
                <button className="team-text-button" disabled={busy} onClick={() => {setReplacing(a.id); setRoleId(a.roleId); setAdding(true);}}>تعديل التكليف</button>
                <button className="team-text-button" disabled={busy} onClick={() => confirm(`إنهاء دور «${a.title}»؟ يبقى سجل الشخص وحسابه.`) && void act({ action: "end-role", assignmentId: a.id })}><X size={14} />إنهاء الدور</button></>
              )}
            </li>
          ))}
        </ul>
      ) : <p className="platform-muted">لا يوجد دور مسند. {person.responsibility && `المسمى المسجل سابقًا: ${person.responsibility}.`}</p>}
      {allowed.assign && meta.assignableRoles.length > 0 && (adding ? (
        <form className="platform-item platform-form mt-3" onSubmit={assign}>
          <label className="team-field"><span>الدور</span>
            <select value={roleId} onChange={(e) => setRoleId(e.target.value)} required>
              <option value="">اختر من التصنيفات المعتمدة</option>
              <OrganizationalRoleOptions roles={meta.assignableRoles} women={women} />
            </select>
          </label>
          {role?.scope === "university" && (
            <label className="team-field"><span>الجامعة</span>
              <select name="university" defaultValue={person.university}>{[...new Set([person.university, ...UNIVERSITIES])].filter(Boolean).map((u) => <option key={u}>{u}</option>)}</select>
            </label>
          )}
          {role && role.sector !== "none" && <p className="platform-muted">القطاع: {SECTOR[role.sector === "required" ? (women ? "women" : "youth") : role.sector]} (بحسب النوع المسجل)</p>}
          <label className="team-field"><span>بداية التكليف <small>اختياري</small></span><input type="date" name="startsOn" /></label>
          <p className="platform-muted">الإضافة التقنية لا تعني تعيينًا إداريًا نافذًا؛ تُعتمد التعيينات وفق النظام.</p>
          <div className="flex gap-2"><button className="team-button" disabled={busy || !roleId}>إسناد</button><button type="button" className="team-button team-button-secondary" onClick={() => setAdding(false)}>إلغاء</button></div>
        </form>
      ) : <button className="team-text-button mt-2" onClick={() => {setReplacing(null); setRoleId(""); setAdding(true);}}><Plus size={15} />إضافة دور</button>)}

      {allowed.level && (
        <label className="team-field mt-4" style={{ maxWidth: 260 }}><span>المستوى التنظيمي</span>
          <select value={person.membershipLevel || "متطوع"} disabled={busy} onChange={(e) => void act({ action: "set-level", volunteerId: person.id, level: e.target.value })}>
            {LEVELS.map((l) => <option key={l}>{l}</option>)}
          </select>
        </label>
      )}

      {person.account && (
        <>
          <h3 className="platform-section-title font-heading">حساب الدخول</h3>
          <p className="platform-muted">
            الحالة: <strong>{ACCOUNT_STATUS[person.account.status] || person.account.status}</strong>
            {person.account.email && <> · البريد: <span className="platform-secret">{person.account.email}</span></>}
            {person.account.username && <> · اسم المستخدم: <span className="platform-secret">{person.account.username}</span></>}
            {person.account.pending && person.account.status === "active" && " · بانتظار أول دخول"}
            {person.account.lastResetAt && ` · آخر إعادة ضبط: ${new Date(person.account.lastResetAt).toLocaleDateString("ar-EG")}`}
          </p>
          {creating && (
            <div className="mt-2"><CreateAccountForm volunteerId={person.id} fullName={person.fullName} onCancel={() => setCreating(false)}
              onCreated={async (a) => { setCreating(false); setIssued({ fullName: a.fullName, username: a.email ? `${a.email} (${a.username})` : a.username, temporaryPassword: a.password, expiresAt: a.expiresAt || "" }); await onChanged(); }} /></div>
          )}
          {allowed.resetAccount && person.account.status !== "none" && (
            <label className="team-field mt-2" style={{ maxWidth: 320 }}><span>كلمة مرور جديدة عند إعادة الضبط <small>اختياري؛ فارغة = كلمة مؤقتة تلقائية</small></span>
              <input type="text" dir="ltr" value={password} onChange={(e) => setPassword(e.target.value)} maxLength={128} autoComplete="off" />
            </label>
          )}
          <div className="flex flex-wrap gap-2 mt-2">
            {person.account.status === "none" && allowed.createAccount && !creating && <button className="team-button" disabled={busy} onClick={() => setCreating(true)}><KeyRound size={15} />إنشاء حساب</button>}
            {person.account.status !== "none" && allowed.resetAccount && <button className="team-button team-button-secondary" disabled={busy} onClick={() => confirm("إعادة ضبط الحساب؟ ستتوقف كلمة المرور الحالية وتنتهي الجلسات.") && void act({ action: "reset-account", volunteerId: person.id, ...chosen }, credential)}>إعادة ضبط كلمة المرور</button>}
            {person.account.status === "active" && allowed.suspendAccount && <button className="team-button team-button-secondary" disabled={busy} onClick={() => confirm("إيقاف الحساب؟ يُمنع الدخول فورًا.") && void act({ action: "suspend-account", volunteerId: person.id })}>إيقاف الحساب</button>}
            {person.account.status === "suspended" && allowed.suspendAccount && <button className="team-button" disabled={busy} onClick={() => void act({ action: "reactivate-account", volunteerId: person.id })}>إعادة التفعيل</button>}
          </div>
        </>
      )}
      {busy && <p className="team-loading"><Loader2 size={16} className="animate-spin" aria-hidden="true" /></p>}
      {error && <p className="team-error mt-3" role="alert">{error}</p>}
      {issued && (
        <div className="platform-notice mt-3" role="status">
          <strong>بيانات الدخول لـ {issued.fullName} (تظهر مرة واحدة):</strong><br />
          الدخول بـ: <span className="platform-secret">{issued.username}</span> · كلمة المرور المؤقتة: <span className="platform-secret">{issued.temporaryPassword}</span><br />
          {issued.expiresAt && `تنتهي في ${new Date(issued.expiresAt).toLocaleString("ar-EG")}. `}سلّمها للشخص عبر وسيلة خاصة.
        </div>
      )}
    </section>
  );
}
