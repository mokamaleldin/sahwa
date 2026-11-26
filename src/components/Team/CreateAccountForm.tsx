import { useId, useState, type FormEvent } from "react";
import { Eye, EyeOff, KeyRound, Loader2 } from "lucide-react";
import { teamRequest } from "../../lib/team";

export interface CreatedAccount {
  fullName: string;
  username: string;
  email: string | null;
  password: string;
  expiresAt?: string;
}

// Creates a login account for an existing volunteer using email and password.
export default function CreateAccountForm({
  volunteerId,
  fullName,
  onCreated,
  onCancel,
}: {
  volunteerId: string;
  fullName: string;
  onCreated: (a: CreatedAccount) => void;
  onCancel?: () => void;
}) {
  const idPrefix = useId();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const emailId = `${idPrefix}-email`;
  const passwordId = `${idPrefix}-password`;
  const passwordHintId = `${idPrefix}-password-hint`;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanEmail = email.trim();
    setBusy(true);
    setError("");
    try {
      const r = await teamRequest<{
        username: string;
        email: string | null;
        temporaryPassword?: string;
        chosenPassword?: boolean;
        expiresAt?: string;
        existing?: boolean;
      }>(
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "create-account",
            volunteerId,
            email: cleanEmail,
            ...(password ? { password } : {}),
          }),
        },
        "/api/admin",
      );
      if (r.existing) throw new Error("لهذا الشخص حساب بالفعل.");
      onCreated({
        fullName,
        username: r.username,
        email: r.email || cleanEmail.toLowerCase(),
        password: r.temporaryPassword || password,
        expiresAt: r.expiresAt,
      });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "تعذر إنشاء الحساب.");
      setBusy(false);
    }
  }

  return (
    <form className="platform-item platform-form" onSubmit={submit} aria-busy={busy}>
      <p className="platform-muted">
        أنشئ حساب دخول لـ <strong>{fullName}</strong> بالبريد الإلكتروني وكلمة مرور أولية يغيّرها في أول دخول.
      </p>
      <div className="team-form-grid">
        <div className="team-field">
          <label htmlFor={emailId}>البريد الإلكتروني *</label>
          <input
            id={emailId}
            name="email"
            type="email"
            dir="ltr"
            required
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            maxLength={254}
            autoComplete="off"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={busy}
          />
        </div>
        <div className="team-field">
          <label htmlFor={passwordId}>
            كلمة المرور <small>اختياري</small>
          </label>
          <div className="team-password-wrap" dir="ltr">
            <input
              id={passwordId}
              name="password"
              type={showPassword ? "text" : "password"}
              dir="ltr"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              autoComplete="new-password"
              minLength={8}
              maxLength={128}
              aria-describedby={passwordHintId}
              placeholder="8 أحرف على الأقل"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={busy}
            />
            <button
              type="button"
              className="team-password-toggle"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
              aria-pressed={showPassword}
              disabled={busy}
            >
              {showPassword ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
            </button>
          </div>
          <small id={passwordHintId}>اتركها فارغة لتوليد كلمة مرور مؤقتة تلقائيًا.</small>
        </div>
      </div>
      {error && (
        <p className="team-error" role="alert">
          {error}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <button type="submit" className="team-button" disabled={busy}>
          {busy ? (
            <Loader2 size={15} className="animate-spin" aria-hidden="true" />
          ) : (
            <KeyRound size={15} aria-hidden="true" />
          )}
          إنشاء الحساب
        </button>
        {onCancel && (
          <button
            type="button"
            className="team-button team-button-secondary"
            onClick={onCancel}
            disabled={busy}
          >
            إلغاء
          </button>
        )}
      </div>
    </form>
  );
}
