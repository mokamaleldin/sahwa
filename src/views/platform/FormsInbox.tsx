"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import PageHeading from "../../components/shared/PageIdentity";
import { teamRequest } from "../../lib/team";

interface Field {
  id: string;
  label: string;
}
interface Submission {
  id: string;
  form: { title: string; fields: Field[] };
  answers: Record<string, string>;
  status: string;
  statusLabel: string;
  response: string;
  revision: number;
  createdAt: string;
  submitterName: string | null;
  submitterUniversity: string | null;
  routeSector: string | null;
  routeTitle: string;
  routeUniversity: string | null;
}

function Item({
  s,
  statuses,
  onSaved,
}: {
  s: Submission;
  statuses: Record<string, string>;
  onSaved: () => void;
}) {
  const [status, setStatus] = useState(s.status);
  const [response, setResponse] = useState(s.response);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    setBusy(true);
    setError("");
    try {
      await teamRequest(
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "respond", id: s.id, revision: s.revision, status, response }),
        },
        "/api/forms",
      );
      onSaved();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "تعذر الحفظ.");
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    setError("");
    try {
      await teamRequest(
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ target: "inbox", id: s.id, revision: s.revision }),
        },
        "/api/forms",
      );
      onSaved();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "تعذر حذف الطلب.");
      setBusy(false);
    }
  }

  return (
    <article className="platform-item">
      <div className="platform-row">
        <h4>{s.form.title}</h4>
        <div className="platform-chips">
          <span className="platform-chip platform-chip-muted">
            {s.routeUniversity || "مركزي"} · {s.routeTitle}
          </span>
          <span className="platform-chip">{s.statusLabel}</span>
        </div>
      </div>
      <p>
        {new Date(s.createdAt).toLocaleDateString("ar-EG")} · من: {s.submitterName || "—"}
        {s.submitterUniversity ? ` (${s.submitterUniversity})` : ""}
      </p>
      <dl className="mt-3">
        {s.form.fields.map((f) =>
          s.answers[f.id] ? (
            <div key={f.id} className="mb-2">
              <dt className="platform-muted">{f.label}</dt>
              <dd className="whitespace-pre-line text-sm">{s.answers[f.id]}</dd>
            </div>
          ) : null,
        )}
      </dl>
      <div className="platform-form mt-3">
        <label className="team-field" style={{ maxWidth: 260 }}>
          <span>الحالة</span>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {Object.entries(statuses).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <label className="team-field">
          <span>
            رد مختصر منسوب لك <small>اختياري</small>
          </span>
          <textarea value={response} onChange={(e) => setResponse(e.target.value)} maxLength={1000} />
        </label>
        {error && (
          <p className="team-error" role="alert">
            {error}
          </p>
        )}
        {confirmDelete && (
          <div className="team-delete-confirm" role="alert">
            <p>هل تريد حذف هذا الطلب من صندوق الطلبات الواردة؟</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" className="team-button team-button-secondary" autoFocus onClick={() => setConfirmDelete(false)} disabled={busy}>
                تراجع
              </button>
              <button type="button" className="team-button team-button-danger" onClick={() => void remove()} disabled={busy}>
                {busy && <Loader2 size={15} className="animate-spin" aria-hidden="true" />}
                تأكيد الحذف
              </button>
            </div>
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button type="button" className="team-button" onClick={() => void save()} disabled={busy || confirmDelete}>
            {busy && <Loader2 size={15} className="animate-spin" aria-hidden="true" />}
            حفظ
          </button>
          <button
            type="button"
            className="team-text-button team-delete-action"
            onClick={() => setConfirmDelete(true)}
            disabled={busy || confirmDelete}
          >
            <Trash2 size={15} aria-hidden="true" />
            حذف الطلب
          </button>
        </div>
      </div>
    </article>
  );
}

export default function FormsInbox() {
  const [data, setData] = useState<{
    submissions: Submission[];
    statuses: Record<string, string>;
    scopeLabel?: string;
  } | null>(null);
  const [error, setError] = useState("");
  const [formFilter, setFormFilter] = useState("all");
  const [uniFilter, setUniFilter] = useState("all");
  const [onlyOpen, setOnlyOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      setData(await teamRequest({}, "/api/forms?view=inbox"));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "تعذر التحميل.");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const formTitles = useMemo(
    () => [...new Set((data?.submissions || []).map((s) => s.form.title).filter(Boolean))],
    [data],
  );
  const universities = useMemo(
    () => [...new Set((data?.submissions || []).map((s) => s.routeUniversity || "مركزي"))],
    [data],
  );

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.submissions.filter((s) => {
      if (formFilter !== "all" && s.form.title !== formFilter) return false;
      if (uniFilter !== "all" && (s.routeUniversity || "مركزي") !== uniFilter) return false;
      if (onlyOpen && !["new", "reviewing"].includes(s.status)) return false;
      return true;
    });
  }, [data, formFilter, uniFilter, onlyOpen]);

  const groups = new Map<string, Submission[]>();
  for (const item of filtered) {
    const sector = item.routeSector === "women" ? "الطالبات" : item.routeSector === "youth" ? "الشباب" : "";
    const label = [item.routeTitle, item.routeUniversity || "مركزي", sector].filter(Boolean).join(" · ");
    const group = groups.get(label) || [];
    group.push(item);
    groups.set(label, group);
  }

  return (
    <>
      <PageHeading
        title="الطلبات الواردة"
        description={data?.scopeLabel || "صندوق الطلبات والأفكار الخاصة بمهامك ونطاقك فقط."}
      />
      {error && (
        <p className="team-error" role="alert">
          {error}
        </p>
      )}
      {!data ? (
        !error && (
          <p className="team-loading">
            <Loader2 className="animate-spin" aria-hidden="true" /> جارٍ التحميل…
          </p>
        )
      ) : data.submissions.length ? (
        <>
          {(formTitles.length > 1 || universities.length > 1) && (
            <div className="platform-row mb-4">
              {formTitles.length > 1 && (
                <div className="platform-tabs" role="tablist" aria-label="تصفية حسب النموذج">
                  <button type="button" role="tab" aria-selected={formFilter === "all"} onClick={() => setFormFilter("all")}>
                    الكل ({data.submissions.length.toLocaleString("ar-EG")})
                  </button>
                  {formTitles.map((t) => (
                    <button key={t} type="button" role="tab" aria-selected={formFilter === t} onClick={() => setFormFilter(t)}>
                      {t}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap items-center gap-3">
                {universities.length > 1 && (
                  <select
                    aria-label="تصفية حسب الجامعة"
                    className="rounded-xl border border-[#75202624] bg-[#faf4ee] px-3 py-2 text-sm"
                    value={uniFilter}
                    onChange={(e) => setUniFilter(e.target.value)}
                  >
                    <option value="all">كل النطاقات</option>
                    {universities.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                )}
                <label className="platform-check">
                  <input type="checkbox" checked={onlyOpen} onChange={(e) => setOnlyOpen(e.target.checked)} />
                  الجديدة وقيد المراجعة فقط
                </label>
              </div>
            </div>
          )}

          {filtered.length ? (
            [...groups].map(([label, items]) => <section key={label}>
              <h2 className="platform-section-title font-heading">{label}</h2>
              <div className="platform-list">{items.map((s) => (
                <Item key={s.id + s.revision} s={s} statuses={data.statuses} onSaved={() => void load()} />
              ))}</div>
            </section>)
          ) : (
            <p className="platform-empty">لا توجد طلبات مطابقة للتصفية الحالية.</p>
          )}
        </>
      ) : (
        <p className="platform-empty">لا توجد طلبات واردة إلى صندوقك حاليًا.</p>
      )}
    </>
  );
}
