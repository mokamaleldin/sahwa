import { useState, type FormEvent } from "react";
import { Loader2, Trash2 } from "lucide-react";
import TeamDialog from "./TeamDialog";
import type {
  SahwaEvent,
  SahwaEventInput,
  ResponsibleVolunteer,
} from "../../lib/team";

export default function EventForm({
  event,
  volunteers,
  onSave,
  onDelete,
  onClose,
}: {
  event: SahwaEvent | null;
  volunteers: ResponsibleVolunteer[];
  onSave: (input: SahwaEventInput) => Promise<void>;
  onDelete: () => Promise<void>;
  onClose: () => void;
}) {
  const [input, setInput] = useState<SahwaEventInput>(
    event
      ? { ...event }
      : {
          title: "",
          eventDate: "",
          responsibleId: null,
          attendance: null,
          notes: "",
        },
  );
  const [responsible, setResponsible] = useState(
    event?.responsibleId || (event?.responsible ? "__legacy__" : ""),
  );
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [confirm, setConfirm] = useState(false);
  async function act(remove = false) {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      if (remove) await onDelete();
      else
        await onSave({
          ...input,
          responsibleId:
            responsible === "__legacy__" ? null : responsible || null,
          preserveLegacyResponsible: responsible === "__legacy__",
        });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "تعذر حفظ التعديل.");
      setBusy(false);
    }
  }
  function submit(e: FormEvent) {
    e.preventDefault();
    void act();
  }
  return (
    <TeamDialog
      title={event ? "تعديل الفعالية" : "إضافة فعالية"}
      onClose={onClose}
      busy={busy}
    >
      <form onSubmit={submit} aria-busy={busy}>
        <fieldset className="team-form-body" disabled={busy}>
          <div className="team-form-grid">
            <label className="team-field team-field-full">
              <span>اسم الفعالية *</span>
              <input
                autoFocus
                required
                maxLength={160}
                value={input.title}
                onChange={(e) =>
                  setInput((p) => ({ ...p, title: e.target.value }))
                }
                placeholder="مثال: لقاء صحوة الأسبوعي"
              />
            </label>
            <label className="team-field">
              <span>
                تاريخ الفعالية <small>اختياري</small>
              </span>
              <input
                type="date"
                value={input.eventDate}
                onChange={(e) =>
                  setInput((p) => ({ ...p, eventDate: e.target.value }))
                }
              />
            </label>
            <label className="team-field">
              <span>
                المسؤول عنها <small>اختياري</small>
              </span>
              <select
                value={responsible}
                onChange={(e) => setResponsible(e.target.value)}
              >
                <option value="">بدون مسؤول محدد</option>
                {event?.responsible && !event.responsibleId && (
                  <option value="__legacy__">
                    {event.responsible} — مسجل سابقًا
                  </option>
                )}
                {volunteers.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.fullName} — {person.university}
                  </option>
                ))}
              </select>
              {!volunteers.length && (
                <small>يمكن تحديد المسؤول بعد إضافة المتطوعين إلى السجل.</small>
              )}
            </label>
            <label className="team-field">
              <span>
                عدد الحضور <small>اختياري</small>
              </span>
              <input
                type="number"
                min={0}
                max={1000000}
                step={1}
                value={input.attendance ?? ""}
                onChange={(e) =>
                  setInput((p) => ({
                    ...p,
                    attendance:
                      e.target.value === "" ? null : Number(e.target.value),
                  }))
                }
                placeholder="يمكن تركه فارغًا"
              />
            </label>
            <label className="team-field team-field-full">
              <span>
                ملاحظات <small>اختياري</small>
              </span>
              <textarea
                rows={3}
                maxLength={1000}
                value={input.notes}
                onChange={(e) =>
                  setInput((p) => ({ ...p, notes: e.target.value }))
                }
                placeholder="سطر أو اثنان عن الفعالية، إذا احتجت."
              />
            </label>
          </div>
          {error && (
            <p className="team-error mt-5" role="alert">
              {error}
            </p>
          )}
          {confirm && (
            <div className="team-delete-confirm" role="alert">
              <p>حذف «{event?.title}» من السجل؟</p>
              <div className="flex gap-2 mt-3">
                <button
                  type="button"
                  className="team-button team-button-danger"
                  disabled={busy}
                  onClick={() => void act(true)}
                >
                  تأكيد الحذف
                </button>
                <button
                  type="button"
                  className="team-button team-button-secondary"
                  disabled={busy}
                  onClick={() => setConfirm(false)}
                >
                  تراجع
                </button>
              </div>
            </div>
          )}
        </fieldset>
        <div className="team-dialog-footer">
          <button className="team-button" disabled={busy || confirm}>
            {busy && (
              <Loader2 className="animate-spin" size={17} aria-hidden="true" />
            )}
            {busy ? "جارٍ الحفظ…" : "حفظ الفعالية"}
          </button>
          <button
            type="button"
            className="team-button team-button-secondary"
            disabled={busy}
            onClick={onClose}
          >
            إلغاء
          </button>
          {event && (
            <button
              type="button"
              className="team-text-button team-delete-action"
              onClick={() => setConfirm(true)}
              disabled={busy || confirm}
            >
              <Trash2 size={16} aria-hidden="true" />
              حذف الفعالية
            </button>
          )}
        </div>
      </form>
    </TeamDialog>
  );
}
