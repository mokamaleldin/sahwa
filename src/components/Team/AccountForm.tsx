import { useState, type FormEvent } from "react";
import { Eye, EyeOff, Loader2, UserCog } from "lucide-react";
import {
  EMPTY_PERSON,
  type Volunteer,
  type VolunteerInput,
} from "../../lib/team";
import { PERSON_STATUSES, UNIVERSITIES } from "../../../shared/team-options.js";

export default function AccountForm({
  person,
  disabled = false,
  onSave,
  onCancel,
}: {
  person: Volunteer | null;
  disabled?: boolean;
  onSave: (input: VolunteerInput) => Promise<void>;
  onCancel: () => void;
}) {
  // Keep the volunteer's profile intact when editing their login details.
  const [input, setInput] = useState<VolunteerInput>({
    ...EMPTY_PERSON,
    ...person,
    password: "",
    birthDate: person?.birthDate || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const busy = saving || disabled;
  const update = (key: keyof VolunteerInput, value: string) =>
    setInput((previous) => ({ ...previous, [key]: value }));

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setSaving(true);
    setError("");
    try {
      await onSave(input);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "تعذر حفظ الحساب.");
      setSaving(false);
    }
  }

  return (
    <section
      id="account-form"
      className="section-card team-account-editor"
      aria-labelledby="account-form-heading"
    >
      <div className="team-account-heading">
        <span className="team-icon team-icon-small">
          <UserCog size={24} aria-hidden="true" />
        </span>
        <div>
          <h2 id="account-form-heading" className="font-heading">
            {person ? "تعديل حساب الدخول" : "إنشاء حساب جديد"}
          </h2>
          <p>
            {person
              ? `${person.fullName} · ${person.university}`
              : "ينشأ ملف المتطوع تلقائيًا مع حسابه، ويمكن إكمال بياناته من دليل المتطوعين."}
          </p>
        </div>
      </div>
      <form onSubmit={submit} aria-busy={busy}>
        <fieldset className="team-form-body" disabled={busy}>
          {!person && (
            <div className="team-form-section">
              <h3>صاحب الحساب</h3>
              <div className="team-form-grid">
                <label className="team-field">
                  <span>اسم المتطوع *</span>
                  <input
                    required
                    maxLength={120}
                    value={input.fullName}
                    onChange={(event) => update("fullName", event.target.value)}
                    autoComplete="name"
                  />
                </label>
                <label className="team-field">
                  <span>الجامعة *</span>
                  <input
                    required
                    list="account-universities"
                    maxLength={120}
                    value={input.university}
                    onChange={(event) =>
                      update("university", event.target.value)
                    }
                  />
                  <datalist id="account-universities">
                    {UNIVERSITIES.map((university) => (
                      <option key={university} value={university} />
                    ))}
                  </datalist>
                </label>
              </div>
            </div>
          )}
          <div className="team-form-section">
            <h3>حساب الدخول</h3>
            <div className="team-form-grid">
              <label className="team-field">
                <span>البريد الإلكتروني *</span>
                <input
                  type="email"
                  required
                  dir="ltr"
                  autoComplete="off"
                  maxLength={254}
                  value={input.email}
                  onChange={(event) => update("email", event.target.value)}
                />
              </label>
              <div className="team-field">
                <label htmlFor="account-password">
                  {person ? "كلمة مرور جديدة" : "كلمة المرور *"}
                </label>
                <div className="team-password-field">
                  <input
                    id="account-password"
                    type={showPassword ? "text" : "password"}
                    dir="ltr"
                    required={!person}
                    minLength={10}
                    maxLength={256}
                    autoComplete="new-password"
                    value={input.password}
                    onChange={(event) => update("password", event.target.value)}
                  />
                  <button
                    type="button"
                    className="team-icon-button"
                    aria-label={
                      showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"
                    }
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword((previous) => !previous)}
                  >
                    {showPassword ? (
                      <EyeOff size={18} aria-hidden="true" />
                    ) : (
                      <Eye size={18} aria-hidden="true" />
                    )}
                  </button>
                </div>
                <small>
                  {person
                    ? "اتركها فارغة للاحتفاظ بالحالية. تغييرها ينهي جلسات الحساب المفتوحة."
                    : "10 أحرف على الأقل. سلّمها لصاحب الحساب مباشرة."}
                </small>
              </div>
              <label className="team-field">
                <span>الصلاحيات</span>
                <select
                  value={input.accessRole}
                  onChange={(event) => update("accessRole", event.target.value)}
                >
                  <option value="volunteer">متطوع عادي</option>
                  <option value="admin">مسؤول</option>
                </select>
              </label>
              <label className="team-field">
                <span>الحالة</span>
                <select
                  value={input.status}
                  onChange={(event) => update("status", event.target.value)}
                >
                  {PERSON_STATUSES.map((status) => (
                    <option key={status}>{status}</option>
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
            <p className="team-error mt-5" role="alert">
              {error}
            </p>
          )}
        </fieldset>
        <div className="team-dialog-footer">
          <button className="team-button" disabled={busy}>
            {saving && (
              <Loader2 className="animate-spin" size={17} aria-hidden="true" />
            )}
            {saving
              ? "جارٍ الحفظ…"
              : person
                ? "حفظ بيانات الحساب"
                : "إنشاء الحساب"}
          </button>
          {person && (
            <button
              type="button"
              className="team-button team-button-secondary"
              disabled={busy}
              onClick={onCancel}
            >
              إلغاء التعديل
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
