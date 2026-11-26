"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import PageHeading from "../../components/shared/PageIdentity";
import TeamDialog from "../../components/Team/TeamDialog";
import { teamRequest } from "../../lib/team";

type Json = Record<string, unknown>;
const SECTOR: Record<string, string> = { youth: "الشباب", women: "الطالبات" };

interface FieldDef {
  id: string;
  label: string;
  type: string;
  required: boolean;
  options?: string[];
}
interface FormDef {
  id: string;
  slug: string;
  title: string;
  description: string;
  fields: FieldDef[];
  audience: { sectors: string[] };
  active: boolean;
  confidential: boolean;
  sortOrder: number;
  revision: number;
  routing: Json;
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
  onSaved: (message: string) => void;
}) {
  const [draft, setDraft] = useState(form);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const setField = (i: number, patch: Partial<FieldDef>) =>
    setDraft((d) => ({ ...d, fields: d.fields.map((f, j) => (j === i ? { ...f, ...patch } : f)) }));

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
            id: form.id,
            revision: form.revision,
            form: draft,
          }),
        },
        "/api/forms",
      );
      onSaved(form.id ? "تم حفظ تعديلات النموذج." : "تم إنشاء النموذج الجديد.");
    } catch (r) {
      setError(r instanceof Error ? r.message : "تعذر الحفظ.");
      setBusy(false);
    }
  }

  return (
    <TeamDialog title={form.id ? `تعديل ${form.title}` : "إنشاء نموذج جديد"} onClose={onClose} busy={busy}>
      <div className="team-form-body platform-form">
        <label className="team-field">
          <span>العنوان *</span>
          <input value={draft.title} autoFocus onChange={(e) => setDraft({ ...draft, title: e.target.value })} maxLength={120} />
        </label>
        <label className="team-field">
          <span>الوصف</span>
          <textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} maxLength={600} />
        </label>
        {!form.confidential && draft.routing.by === "fixed" && (
          <label className="team-field">
            <span>الجهة المستقبلة</span>
            <select
              value={String(draft.routing.role)}
              onChange={(e) => setDraft({ ...draft, routing: { by: "fixed", role: e.target.value } })}
            >
              {routeRoles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title}
                </option>
              ))}
            </select>
          </label>
        )}
        <fieldset className="team-field">
          <legend className="text-[#350E15] font-medium text-[13px] mb-2">الحقول</legend>
          {draft.fields.map((f, i) => (
            <div key={i} className="platform-item mb-2">
              <div className="flex flex-wrap gap-2 items-center">
                <input
                  aria-label="اسم الحقل"
                  value={f.label}
                  onChange={(e) => setField(i, { label: e.target.value })}
                  maxLength={120}
                />
                <select
                  aria-label="نوع الحقل"
                  value={f.type}
                  onChange={(e) =>
                    setField(i, {
                      type: e.target.value,
                      options: e.target.value === "select" ? f.options || [] : undefined,
                    })
                  }
                  disabled={f.id === "scope"}
                >
                  <option value="short_text">نص قصير</option>
                  <option value="long_text">نص طويل</option>
                  <option value="select">قائمة</option>
                  <option value="url">رابط</option>
                </select>
                <label className="platform-check">
                  <input
                    type="checkbox"
                    checked={f.required}
                    onChange={(e) => setField(i, { required: e.target.checked })}
                    disabled={f.id === "scope"}
                  />
                  مطلوب
                </label>
                {f.id !== "scope" && (
                  <button
                    type="button"
                    className="team-text-button team-delete-action"
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
                  disabled={f.id === "scope"}
                  placeholder="خيار 1، خيار 2"
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
                  fields: [
                    ...d.fields,
                    { id: `f${Date.now().toString(36)}`, label: "حقل جديد", type: "short_text", required: false },
                  ],
                }))
              }
            >
              <Plus size={14} aria-hidden="true" />
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
                        sectors: e.target.checked
                          ? [...draft.audience.sectors, s]
                          : draft.audience.sectors.filter((x) => x !== s),
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
          مفعل
        </label>
        {form.confidential && (
          <p className="platform-notice">
            لا يُفعّل نموذج الشكاوى قبل اعتماد جهة استقبال مستقلة ومسار وصول آمن.
          </p>
        )}
        {error && (
          <p className="team-error" role="alert">
            {error}
          </p>
        )}
      </div>
      <div className="team-dialog-footer">
        <button type="button" className="team-button" onClick={() => void save()} disabled={busy}>
          {busy && <Loader2 size={15} className="animate-spin" aria-hidden="true" />}
          حفظ
        </button>
        <button type="button" className="team-button team-button-secondary" onClick={onClose} disabled={busy}>
          إلغاء
        </button>
      </div>
    </TeamDialog>
  );
}

export default function FormsManager() {
  const [data, setData] = useState<{ forms: FormDef[]; routeRoles: { id: string; title: string }[] } | null>(null);
  const [editing, setEditing] = useState<FormDef | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    try {
      setData(await teamRequest({}, "/api/forms?view=manage"));
      setError("");
    } catch (r) {
      setError(r instanceof Error ? r.message : "تعذر التحميل.");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function deleteForm(form: FormDef) {
    setDeletingId(form.id);
    setError("");
    setNotice("");
    try {
      await teamRequest(
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ target: "form", id: form.id, revision: form.revision }),
        },
        "/api/forms",
      );
      setConfirmingId(null);
      setNotice(`تم حذف نموذج «${form.title}».`);
      await load();
    } catch (r) {
      setError(r instanceof Error ? r.message : "تعذر حذف النموذج.");
    } finally {
      setDeletingId(null);
    }
  }

  const routeLabel = (r: Json) => {
    if (!data) return "";
    return r.by === "fixed"
      ? data.routeRoles.find((x) => x.id === r.role)?.title || String(r.role)
      : `جامعي: ${data.routeRoles.find((x) => x.id === r.university)?.title} / مركزي: ${data.routeRoles.find((x) => x.id === r.central)?.title}`;
  };

  return (
    <>
      <PageHeading
        title="إدارة النماذج"
        description="إنشاء وتعديل وحذف نماذج الاقتراحات والطلبات، وتحديد الجهة المستقبلة لكل نموذج."
      />
      <div className="team-directory-toolbar">
        <p className="platform-muted m-0">
          الطلبات السابقة تحتفظ بنسخة من حقول النموذج وقت إرسالها.
        </p>
        <button
          type="button"
          className="team-button"
          disabled={!data}
          onClick={() => {
            setNotice("");
            setEditing({
              id: "",
              slug: "",
              title: "",
              description: "",
              fields: [{ id: "title", label: "العنوان", type: "short_text", required: true }],
              audience: { sectors: ["youth", "women"] },
              active: true,
              confidential: false,
              sortOrder: 100,
              revision: 1,
              routing: { by: "fixed", role: "sahwa-lead" },
            });
          }}
        >
          <Plus size={17} aria-hidden="true" />
          إنشاء نموذج
        </button>
      </div>

      {notice && (
        <p className="team-success" role="status">
          {notice}
        </p>
      )}
      {error && (
        <p className="team-error mb-4" role="alert">
          {error}
        </p>
      )}

      {!data ? (
        !error && (
          <p className="team-loading">
            <Loader2 className="animate-spin" aria-hidden="true" /> جارٍ التحميل…
          </p>
        )
      ) : (
        <div className="platform-list">
          {data.forms.map((f) => {
            const protectedForm = f.confidential || f.slug === "relations-bank";
            const confirming = confirmingId === f.id;
            const deleting = deletingId === f.id;
            return (
              <article key={f.id} className="platform-item">
                <div className="platform-row">
                  <h2 className="font-heading text-base text-brand-primary m-0">{f.title}</h2>
                  <div className="platform-chips">
                    <span className="platform-chip">
                      {f.active ? "مفعل" : "معطل"}
                      {f.confidential ? " — سري" : ""}
                    </span>
                  </div>
                </div>
                {f.description && <p className="mt-1">{f.description}</p>}
                <p className="mt-2">
                  الحقول: {f.fields.map((x) => x.label).join("، ")} · الجهة المستقبلة:{" "}
                  {f.confidential ? "مجلس المتابعة والمراجعة والتظلمات (غير مفعل)" : routeLabel(f.routing)}
                </p>

                {confirming && (
                  <div className="team-delete-confirm" role="alert">
                    <p>هل تريد حذف نموذج «{f.title}»؟</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="team-button team-button-secondary"
                        autoFocus
                        onClick={() => setConfirmingId(null)}
                        disabled={deleting}
                      >
                        تراجع
                      </button>
                      <button
                        type="button"
                        className="team-button team-button-danger"
                        onClick={() => void deleteForm(f)}
                        disabled={deleting}
                      >
                        {deleting && <Loader2 size={15} className="animate-spin" aria-hidden="true" />}
                        تأكيد الحذف
                      </button>
                    </div>
                  </div>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button type="button" className="team-text-button" onClick={() => setEditing(f)} disabled={deleting}>
                    <Pencil size={14} aria-hidden="true" />
                    تعديل
                  </button>
                  {!protectedForm && (
                    <button
                      type="button"
                      className="team-text-button team-delete-action"
                      onClick={() => setConfirmingId(f.id)}
                      disabled={deleting || confirming}
                    >
                      <Trash2 size={14} aria-hidden="true" />
                      حذف النموذج
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {editing && data && (
        <FormEditor
          routeRoles={data.routeRoles}
          form={editing}
          onClose={() => setEditing(null)}
          onSaved={(msg) => {
            setEditing(null);
            setNotice(msg);
            void load();
          }}
        />
      )}
    </>
  );
}
