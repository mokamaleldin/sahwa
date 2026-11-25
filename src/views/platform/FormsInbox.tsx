"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import PageHeading from "../../components/shared/PageIdentity";
import { teamRequest } from "../../lib/team";

interface Field { id: string; label: string }
interface Submission {
  id: string; form: { title: string; fields: Field[] }; answers: Record<string, string>; status: string; statusLabel: string; response: string;
  revision: number; createdAt: string; submitterName: string | null; submitterUniversity: string | null; routeTitle: string; routeUniversity: string | null;
}

function Item({ s, statuses, onSaved }: { s: Submission; statuses: Record<string, string>; onSaved: () => void }) {
  const [status, setStatus] = useState(s.status);
  const [response, setResponse] = useState(s.response);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function save() {
    setBusy(true);
    setError("");
    try {
      await teamRequest({ method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "respond", id: s.id, revision: s.revision, status, response }) }, "/api/forms");
      onSaved();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "تعذر الحفظ.");
      setBusy(false);
    }
  }
  return (
    <article className="platform-item">
      <div className="platform-row"><h4>{s.form.title}</h4><span className="platform-chip">{s.statusLabel}</span></div>
      <p>{new Date(s.createdAt).toLocaleDateString("ar-EG")} · من: {s.submitterName || "—"}{s.submitterUniversity ? ` (${s.submitterUniversity})` : ""} · إلى: {s.routeTitle}{s.routeUniversity ? ` — ${s.routeUniversity}` : ""}</p>
      <dl className="mt-2">
        {s.form.fields.map((f) => s.answers[f.id] ? <div key={f.id} className="mb-1"><dt className="platform-muted">{f.label}</dt><dd className="whitespace-pre-line text-sm">{s.answers[f.id]}</dd></div> : null)}
      </dl>
      <div className="platform-form mt-3">
        <label className="team-field"><span>الحالة</span><select value={status} onChange={(e) => setStatus(e.target.value)}>{Object.entries(statuses).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
        <label className="team-field"><span>رد مختصر منسوب لك <small>اختياري</small></span><textarea value={response} onChange={(e) => setResponse(e.target.value)} maxLength={1000} /></label>
        {error && <p className="team-error" role="alert">{error}</p>}
        <button className="team-button" onClick={() => void save()} disabled={busy}>{busy && <Loader2 size={15} className="animate-spin" />}حفظ</button>
      </div>
    </article>
  );
}

export default function FormsInbox() {
  const [data, setData] = useState<{ submissions: Submission[]; statuses: Record<string, string> } | null>(null);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    try { setData(await teamRequest({}, "/api/forms?view=inbox")); } catch (reason) { setError(reason instanceof Error ? reason.message : "تعذر التحميل."); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  return (
    <>
      <PageHeading title="الطلبات الواردة" description="الأفكار والطلبات الموجهة إلى دورك ونطاقك." />
      {error && <p className="team-error" role="alert">{error}</p>}
      {!data ? !error && <p className="team-loading"><Loader2 className="animate-spin" aria-hidden="true" /> جارٍ التحميل…</p>
        : data.submissions.length ? <div className="platform-list">{data.submissions.map((s) => <Item key={s.id + s.revision} s={s} statuses={data.statuses} onSaved={() => void load()} />)}</div>
        : <p className="platform-empty">لا توجد طلبات موجهة إليك حاليًا.</p>}
    </>
  );
}
