import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { teamRequest } from "../../lib/team";

export interface CreatedAccount {
  fullName: string;
  username: string;
  email: string | null;
  password: string;
}

// Creates the login account for an existing volunteer record using e-mail and
// password only (no username required; the user can set their own display name
// and public handle later inside «حسابي»).
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
    const password = String(f.get("password") || "");
    setBusy(true);
    setError("");
    try {
      const r = await teamRequest<{ username: string; email: string | null; temporaryPassword?: string; existing?: boolean }>(
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "create-account",
            volunteerId,
            email: f.get("email"),
            password,
            requireChange: f.get("requireChange") === "on",
          }),
        },
        "/api/admin",
      );
      if (r.existing) throw new Error("لهذا الشخص حساب بالفعل.");
      onCreated({
        fullName,
        username: r.username,
        email: r.email,
        password: r.temporaryPassword || password,
      });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "تعذر إنشاء الحساب.");
      setBusy(false);
    }
  }

  return (
    <form className="platform-item platform-form" onSubmit={submit}>
      <p className="platform-muted">
        إنشاء حساب لـ: <strong>{fullName}</strong>
      </p>
      <label className="team-field">
        <span>البريد الإلكتروني</span>
        <input
          name="email"
          type="email"
          dir="ltr"
          required
          maxLength={254}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="name@example.com"
        />
      </label>
      <label className="team-field">
        <span>
          كلمة المرور <small>8 أحرف على الأقل</small>
        </span>
        <input
          name="password"
          type="text"
          dir="ltr"
          required
          minLength={8}
          maxLength={128}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
        />
      </label>
      <label className="platform-check">
        <input type="checkbox" name="requireChange" defaultChecked />
        يُطلب من الشخص تغييرها عند أول دخول
      </label>
      {error && (
        <p className="team-error" role="alert">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <button type="submit" className="team-button" disabled={busy}>
          {busy && <Loader2 size={15} className="animate-spin" aria-hidden="true" />}
          إنشاء الحساب
        </button>
        {onCancel && (
          <button type="button" className="team-button team-button-secondary" onClick={onCancel} disabled={busy}>
            إلغاء
          </button>
        )}
      </div>
    </form>
  );
}
