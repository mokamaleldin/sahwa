import { useState, type FormEvent } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import TeamDialog from "./TeamDialog";
import {
  EMPTY_PERSON,
  type Volunteer,
  type VolunteerInput,
} from "../../lib/team";
import {
  GENDERS,
  PERSON_STATUSES,
  UNIVERSITIES,
} from "../../../shared/team-options.js";

export default function PersonForm({
  person,
  onSave,
  onClose,
}: {
  person: Volunteer | null;
  onSave: (input: VolunteerInput) => Promise<void>;
  onClose: () => void;
}) {
  const [input, setInput] = useState<VolunteerInput>({
    ...EMPTY_PERSON,
    ...person,
    birthDate: person?.birthDate || "",
    password: "",
  });
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [show, setShow] = useState(false);
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
      setError(reason instanceof Error ? reason.message : "تعذر حفظ الحساب.");
      setBusy(false);
    }
  }
  return (
    <TeamDialog
      title={person ? "تعديل ملف المتطوع" : "إضافة متطوع وحساب"}
      onClose={onClose}
      busy={busy}
    >
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
          <div className="team-form-section">
            <h3>حساب الدخول</h3>
            <div className="team-form-grid">
              <label className="team-field">
                <span>البريد الإلكتروني *</span>
                <input
                  type="email"
                  dir="ltr"
                  value={input.email}
                  onChange={(e) => update("email", e.target.value)}
                  required
                  maxLength={254}
                  autoComplete="off"
                />
              </label>
              <div className="team-field">
                <label htmlFor="person-password">
                  {person ? "كلمة مرور جديدة" : "كلمة المرور *"}
                </label>
                <div className="team-password-field">
                  <input
                    id="person-password"
                    type={show ? "text" : "password"}
                    dir="ltr"
                    value={input.password}
                    onChange={(e) => update("password", e.target.value)}
                    required={!person}
                    minLength={10}
                    maxLength={256}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="team-icon-button"
                    aria-label={
                      show ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"
                    }
                    onClick={() => setShow((v) => !v)}
                  >
                    {show ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <small>
                  {person
                    ? "اتركها فارغة للاحتفاظ بالحالية."
                    : "10 أحرف على الأقل. سلّمها لصاحب الحساب مباشرة."}
                </small>
              </div>
              <label className="team-field">
                <span>الصلاحيات</span>
                <select
                  value={input.accessRole}
                  onChange={(e) => update("accessRole", e.target.value)}
                >
                  <option value="volunteer">متطوع عادي</option>
                  <option value="admin">مسؤول</option>
                </select>
              </label>
              <label className="team-field">
                <span>الحالة</span>
                <select
                  value={input.status}
                  onChange={(e) => update("status", e.target.value)}
                >
                  {PERSON_STATUSES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
            </div>
            <p className="team-form-note">
              المتطوع يصل إلى الملفات والنماذج والاستوديو. المسؤول يدير أيضًا
              الفعاليات والحسابات. إيقاف الحساب أو جعله غير نشط يمنع دخوله.
            </p>
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
            {busy
              ? "جارٍ الحفظ…"
              : person
                ? "حفظ التعديلات"
                : "إنشاء المتطوع والحساب"}
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
