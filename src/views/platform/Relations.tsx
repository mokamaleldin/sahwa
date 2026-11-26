"use client";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import PageHeading from "../../components/shared/PageIdentity";
import TeamDialog from "../../components/Team/TeamDialog";
import { teamRequest } from "../../lib/team";

interface Details { name?: string; kind?: string; reason?: string; link?: string }
interface Row { id: string; details: Details; ownerId: string | null; ownerName: string | null; university: string | null; revision: number; canEdit: boolean; canAssign: boolean }
interface Data { records: Row[]; scopes: string[]; members: { id: string; name: string; university: string | null }[] }
const central = "*central*";
const label = (u: string | null) => !u || u === central ? "مركزي" : u;

function Editor({ data, row, onClose, onSaved }: { data: Data; row: Row | null; onClose: () => void; onSaved: () => void }) {
  const [scope, setScope] = useState(row ? row.university || central : data.scopes[0]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const members = data.members.filter((m) => (m.university || central) === scope);
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true); setError("");
    try {
      await teamRequest({ method: row ? "PUT" : "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...Object.fromEntries(form), university: scope === central ? "" : scope,
          ...(row ? { id: row.id, revision: row.revision } : {}) }) }, "/api/relations");
      onSaved();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "تعذر الحفظ."); setBusy(false); }
  }
  return <TeamDialog title={row ? "تعديل العلاقة" : "إضافة علاقة"} busy={busy} onClose={onClose}>
    <form className="team-form-body platform-form" onSubmit={save}>
      {!row && <label className="team-field"><span>نطاق العلاقة</span><select value={scope} onChange={(e) => setScope(e.target.value)}>{data.scopes.map((s) => <option key={s} value={s}>{label(s)}</option>)}</select></label>}
      <label className="team-field"><span>اسم الجهة أو الشخص</span><input name="name" defaultValue={row?.details.name} required maxLength={160} /></label>
      <label className="team-field"><span>نوع الجهة</span><input name="kind" defaultValue={row?.details.kind} maxLength={120} /></label>
      <label className="team-field"><span>تفاصيل العلاقة</span><textarea name="reason" defaultValue={row?.details.reason} maxLength={3000} /></label>
      <label className="team-field"><span>رابط التواصل</span><input name="link" type="url" dir="ltr" defaultValue={row?.details.link} maxLength={300} /></label>
      {row?.canAssign && <label className="team-field"><span>المكلف بالمتابعة</span><select name="ownerId" defaultValue={row.ownerId || ""}>
        <option value="">غير محدد</option>{row.ownerId && !members.some((m) => m.id === row.ownerId) && <option value={row.ownerId}>{row.ownerName}</option>}
        {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select></label>}
      {error && <p role="alert" className="team-error">{error}</p>}
      <button className="team-button" disabled={busy}>حفظ العلاقة</button>
    </form>
  </TeamDialog>;
}

export default function Relations({ openNew }: { openNew: boolean }) {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState("");
  const [row, setRow] = useState<Row | null | undefined>(openNew ? null : undefined);
  const load = useCallback(async () => {
    try { setData(await teamRequest<Data>({}, "/api/relations")); setError(""); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "تعذر تحميل السجل."); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  return <><PageHeading title="سجل العلاقات" />
    {error && <p className="team-error" role="alert">{error}</p>}
    {!data && !error && <p role="status">جارٍ تحميل السجل…</p>}
    {data && <>
      {data.scopes.length > 0 && <button className="team-button mb-3" onClick={() => setRow(null)}>إضافة علاقة</button>}
      {data.records.length ? <div className="platform-list">{data.records.map((r) => <article className="platform-item" key={r.id}>
        <div className="platform-row"><h3>{r.details.name}</h3><span className="platform-chip">{label(r.university)}</span></div>
        <p>{r.details.kind}</p><p>{r.details.reason}</p>
        {r.details.link && /^https?:\/\//i.test(r.details.link) && <a className="team-text-button" href={r.details.link} target="_blank" rel="noreferrer">رابط التواصل</a>}
        {r.ownerName && <p>المكلف بالمتابعة · {r.ownerName}</p>}
        {r.canEdit && <button className="team-text-button" onClick={() => setRow(r)}>تعديل العلاقة</button>}
      </article>)}</div> : <p className="platform-muted">لا توجد علاقات مسجلة في نطاقك.</p>}
      {row !== undefined && (row || data.scopes.length > 0) && <Editor data={data} row={row} onClose={() => setRow(undefined)} onSaved={() => { setRow(undefined); void load(); }} />}
    </>}
  </>;
}
