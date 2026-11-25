"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Download, KeyRound, Loader2, RefreshCw, ShieldCheck, UserPlus } from "lucide-react";
import PageHeading from "../../components/shared/PageIdentity";
import TeamDialog from "../../components/Team/TeamDialog";
import { teamRequest } from "../../lib/team";
import CreateAccountForm from "../../components/Team/CreateAccountForm";
import { UNIVERSITIES } from "../../../shared/team-options.js";

type Json = Record<string, unknown>;
const post = <T,>(body: Json) => teamRequest<T>({ method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }, "/api/admin");
const get = <T,>(view: string) => teamRequest<T>({}, `/api/admin?view=${view}`);
const SECTOR: Record<string, string> = { youth: "الشباب", women: "الطالبات" };
const ACCOUNT_STATUS: Record<string, string> = { none: "لا يوجد حساب", active: "فعال", suspended: "موقوف" };

export interface Credential { fullName: string; university?: string; role?: string; username: string; status: string; temporaryPassword?: string; expiresAt?: string }

// One-time credentials: shown here only, never stored in plain text.
export function CredentialsReport({ items, onClear }: { items: Credential[]; onClear: () => void }) {
  if (!items.length) return null;
  function download() {
    const rows = [["اسم الشخص", "الجامعة", "الدور", "الدخول", "حالة الحساب", "كلمة المرور", "تنتهي في"], ...items.map((c) => [c.fullName, c.university || "", c.role || "", c.username, c.status, c.temporaryPassword || "", c.expiresAt ? new Date(c.expiresAt).toLocaleString("ar-EG") : ""])];
    const csv = "﻿" + rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `sahwa-activation-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <section className="platform-card mb-6" aria-label="تقرير بيانات التفعيل" style={{ borderColor: "#D6AD63" }}>
      <div className="platform-row mb-3">
        <h2 className="font-heading flex items-center gap-2"><KeyRound size={19} aria-hidden="true" />بيانات الدخول (تظهر مرة واحدة)</h2>
        <div className="flex gap-2">
          <button className="team-button" onClick={download}><Download size={16} aria-hidden="true" />تنزيل التقرير</button>
          <button className="team-button team-button-secondary" onClick={onClear}>إخفاء</button>
        </div>
      </div>
      <p className="platform-notice">سلّم كل شخص بياناته عبر وسيلة خاصة. الكلمات المولدة تلقائيًا تنتهي بعد 7 أيام. لا تُحفظ هذه البيانات في المنصة ولا في GitHub، ولا يمكن عرضها مرة أخرى؛ عند فقدانها أعد ضبط الحساب.</p>
      <div className="platform-table-wrap">
        <table className="platform-table">
          <thead><tr><th>اسم الشخص</th><th>الجامعة</th><th>الدور</th><th>الدخول (البريد / اسم المستخدم)</th><th>حالة الحساب</th><th>كلمة المرور</th></tr></thead>
          <tbody>{items.map((c, i) => (
            <tr key={i}><td>{c.fullName}</td><td>{c.university}</td><td>{c.role}</td><td className="platform-secret">{c.username}</td><td>{c.status}</td><td>{c.temporaryPassword ? <span className="platform-secret">{c.temporaryPassword}</span> : "حساب موجود — لم تتغير كلمة مروره"}</td></tr>
          ))}</tbody>
        </table>
      </div>
    </section>
  );
}

interface Official {
  volunteerId: string; fullName: string; university: string; role: { title: string; scope: string };
  account: { status: string; username?: string; email?: string | null; pending?: boolean; lastResetAt?: string; lastLoginAt?: string };
  canCreate: boolean; canReset: boolean; canSuspend: boolean;
}

function Officials({ onCredentials }: { onCredentials: (c: Credential[]) => void }) {
  const [groups, setGroups] = useState<{ id: string; title: string; people: Official[] }[] | null>(null);
  const [creatingFor, setCreatingFor] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [requireChange, setRequireChange] = useState(true);
  const load = useCallback(async () => {
    setError("");
    try { setGroups((await get<{ groups: { id: string; title: string; people: Official[] }[] }>("officials")).groups); } catch (r) { setError(r instanceof Error ? r.message : "تعذر التحميل."); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  const byId = useMemo(() => new Map((groups || []).flatMap((g) => g.people.map((p) => [p.volunteerId, p] as const))), [groups]);
  async function run(action: string, ids: string[]) {
    setBusy(true);
    setError("");
    const results: Credential[] = [];
    for (const id of ids) {
      const person = byId.get(id);
      try {
        const withPassword = (action === "create-account" || action === "reset-account") && password ? { password, requireChange } : {};
        const r = await post<Json>({ action, volunteerId: id, ...withPassword });
        if (r.temporaryPassword || r.existing || r.chosenPassword) results.push({ fullName: person?.fullName || "", university: person?.university, role: person?.role.title, username: String(r.username), status: r.existing ? ACCOUNT_STATUS[String(r.status)] || String(r.status) : "فعال", temporaryPassword: (r.temporaryPassword as string | undefined) || (r.chosenPassword ? password : undefined), expiresAt: r.expiresAt as string | undefined });
      } catch (reason) {
        setError(`${person?.fullName}: ${reason instanceof Error ? reason.message : "تعذر التنفيذ"}`);
      }
    }
    if (results.length) onCredentials(results);
    await load();
    setBusy(false);
  }
  if (!groups) return error ? <p className="team-error">{error}</p> : <p className="team-loading"><Loader2 className="animate-spin" /> جارٍ التحميل…</p>;
  return (
    <>
      <div className="platform-row mb-3">
        <p className="platform-muted">الأشخاص المكلفون فعليًا بحسب الإسنادات المسجلة. لإضافة شخص غير موجود: «إدارة المتطوعين» ← إضافة متطوع، ثم أسند له الدور وأنشئ حسابه من ملفه.</p>
        <div className="flex gap-2">
          <button className="team-button team-button-secondary" onClick={() => void load()} disabled={busy}><RefreshCw size={15} />تحديث</button>
        </div>
      </div>
      <div className="platform-card platform-form mb-4" style={{ maxWidth: 560 }}>
        <label className="team-field"><span>كلمة المرور عند «إعادة ضبط» حساب <small>اختياري — فارغة = كلمة مؤقتة تلقائية</small></span>
          <input type="text" dir="ltr" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} maxLength={128} autoComplete="off" placeholder="8 أحرف على الأقل" />
        </label>
        <label className="platform-check"><input type="checkbox" checked={requireChange} onChange={(e) => setRequireChange(e.target.checked)} />يُطلب من الشخص تغييرها عند أول دخول</label>
      </div>
      {error && <p className="team-error mb-3" role="alert">{error}</p>}
      {groups.map((g) => (
        <section key={g.id} className="mb-6">
          <h3 className="platform-section-title font-heading">{g.title} <small>{g.people.length.toLocaleString("ar-EG")}</small></h3>
          {g.people.length ? (
            <div className="platform-table-wrap">
              <table className="platform-table">
                <thead><tr><th>الاسم</th><th>الجامعة</th><th>الدور</th><th>الدخول</th><th>حالة الحساب</th><th>إجراءات</th></tr></thead>
                <tbody>{g.people.map((p) => [
                  <tr key={p.volunteerId + p.role.title}>
                    <td>{p.fullName}</td><td>{p.university}</td><td>{p.role.title}<br /><small className="platform-muted">{p.role.scope}</small></td>
                    <td className="platform-ltr">{p.account.email || p.account.username || "—"}{p.account.email && p.account.username && <><br /><small className="platform-muted">{p.account.username}</small></>}</td>
                    <td>{ACCOUNT_STATUS[p.account.status] || p.account.status}{p.account.pending && p.account.status === "active" ? " — بانتظار أول دخول" : ""}{p.account.lastResetAt && <><br /><small className="platform-muted">آخر ضبط: {new Date(p.account.lastResetAt).toLocaleDateString("ar-EG")}</small></>}</td>
                    <td className="whitespace-nowrap">
                      {p.account.status === "none" && p.canCreate && <button className="team-text-button" disabled={busy} onClick={() => setCreatingFor(creatingFor === p.volunteerId ? null : p.volunteerId)}><UserPlus size={14} />إنشاء حساب</button>}
                      {p.account.status !== "none" && p.canReset && <button className="team-text-button" disabled={busy} onClick={() => confirm(`إعادة ضبط حساب ${p.fullName}؟ ستتوقف كلمة مروره الحالية.`) && void run("reset-account", [p.volunteerId])}>إعادة ضبط</button>}
                      {p.account.status === "active" && p.canSuspend && <button className="team-text-button" disabled={busy} onClick={() => confirm(`إيقاف حساب ${p.fullName}؟`) && void run("suspend-account", [p.volunteerId])}>إيقاف</button>}
                      {p.account.status === "suspended" && p.canSuspend && <button className="team-text-button" disabled={busy} onClick={() => void run("reactivate-account", [p.volunteerId])}>إعادة تفعيل</button>}
                    </td>
                  </tr>,
                  creatingFor === p.volunteerId && (
                    <tr key={`${p.volunteerId}-create`}><td colSpan={6}>
                      <CreateAccountForm volunteerId={p.volunteerId} fullName={p.fullName} onCancel={() => setCreatingFor(null)}
                        onCreated={(a) => { setCreatingFor(null); onCredentials([{ fullName: a.fullName, university: p.university, role: p.role.title, username: a.email ? `${a.email} / ${a.username}` : a.username, status: "فعال", temporaryPassword: a.password }]); void load(); }} />
                    </td></tr>
                  ),
                ])}</tbody>
              </table>
            </div>
          ) : <p className="platform-empty">لا يوجد شاغل مسجل لهذه المناصب.</p>}
        </section>
      ))}
    </>
  );
}

interface ReviewItem { id: string; fullName: string; university: string; gender: string; currentTitle: string; detail: string; suggestedRole: string | null; suggestedTitle: string; reason: string }
interface RoleOption { id: string; title: string; titleWomen: string | null; scope: string; sector: string; deferred: boolean }

function Review() {
  const [items, setItems] = useState<ReviewItem[] | null>(null);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const load = useCallback(async () => {
    try {
      const [review, team] = await Promise.all([get<{ items: ReviewItem[] }>("review"), teamRequest<{ meta: { assignableRoles: RoleOption[] } }>()]);
      setItems(review.items);
      setRoles(team.meta.assignableRoles);
    } catch (r) { setError(r instanceof Error ? r.message : "تعذر التحميل."); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  async function assign(item: ReviewItem, roleId: string) {
    setError("");
    try {
      await post({ action: "assign-role", volunteerId: item.id, roleId, university: item.university });
      setNotice(`تم إسناد الدور إلى ${item.fullName}.`);
      await load();
    } catch (r) { setError(`${item.fullName}: ${r instanceof Error ? r.message : "تعذر الإسناد"}`); }
  }
  if (!items) return error ? <p className="team-error">{error}</p> : <p className="team-loading"><Loader2 className="animate-spin" /> جارٍ التحميل…</p>;
  return (
    <>
      <p className="platform-muted mb-3">سجلات تحمل مسمى دور قديمًا لم يُطابق تلقائيًا مع التصنيفات العشرين. لا يتغير دور أي شخص إلا بتأكيدك. المسمى القديم يبقى محفوظًا.</p>
      {notice && <p className="team-success">{notice}</p>}
      {error && <p className="team-error" role="alert">{error}</p>}
      {items.length ? (
        <div className="platform-table-wrap">
          <table className="platform-table">
            <thead><tr><th>الاسم</th><th>الجامعة</th><th>المسمى الحالي</th><th>سبب المراجعة</th><th>الإجراء</th></tr></thead>
            <tbody>{items.map((item) => <ReviewRow key={item.id} item={item} roles={roles} onAssign={assign} />)}</tbody>
          </table>
        </div>
      ) : <p className="platform-empty">لا توجد حالات تحتاج مراجعة.</p>}
    </>
  );
}

function ReviewRow({ item, roles, onAssign }: { item: ReviewItem; roles: RoleOption[]; onAssign: (i: ReviewItem, r: string) => Promise<void> }) {
  const [roleId, setRoleId] = useState(item.suggestedRole || "");
  const [busy, setBusy] = useState(false);
  return (
    <tr>
      <td>{item.fullName}<br /><small className="platform-muted">{item.gender}</small></td><td>{item.university}</td>
      <td>{item.currentTitle}{item.detail && ` — ${item.detail}`}</td>
      <td className="platform-muted" style={{ maxWidth: 260 }}>{item.reason}{item.suggestedTitle && <><br />المقترح: {item.suggestedTitle}</>}</td>
      <td>
        <div className="flex gap-2 items-center">
          <select aria-label="الدور" value={roleId} onChange={(e) => setRoleId(e.target.value)}>
            <option value="">اختر دورًا</option>
            {roles.map((r) => <option key={r.id} value={r.id}>{item.gender === "بنت" && r.titleWomen ? r.titleWomen : r.title}</option>)}
          </select>
          <button className="team-button" disabled={!roleId || busy} onClick={async () => { setBusy(true); await onAssign(item, roleId); setBusy(false); }}>إسناد</button>
        </div>
      </td>
    </tr>
  );
}

interface Grant { id: string; fullName: string; permission: string; effect: string; university: string | null; sector: string | null; team: string | null; reason: string; expiresAt: string | null; grantedBy: string; createdAt: string }
interface PermissionDef { key: string; label: string; base?: boolean; delegable: boolean }

function Grants() {
  const [data, setData] = useState<{ grants: Grant[]; people: { id: string; fullName: string; university: string }[]; permissions: PermissionDef[]; teams: { id: string; title: string }[] } | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const load = useCallback(async () => {
    try { setData(await get("grants")); } catch (r) { setError(r instanceof Error ? r.message : "تعذر التحميل."); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const f = new FormData(event.currentTarget);
    setError("");
    setNotice("");
    try {
      await post({ action: "grant", volunteerId: f.get("volunteerId"), permission: f.get("permission"), effect: f.get("effect"), university: f.get("university"), sector: f.get("sector"), team: f.get("team"), expiresOn: f.get("expiresOn"), reason: f.get("reason") });
      setNotice("تم حفظ الصلاحية.");
      (event.target as HTMLFormElement).reset();
      await load();
    } catch (r) { setError(r instanceof Error ? r.message : "تعذر الحفظ."); }
  }
  if (!data) return error ? <p className="team-error">{error}</p> : <p className="team-loading"><Loader2 className="animate-spin" /> جارٍ التحميل…</p>;
  const label = (key: string) => data.permissions.find((p) => p.key === key)?.label || key;
  const people = data.people.filter((p) => !query || p.fullName.includes(query));
  return (
    <>
      <p className="platform-muted mb-3">الصلاحيات الإضافية تُضاف فوق صلاحيات الأدوار. «منع» يتقدم على أي منح. الحقول الفارغة في النطاق تعني «أي». كل تغيير يُسجل في سجل التغييرات.</p>
      <form className="platform-card platform-form mb-6" onSubmit={submit}>
        <h3 className="font-heading flex items-center gap-2"><ShieldCheck size={18} />منح صلاحية أو منعها</h3>
        <div className="platform-grid" style={{ marginBottom: 0 }}>
          <label className="team-field"><span>بحث عن الشخص</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="اكتب جزءًا من الاسم" /></label>
          <label className="team-field"><span>الشخص</span><select name="volunteerId" required defaultValue="">{<option value="" disabled>اختر</option>}{people.map((p) => <option key={p.id} value={p.id}>{p.fullName} — {p.university}</option>)}</select></label>
          <label className="team-field"><span>الصلاحية</span><select name="permission" required>{data.permissions.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}</select></label>
          <label className="team-field"><span>النوع</span><select name="effect"><option value="allow">منح</option><option value="deny">منع</option></select></label>
          <label className="team-field"><span>نطاق الجامعة <small>فارغ = أي جامعة</small></span><select name="university" defaultValue=""><option value="">أي</option>{UNIVERSITIES.map((u: string) => <option key={u}>{u}</option>)}<option value="*central*">المركزي فقط</option></select></label>
          <label className="team-field"><span>نطاق القطاع</span><select name="sector" defaultValue=""><option value="">أي</option><option value="youth">الشباب</option><option value="women">الطالبات</option></select></label>
          <label className="team-field"><span>نطاق الفريق</span><select name="team" defaultValue=""><option value="">أي</option>{data.teams.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}</select></label>
          <label className="team-field"><span>تنتهي في <small>اختياري</small></span><input type="date" name="expiresOn" /></label>
        </div>
        <label className="team-field"><span>السبب</span><input name="reason" required maxLength={300} placeholder="مثال: تنسيق فعالية الاستقبال" /></label>
        {error && <p className="team-error" role="alert">{error}</p>}
        {notice && <p className="team-success">{notice}</p>}
        <button className="team-button">حفظ</button>
      </form>
      <h3 className="platform-section-title font-heading">الصلاحيات الإضافية الفعالة</h3>
      {data.grants.length ? (
        <div className="platform-table-wrap">
          <table className="platform-table">
            <thead><tr><th>الشخص</th><th>الصلاحية</th><th>النطاق</th><th>السبب</th><th>المانح</th><th></th></tr></thead>
            <tbody>{data.grants.map((g) => (
              <tr key={g.id}>
                <td>{g.fullName}</td>
                <td>{g.effect === "deny" ? <strong className="text-red-800">منع: </strong> : "منح: "}{label(g.permission)}</td>
                <td>{[g.university === "*central*" ? "المركزي" : g.university, g.sector && SECTOR[g.sector], g.team && data.teams.find((t) => t.id === g.team)?.title].filter(Boolean).join(" — ") || "أي"}{g.expiresAt && <><br /><small>حتى {new Date(g.expiresAt).toLocaleDateString("ar-EG")}</small></>}</td>
                <td>{g.reason}</td><td>{g.grantedBy}</td>
                <td><button className="team-text-button" onClick={async () => { if (!confirm("إلغاء هذه الصلاحية؟")) return; try { await post({ action: "revoke-grant", grantId: g.id }); await load(); } catch (r) { setError(r instanceof Error ? r.message : "تعذر الإلغاء."); } }}>إلغاء</button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      ) : <p className="platform-empty">لا توجد صلاحيات إضافية.</p>}
    </>
  );
}

interface FieldDef { id: string; label: string; type: string; required: boolean; options?: string[] }
interface FormDef { id: string; title: string; description: string; fields: FieldDef[]; audience: { sectors: string[] }; active: boolean; confidential: boolean; sortOrder: number; revision: number; routing: Json }

function Forms() {
  const [data, setData] = useState<{ forms: FormDef[]; routeRoles: { id: string; title: string }[] } | null>(null);
  const [editing, setEditing] = useState<FormDef | null>(null);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    try { setData(await teamRequest({}, "/api/forms?view=manage")); } catch (r) { setError(r instanceof Error ? r.message : "تعذر التحميل."); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  if (!data) return error ? <p className="team-error">{error}</p> : <p className="team-loading"><Loader2 className="animate-spin" /> جارٍ التحميل…</p>;
  const routeLabel = (r: Json) => r.by === "fixed" ? data.routeRoles.find((x) => x.id === r.role)?.title || String(r.role) : `جامعي: ${data.routeRoles.find((x) => x.id === r.university)?.title} / مركزي: ${data.routeRoles.find((x) => x.id === r.central)?.title}`;
  return (
    <>
      <p className="platform-muted mb-3">إدارة تعريفات النماذج دون تعديل الكود. الطلبات السابقة تحتفظ بتعريف النموذج وقت إرسالها. التوجيه يُحسب في الخادم من سجل مقدم الطلب.</p>
      <div className="platform-list">
        {data.forms.map((f) => (
          <div key={f.id} className="platform-item">
            <div className="platform-row"><h4>{f.title}</h4><span className="platform-chip">{f.active ? "مفعل" : "معطل"}{f.confidential ? " — سري" : ""}</span></div>
            <p>{f.description}</p>
            <p>الحقول: {f.fields.map((x) => x.label).join("، ")} · الجهة المستقبلة: {f.confidential ? "مجلس المتابعة والمراجعة والتظلمات (غير مفعل)" : routeLabel(f.routing)}</p>
            <button className="team-text-button" onClick={() => setEditing(f)}>تعديل</button>
          </div>
        ))}
      </div>
      {editing && <FormEditor form={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); void load(); }} />}
    </>
  );
}

function FormEditor({ form, onClose, onSaved }: { form: FormDef; onClose: () => void; onSaved: () => void }) {
  const [draft, setDraft] = useState(form);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const setField = (i: number, patch: Partial<FieldDef>) => setDraft((d) => ({ ...d, fields: d.fields.map((f, j) => (j === i ? { ...f, ...patch } : f)) }));
  async function save() {
    setBusy(true);
    setError("");
    try {
      await teamRequest({ method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "save-form", id: form.id, revision: form.revision, form: draft }) }, "/api/forms");
      onSaved();
    } catch (r) { setError(r instanceof Error ? r.message : "تعذر الحفظ."); setBusy(false); }
  }
  return (
    <TeamDialog title={`تعديل: ${form.title}`} onClose={onClose} busy={busy}>
      <div className="team-form-body platform-form">
        <label className="team-field"><span>العنوان</span><input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} maxLength={120} /></label>
        <label className="team-field"><span>الوصف</span><textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} maxLength={600} /></label>
        <fieldset className="team-field"><span>الحقول</span>
          {draft.fields.map((f, i) => (
            <div key={i} className="platform-item">
              <div className="flex flex-wrap gap-2 items-center">
                <input aria-label="اسم الحقل" value={f.label} onChange={(e) => setField(i, { label: e.target.value })} maxLength={120} />
                <select aria-label="نوع الحقل" value={f.type} onChange={(e) => setField(i, { type: e.target.value, options: e.target.value === "select" ? f.options || [] : undefined })} disabled={f.id === "scope"}>
                  <option value="short_text">نص قصير</option><option value="long_text">نص طويل</option><option value="select">قائمة</option><option value="url">رابط</option>
                </select>
                <label className="platform-check"><input type="checkbox" checked={f.required} onChange={(e) => setField(i, { required: e.target.checked })} disabled={f.id === "scope"} />مطلوب</label>
                {f.id !== "scope" && <button type="button" className="team-text-button" onClick={() => setDraft((d) => ({ ...d, fields: d.fields.filter((_, j) => j !== i) }))}>حذف</button>}
              </div>
              {f.type === "select" && <input className="mt-2" aria-label="الخيارات" value={(f.options || []).join("، ")} onChange={(e) => setField(i, { options: e.target.value.split(/[،,]/).map((o) => o.trim()).filter(Boolean) })} disabled={f.id === "scope"} placeholder="خيار 1، خيار 2" />}
            </div>
          ))}
          {draft.fields.length < 20 && <button type="button" className="team-text-button" onClick={() => setDraft((d) => ({ ...d, fields: [...d.fields, { id: `f${Date.now().toString(36)}`, label: "حقل جديد", type: "short_text", required: false }] }))}>إضافة حقل</button>}
        </fieldset>
        <fieldset className="team-field"><span>من يستطيع استخدامه</span>
          {(["youth", "women"] as const).map((s) => <label key={s} className="platform-check"><input type="checkbox" checked={draft.audience.sectors.includes(s)} onChange={(e) => setDraft({ ...draft, audience: { sectors: e.target.checked ? [...draft.audience.sectors, s] : draft.audience.sectors.filter((x) => x !== s) } })} />{SECTOR[s]}</label>)}
        </fieldset>
        <label className="platform-check"><input type="checkbox" checked={draft.active} disabled={form.confidential} onChange={(e) => setDraft({ ...draft, active: e.target.checked })} />مفعل</label>
        {form.confidential && <p className="platform-notice">لا يُفعّل نموذج الشكاوى قبل اعتماد جهة استقبال مستقلة ومسار وصول آمن.</p>}
        {error && <p className="team-error" role="alert">{error}</p>}
        <div className="team-dialog-footer"><button className="team-button team-button-secondary" onClick={onClose} disabled={busy}>إلغاء</button><button className="team-button" onClick={() => void save()} disabled={busy}>حفظ</button></div>
      </div>
    </TeamDialog>
  );
}

const ACTIONS: Record<string, string> = {
  "volunteer.create": "إضافة متطوع", "volunteer.edit": "تعديل بيانات متطوع", "volunteer.archive": "أرشفة متطوع", "volunteer.restore": "استرجاع متطوع", "volunteer.level": "تغيير المستوى التنظيمي",
  "role.assign": "إسناد دور", "role.end": "إنهاء دور", "account.create": "إنشاء حساب", "account.reset": "إعادة ضبط حساب", "account.suspend": "إيقاف حساب", "account.reactivate": "إعادة تفعيل حساب", "account.password-change": "تغيير كلمة المرور",
  "permission.grant": "منح صلاحية", "permission.deny": "منع صلاحية", "permission.revoke": "إلغاء صلاحية", "settings.update": "تعديل الإعدادات", "form.save": "تعديل نموذج", "post.publish": "نشر في أهل صحوة",
};

function Audit() {
  const [log, setLog] = useState<{ id: string; actor: string; action: string; details: Json; createdAt: string; targetName: string | null }[] | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { get<{ log: typeof log }>("audit").then((d) => setLog(d.log)).catch((r) => setError(r instanceof Error ? r.message : "تعذر التحميل.")); }, []);
  if (!log) return error ? <p className="team-error">{error}</p> : <p className="team-loading"><Loader2 className="animate-spin" /> جارٍ التحميل…</p>;
  return log.length ? (
    <div className="platform-table-wrap">
      <table className="platform-table">
        <thead><tr><th>الوقت</th><th>المنفذ</th><th>الإجراء</th><th>الشخص المعني</th><th>تفاصيل</th></tr></thead>
        <tbody>{log.map((e) => (
          <tr key={e.id}><td className="whitespace-nowrap">{new Date(e.createdAt).toLocaleString("ar-EG")}</td><td>{e.actor}</td><td>{ACTIONS[e.action] || e.action}</td><td>{e.targetName || "—"}</td>
            <td className="platform-muted">{Object.entries(e.details || {}).filter(([k]) => !["id", "assignmentId"].includes(k)).map(([k, v]) => `${k}: ${v ?? "—"}`).join(" · ")}</td></tr>
        ))}</tbody>
      </table>
    </div>
  ) : <p className="platform-empty">لا توجد تغييرات مسجلة بعد.</p>;
}

function Settings() {
  const [value, setValue] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  useEffect(() => { get<{ settings: Record<string, string> }>("settings").then((d) => setValue(d.settings["directory.crossSector"])).catch((r) => setError(r instanceof Error ? r.message : "تعذر التحميل.")); }, []);
  async function save(next: string) {
    setError(""); setNotice("");
    try { await post({ action: "settings", key: "directory.crossSector", value: next }); setValue(next); setNotice("تم الحفظ."); } catch (r) { setError(r instanceof Error ? r.message : "تعذر الحفظ."); }
  }
  if (value === null) return error ? <p className="team-error">{error}</p> : <p className="team-loading"><Loader2 className="animate-spin" /></p>;
  return (
    <section className="platform-card platform-form" style={{ maxWidth: 640 }}>
      <h3 className="font-heading">الاطلاع بين الشباب والطالبات في دليل التعارف</h3>
      <p className="platform-muted">لم تُعتمد صلاحيات الاطلاع المتبادل نهائيًا بعد. زملاء الفرق المشتركة (الإعلام والعلاقات) يرون بعضهم في كل الحالات.</p>
      {[["none", "لا يظهر القطاع الآخر"], ["leads", "يظهر من القطاع الآخر شاغلو المناصب الرسمية فقط (الاسم والدور) — الافتراضي"], ["all", "يظهر الجميع للجميع"]].map(([k, l]) => (
        <label key={k} className="platform-check"><input type="radio" name="crossSector" checked={value === k} onChange={() => void save(k)} />{l}</label>
      ))}
      {notice && <p className="team-success">{notice}</p>}
      {error && <p className="team-error">{error}</p>}
    </section>
  );
}

function Archived() {
  const [people, setPeople] = useState<{ id: string; fullName: string; university: string; archivedAt: string }[] | null>(null);
  const [error, setError] = useState("");
  const load = useCallback(() => get<{ people: typeof people }>("archived").then((d) => setPeople(d.people)).catch((r) => setError(r instanceof Error ? r.message : "تعذر التحميل.")), []);
  useEffect(() => { void load(); }, [load]);
  if (!people) return error ? <p className="team-error">{error}</p> : <p className="team-loading"><Loader2 className="animate-spin" /></p>;
  return people.length ? (
    <div className="platform-list">{people.map((p) => (
      <div key={p.id} className="platform-item platform-row"><span>{p.fullName} — {p.university} <small className="platform-muted">أُرشف {new Date(p.archivedAt).toLocaleDateString("ar-EG")}</small></span>
        <button className="team-text-button" onClick={async () => { await post({ action: "restore", volunteerId: p.id }); await load(); }}>استرجاع</button></div>
    ))}</div>
  ) : <p className="platform-empty">لا توجد سجلات مؤرشفة.</p>;
}

const TABS = [
  { id: "officials", label: "المسؤولون والحسابات", needs: "accounts" },
  { id: "review", label: "مطابقة الأدوار", needs: "global" },
  { id: "grants", label: "الصلاحيات", needs: "grants" },
  { id: "forms", label: "النماذج", needs: "forms" },
  { id: "audit", label: "سجل التغييرات", needs: "audit" },
  { id: "settings", label: "الإعدادات", needs: "settings" },
  { id: "archived", label: "المؤرشفون", needs: "global" },
] as const;

export default function AdminPanel({ abilities }: { abilities: Record<string, boolean> }) {
  const tabs = TABS.filter((t) => abilities[t.needs]);
  const [tab, setTab] = useState<string>(tabs[0]?.id || "officials");
  const [credentials, setCredentials] = useState<Credential[]>([]);
  return (
    <>
      <PageHeading title="لوحة التحكم الإدارية" description="إدارة الحسابات والأدوار والصلاحيات دون تعديل الكود." />
      <CredentialsReport items={credentials} onClear={() => setCredentials([])} />
      <div className="platform-tabs" role="tablist" aria-label="أقسام لوحة التحكم">
        {tabs.map((t) => <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}>{t.label}</button>)}
      </div>
      {tab === "officials" && <Officials onCredentials={(c) => setCredentials((prev) => [...prev, ...c])} />}
      {tab === "review" && <Review />}
      {tab === "grants" && <Grants />}
      {tab === "forms" && <Forms />}
      {tab === "audit" && <Audit />}
      {tab === "settings" && <Settings />}
      {tab === "archived" && <Archived />}
    </>
  );
}
