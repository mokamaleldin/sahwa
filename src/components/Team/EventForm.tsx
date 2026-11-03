import { useState, type FormEvent } from "react";
import { Loader2, Trash2 } from "lucide-react";
import TeamDialog from "./TeamDialog";
import type { SahwaEvent, SahwaEventInput } from "../../lib/team";

export default function EventForm({
  event,
  onSave,
  onDelete,
  onClose,
}: {
  event: SahwaEvent | null;
  onSave: (input: SahwaEventInput) => Promise<void>;
  onDelete: () => Promise<void>;
  onClose: () => void;
}) {
  const [input, setInput] = useState<SahwaEventInput>(
    event
      ? { ...event }
      : {
          title: "",
          eventDate: new Date().toLocaleDateString("en-CA", {
            timeZone: "Europe/Istanbul",
          }),
          responsible: "",
          attendance: null,
          notes: "",
        },
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
      else await onSave(input);
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر حفظ التعديل.");
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
              <span>تاريخ الفعالية *</span>
              <input
                type="date"
                required
                value={input.eventDate}
                onChange={(e) =>
                  setInput((p) => ({ ...p, eventDate: e.target.value }))
                }
              />
            </label>
            <label className="team-field">
              <span>المسؤول عنها *</span>
              <input
                required
                maxLength={120}
                value={input.responsible}
                onChange={(e) =>
                  setInput((p) => ({ ...p, responsible: e.target.value }))
                }
              />
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
                  onClick={() => setConfirm(false)}
                  disabled={busy}
                >
                  تراجع
                </button>
              </div>
            </div>
          )}
        </fieldset>
        <div className="team-dialog-footer">
          <button className="team-button" disabled={busy || confirm}>
            {busy && <Loader2 className="animate-spin" size={17} />}{" "}
            {busy ? "جارٍ الحفظ…" : "حفظ الفعالية"}
          </button>
          <button
            type="button"
            className="team-button team-button-secondary"
            onClick={onClose}
            disabled={busy}
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
              <Trash2 size={16} />
              حذف الفعالية
            </button>
          )}
        </div>
      </form>
    </TeamDialog>
  );
}
