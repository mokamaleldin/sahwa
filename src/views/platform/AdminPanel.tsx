"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import PageHeading from "../../components/shared/PageIdentity";
import TeamDialog from "../../components/Team/TeamDialog";
import { teamRequest } from "../../lib/team";
import { UNIVERSITIES } from "../../../shared/team-options.js";

type Json = Record<string, unknown>;
const post = <T,>(body: Json) => teamRequest<T>({ method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }, "/api/admin");
const get = <T,>(view: string) => teamRequest<T>({}, `/api/admin?view=${view}`);
const SECTOR: Record<string, string> = { youth: "الشباب", women: "الطالبات" };
interface Grant { id: string; fullName: string; permission: string; effect: string; university: string | null; sector: string | null; team: string | null; reason: string; expiresAt: string | null; grantedBy: string; createdAt: string }
interface PermissionDef { key: string; label: string; base?: boolean; delegable: boolean }

function Grants() {
  const [data, setData] = useState<{ grants: Grant[]; people: { id: string; fullName: string; university: string; groups: string[] }[]; permissions: PermissionDef[]; teams: { id: string; title: string }[] } | null>(null);
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
  const groups = [...new Set(people.flatMap((p) => p.groups))].sort();
  return (
    <>
      <p className="platform-muted mb-3">الصلاحيات الإضافية تُضاف فوق صلاحيات الأدوار. «منع» يتقدم على أي منح. الحقول الفارغة في النطاق تعني «أي». كل تغيير يُسجل في سجل التغييرات.</p>
      <form className="platform-card platform-form mb-6" onSubmit={submit}>
        <h3 className="font-heading flex items-center gap-2"><ShieldCheck size={18} />منح صلاحية أو منعها</h3>
        <div className="platform-grid" style={{ marginBottom: 0 }}>
          <label className="team-field"><span>بحث عن الشخص</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="اكتب جزءًا من الاسم" /></label>
          <label className="team-field"><span>الشخص</span><select name="volunteerId" required defaultValue="">{<option value="" disabled>اختر</option>}{groups.map((g) => <optgroup label={g} key={g}>{people.filter((p) => p.groups.includes(g)).map((p) => <option key={p.id} value={p.id}>{p.fullName}</option>)}</optgroup>)}</select></label>
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
      <button className="team-button mb-3" onClick={() => setEditing({ id: "", title: "", description: "", fields: [{id:"title",label:"العنوان",type:"short_text",required:true}], audience:{sectors:["youth","women"]}, active:false, confidential:false, sortOrder:100, revision:1, routing:{by:"fixed",role:"sahwa-lead"} })}>إنشاء نموذج</button>
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
      {editing && <FormEditor routeRoles={data.routeRoles} form={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); void load(); }} />}
    </>
  );
}

function FormEditor({ form, routeRoles, onClose, onSaved }: { form: FormDef; routeRoles: {id: string; title: string}[]; onClose: () => void; onSaved: () => void }) {
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
    <TeamDialog title={form.id ? `تعديل ${form.title}` : "إنشاء نموذج"} onClose={onClose} busy={busy}>
      <div className="team-form-body platform-form">
        <label className="team-field"><span>العنوان</span><input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} maxLength={120} /></label>
        <label className="team-field"><span>الوصف</span><textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} maxLength={600} /></label>
        {!form.confidential && draft.routing.by === "fixed" && <label className="team-field"><span>الجهة المستقبلة</span>
          <select value={String(draft.routing.role)} onChange={(e) => setDraft({...draft,routing:{by:"fixed",role:e.target.value}})}>
          {routeRoles.map((r) => <option key={r.id} value={r.id}>{r.title}</option>)}</select></label>}
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
  { id: "grants", label: "الصلاحيات", needs: "grants" },
  { id: "forms", label: "النماذج", needs: "forms" },
  { id: "audit", label: "سجل التغييرات", needs: "audit" },
  { id: "settings", label: "الإعدادات", needs: "settings" },
  { id: "archived", label: "المؤرشفون", needs: "global" },
] as const;

export default function AdminPanel({ abilities, initial }: { abilities: Record<string, boolean>; initial?: string }) {
  const tabs = TABS.filter((t) => abilities[t.needs]);
  const [tab, setTab] = useState<string>(tabs.find((t) => t.id === initial)?.id || tabs[0]?.id || "");
  return (
    <>
      <PageHeading title={tabs.find((t) => t.id === tab)?.label || "الإعدادات"} />
      <div className="platform-tabs" role="tablist" aria-label="أقسام لوحة التحكم">
        {tabs.map((t) => <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}>{t.label}</button>)}
      </div>
      {tab === "grants" && <Grants />}
      {tab === "forms" && <Forms />}
      {tab === "audit" && <Audit />}
      {tab === "settings" && <Settings />}
      {tab === "archived" && <Archived />}
    </>
  );
}
