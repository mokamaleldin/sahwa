"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { ArrowUpLeft, Inbox, Loader2, Lock, Settings2 } from "lucide-react";
import { Helmet } from "react-helmet-async";
import Link from "next/link";
import PageHeading from "../components/shared/PageIdentity";
import TeamDialog from "../components/Team/TeamDialog";
import { TEAM_FORMS } from "../data/teamForms";
import { teamRequest } from "../lib/team";
import { useSession } from "../auth/useSession";

interface Field {
  id: string;
  label: string;
  type: "short_text" | "long_text" | "select" | "url";
  required: boolean;
  options?: string[];
}
interface FormDef {
  id: string;
  slug: string;
  title: string;
  description: string;
  fields: Field[];
}
interface Submission {
  id: string;
  title: string;
  status: string;
  statusLabel: string;
  response: string;
  respondedBy: string;
  routeTitle: string;
  createdAt: string;
}
interface Data {
  forms: FormDef[];
  pending: { id: string; title: string; description: string; confidential: boolean }[];
  submissions: Submission[];
}

function FormDialog({
  form,
  readOnly = false,
  onClose,
  onSent,
}: {
  form: FormDef;
  readOnly?: boolean;
  onClose: () => void;
  onSent: (message: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (readOnly) return;
    const data = new FormData(event.currentTarget);
    const answers = Object.fromEntries(form.fields.map((f) => [f.id, String(data.get(f.id) || "")]));
    setBusy(true);
    setError("");
    try {
      const result = await teamRequest<{ routeTitle: string }>(
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ formId: form.id, answers }),
        },
        "/api/forms",
      );
      onSent(`وصل طلبك إلى: ${result.routeTitle}. يمكنك متابعته من «طلباتي».`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "تعذر الإرسال.");
      setBusy(false);
    }
  }

  return (
    <TeamDialog title={form.title} onClose={onClose} busy={busy}>
      <form className="team-form-body platform-form" onSubmit={submit}>
        {form.description && <p className="platform-muted">{form.description}</p>}
        {readOnly ? (
          <p className="platform-notice">
            أنت تتصفح النموذج بحساب المسؤول العام (معاينة). يمكن لأصحاب حسابات المتطوعين تقديم الطلبات منه، ويمكنك تعديله من إدارة النماذج.
          </p>
        ) : (
          <p className="platform-muted">يُعرف اسمك وجامعتك تلقائيًا من حسابك.</p>
        )}

        {form.fields.map((f) => {
          const isShortChoice = f.type === "select" && f.options && f.options.length >= 2 && f.options.length <= 4;
          if (isShortChoice) {
            return (
              <fieldset key={f.id} className="team-field">
                <legend className="text-[#350E15] font-medium text-[13px] mb-1">
                  {f.label} {!f.required && <small className="text-[#765c5e] font-normal">اختياري</small>}
                </legend>
                <div className="platform-radio-stack">
                  {f.options!.map((o) => (
                    <label key={o} className="platform-radio-option">
                      <input type="radio" name={f.id} value={o} required={f.required} disabled={readOnly} />
                      <span>{o}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            );
          }
          return (
            <label key={f.id} className="team-field">
              <span>
                {f.label} {!f.required && <small>اختياري</small>}
              </span>
              {f.type === "long_text" ? (
                <textarea name={f.id} required={f.required} maxLength={3000} disabled={readOnly} />
              ) : f.type === "select" ? (
                <select name={f.id} required={f.required} defaultValue="" disabled={readOnly}>
                  <option value="" disabled>
                    اختر
                  </option>
                  {f.options?.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              ) : (
                <input
                  name={f.id}
                  type={f.type === "url" ? "url" : "text"}
                  dir={f.type === "url" ? "ltr" : undefined}
                  autoCorrect={f.type === "url" ? "off" : undefined}
                  autoCapitalize={f.type === "url" ? "none" : undefined}
                  spellCheck={f.type === "url" ? false : undefined}
                  required={f.required}
                  maxLength={300}
                  disabled={readOnly}
                />
              )}
            </label>
          );
        })}

        {error && (
          <p className="team-error" role="alert">
            {error}
          </p>
        )}
        <div className="team-dialog-footer">
          <button type="button" className="team-button team-button-secondary" onClick={onClose} disabled={busy}>
            {readOnly ? "إغلاق" : "إلغاء"}
          </button>
          {!readOnly && (
            <button type="submit" className="team-button" disabled={busy}>
              {busy && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
              إرسال
            </button>
          )}
        </div>
      </form>
    </TeamDialog>
  );
}

export default function TeamForms() {
  const { user } = useSession();
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState("");
  const [open, setOpen] = useState<FormDef | null>(null);
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    try {
      setData(await teamRequest<Data>({}, "/api/forms"));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "تعذر تحميل النماذج.");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const externalComplaints = TEAM_FORMS.find((f) => f.id === "feedback");
  const isOwner = user?.kind === "owner";

  return (
    <>
      <Helmet>
        <title>النماذج والاقتراحات | صحوة</title>
      </Helmet>
      <PageHeading
        title="النماذج والاقتراحات"
        description="شارك أفكارك ومبادراتك واقتراحاتك — تصل تلقائيًا إلى الجهة المختصة."
      />

      {(user?.nav?.inbox || user?.nav?.manageForms) && (
        <div className="platform-row mb-5">
          <span />
          <div className="flex flex-wrap gap-2">
            {user?.nav?.inbox && (
              <Link className="team-button team-button-secondary" href="/team/forms/inbox">
                <Inbox size={16} aria-hidden="true" />
                الطلبات الواردة
              </Link>
            )}
            {user?.nav?.manageForms && (
              <Link className="team-button" href="/team/admin?tab=forms">
                <Settings2 size={16} aria-hidden="true" />
                إدارة وإضافة النماذج
              </Link>
            )}
          </div>
        </div>
      )}

      {notice && (
        <p className="team-success" role="status">
          {notice}
        </p>
      )}
      {error && (
        <p className="team-error" role="alert">
          {error}
        </p>
      )}

      {!data && !error ? (
        <p className="team-loading">
          <Loader2 className="animate-spin" aria-hidden="true" /> جارٍ التحميل…
        </p>
      ) : (
        data && (
          <>
            <div className="platform-grid platform-grid-3">
              {data.forms.map((form) => (
                <button
                  key={form.id}
                  type="button"
                  className="platform-card platform-tool-card text-right hover:border-[#D6AD63]"
                  onClick={() => {
                    setNotice("");
                    setOpen(form);
                  }}
                >
                  <h2 className="font-heading">{form.title}</h2>
                  <p>{form.description}</p>
                  <span className="team-card-action">
                    {isOwner ? "معاينة النموذج" : "تقديم"}
                    <ArrowUpLeft size={16} aria-hidden="true" />
                  </span>
                </button>
              ))}

              {data.pending.map((form) => (
                <div key={form.id} className="platform-card platform-tool-card">
                  <h2 className="font-heading flex items-center gap-2">
                    {form.confidential && <Lock size={17} aria-hidden="true" />}
                    {form.title}
                  </h2>
                  <p>
                    {form.confidential
                      ? "المسار السري الداخلي قيد التجهيز. يمكنك إرسال شكوى أو اقتراح عبر النموذج المعتمد حاليًا."
                      : "هذا النموذج غير مفعل حاليًا."}
                  </p>
                  {form.confidential && externalComplaints && (
                    <a
                      className="team-card-action"
                      href={externalComplaints.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      فتح نموذج الشكاوى والاقتراحات
                      <ArrowUpLeft size={16} aria-hidden="true" />
                    </a>
                  )}
                </div>
              ))}
            </div>

            {!isOwner && (
              <>
                <h2 className="platform-section-title font-heading">طلباتي</h2>
                {data.submissions.length ? (
                  <div className="platform-list">
                    {data.submissions.map((s) => (
                      <article key={s.id} className="platform-item">
                        <div className="platform-row">
                          <h4>{s.title}</h4>
                          <span className="platform-chip">{s.statusLabel}</span>
                        </div>
                        <p>
                          {new Date(s.createdAt).toLocaleDateString("ar-EG")} · إلى: {s.routeTitle}
                        </p>
                        {s.response && (
                          <p className="mt-1">
                            الرد: {s.response}
                            {s.respondedBy && ` — ${s.respondedBy}`}
                          </p>
                        )}
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="platform-empty">لم تقدّم طلبات بعد.</p>
                )}
              </>
            )}
          </>
        )
      )}

      {open && (
        <FormDialog
          form={open}
          readOnly={isOwner}
          onClose={() => setOpen(null)}
          onSent={(m) => {
            setOpen(null);
            setNotice(m);
            void load();
          }}
        />
      )}
    </>
  );
}
