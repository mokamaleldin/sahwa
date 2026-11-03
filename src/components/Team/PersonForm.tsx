import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import TeamDialog from "./TeamDialog";
import {
  EMPTY_PERSON,
  type Volunteer,
  type VolunteerInput,
} from "../../lib/team";
import { GENDERS, UNIVERSITIES } from "../../../shared/team-options.js";

export default function PersonForm({
  person,
  onSave,
  onClose,
}: {
  person: Volunteer;
  onSave: (input: VolunteerInput) => Promise<void>;
  onClose: () => void;
}) {
  // The API updates a complete record; preserve the existing account settings.
  const [input, setInput] = useState<VolunteerInput>({
    ...EMPTY_PERSON,
    ...person,
    birthDate: person.birthDate || "",
    password: "",
  });
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const update = (key: keyof VolunteerInput, value: string) =>
    setInput((p) => ({ ...p, [key]: value }));
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await onSave(input);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "تعذر حفظ البيانات.");
      setBusy(false);
    }
  }
  return (
    <TeamDialog title="تعديل ملف المتطوع" onClose={onClose} busy={busy}>
      <form onSubmit={submit} aria-busy={busy}>
        <fieldset className="team-form-body" disabled={busy}>
          <div className="team-form-section">
            <h3>البيانات الأساسية</h3>
            <div className="team-form-grid">
              <label className="team-field">
                <span>اسم المتطوع *</span>
                <input
                  value={input.fullName}
                  onChange={(e) => update("fullName", e.target.value)}
                  maxLength={120}
                  required
                  autoComplete="name"
                  autoFocus
                />
              </label>
              <label className="team-field">
                <span>الجامعة *</span>
                <input
                  list="sahwa-universities"
                  value={input.university}
                  onChange={(e) => update("university", e.target.value)}
                  required
                  maxLength={120}
                />
                <datalist id="sahwa-universities">
                  {UNIVERSITIES.map((u) => (
                    <option key={u} value={u} />
                  ))}
                </datalist>
              </label>
              <label className="team-field">
                <span>
                  التخصص <small>اختياري</small>
                </span>
                <input
                  value={input.major}
                  onChange={(e) => update("major", e.target.value)}
                  maxLength={120}
                />
              </label>
              <label className="team-field">
                <span>
                  السنة الدراسية <small>اختياري</small>
                </span>
                <input
                  value={input.studyYear}
                  onChange={(e) => update("studyYear", e.target.value)}
                  maxLength={60}
                  placeholder="مثال: السنة الثانية"
                />
              </label>
              <label className="team-field">
                <span>
                  تاريخ الميلاد <small>اختياري</small>
                </span>
                <input
                  type="date"
                  value={input.birthDate}
                  onChange={(e) => update("birthDate", e.target.value)}
                  min="1900-01-01"
                  max={new Date().toISOString().slice(0, 10)}
                />
              </label>
              <label className="team-field">
                <span>
                  شباب / طالبات <small>اختياري</small>
                </span>
                <select
                  value={input.gender}
                  onChange={(e) => update("gender", e.target.value)}
                >
                  <option value="">غير محدد</option>
                  {GENDERS.map((g) => (
                    <option key={g} value={g}>
                      {g === "شاب" ? "شباب" : "طالبات"}
                    </option>
                  ))}
                </select>
              </label>
              <label className="team-field">
                <span>
                  الفريق <small>اختياري</small>
                </span>
                <input
                  value={input.team}
                  onChange={(e) => update("team", e.target.value)}
                  maxLength={80}
                  placeholder="مثال: الإعلام"
                />
              </label>
              <label className="team-field">
                <span>
                  المسؤولية <small>اختياري</small>
                </span>
                <input
                  value={input.responsibility}
                  onChange={(e) => update("responsibility", e.target.value)}
                  maxLength={120}
                  placeholder="مثال: مسؤول الأنشطة"
                />
              </label>
            </div>
          </div>
          {error && (
            <p role="alert" className="team-error mt-5">
              {error}
            </p>
          )}
        </fieldset>
        <div className="team-dialog-footer">
          <button className="team-button" disabled={busy}>
            {busy && <Loader2 className="animate-spin" size={17} />}{" "}
            {busy ? "جارٍ الحفظ…" : "حفظ التعديلات"}
          </button>
          <button
            type="button"
            className="team-button team-button-secondary"
            onClick={onClose}
            disabled={busy}
          >
            إلغاء
          </button>
        </div>
      </form>
    </TeamDialog>
  );
}
