import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { teamRequest } from "../../lib/team";

export interface CreatedAccount { fullName: string; username: string; email: string | null; password: string; expiresAt?: string }

// Creates the login account for an existing volunteer record: e-mail,
// username and a password chosen by the administrator.
export default function CreateAccountForm({ volunteerId, fullName, onCreated, onCancel }: { volunteerId: string; fullName: string; onCreated: (a: CreatedAccount) => void; onCancel?: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const f = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    try {
      const r = await teamRequest<{ username: string; email: string | null; temporaryPassword?: string; expiresAt?: string; existing?: boolean }>({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create-account", volunteerId, email: f.get("email") }),
      }, "/api/admin");
      if (r.existing) throw new Error("لهذا الشخص حساب بالفعل.");
      onCreated({ fullName, username: r.username, email: r.email, password: r.temporaryPassword || "", expiresAt: r.expiresAt });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "تعذر إنشاء الحساب.");
      setBusy(false);
    }
  }
  return (
    <form className="platform-item platform-form" onSubmit={submit}>
      <p className="platform-muted">الاسم: <strong>{fullName}</strong></p>
      <label className="team-field"><span>البريد الإلكتروني <small>اختياري</small></span><input name="email" type="email" dir="ltr" maxLength={254} autoComplete="off" /></label>
      <p className="platform-muted">سيظهر اسم الدخول وكلمة مرور مؤقتة تسلّمها للمتطوع.</p>
      {error && <p className="team-error" role="alert">{error}</p>}
      <div className="flex gap-2">
        <button className="team-button" disabled={busy}>{busy && <Loader2 size={15} className="animate-spin" />}إنشاء الحساب</button>
        {onCancel && <button type="button" className="team-button team-button-secondary" onClick={onCancel} disabled={busy}>إلغاء</button>}
      </div>
    </form>
  );
}
