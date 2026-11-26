import { useState, type FormEvent } from "react";
import { KeyRound, Loader2 } from "lucide-react";
import { teamRequest } from "../../lib/team";

export interface CreatedAccount {
  fullName: string;
  username: string;
  email: string | null;
  password: string;
  expiresAt?: string;
}

// Creates the login account for an existing volunteer record with one simple step.
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
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const f = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    try {
      const r = await teamRequest<{
        username: string;
        email: string | null;
        temporaryPassword?: string;
        expiresAt?: string;
        existing?: boolean;
      }>(
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "create-account",
            volunteerId,
            email: f.get("email"),
            username: f.get("username"),
          }),
        },
        "/api/admin",
      );
      if (r.existing) throw new Error("لهذا الشخص حساب بالفعل.");
      onCreated({
        fullName,
        username: r.username,
        email: r.email,
        password: r.temporaryPassword || "",
        expiresAt: r.expiresAt,
      });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "تعذر إنشاء الحساب.");
      setBusy(false);
    }
  }

  return (
    <form className="platform-item platform-form" onSubmit={submit}>
      <p className="platform-muted">
        أنشئ حساب دخول لـ <strong>{fullName}</strong>. سيصدر النظام اسم دخول وكلمة مرور مؤقتة تسلّمها له مرة واحدة.
      </p>
      <div className="team-form-grid">
        <label className="team-field">
          <span>
            البريد الإلكتروني <small>اختياري</small>
          </span>
          <input
            name="email"
            type="email"
            dir="ltr"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            maxLength={254}
            autoComplete="off"
            placeholder="name@example.com"
          />
        </label>
        <label className="team-field">
          <span>
            اسم المستخدم <small>اختياري (تلقائي إذا تُرك فارغًا)</small>
          </span>
          <input
            name="username"
            type="text"
            dir="ltr"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            maxLength={40}
            autoComplete="off"
            placeholder="ahmed.ali"
          />
        </label>
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
          إنشاء الحساب وإصدار بيانات الدخول
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
