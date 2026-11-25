import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { teamRequest } from "../../lib/team";

export interface CreatedAccount { fullName: string; username: string; email: string | null; password: string }

// Creates the login account for an existing volunteer record: e-mail,
// username and a password chosen by the administrator.
export default function CreateAccountForm({ volunteerId, fullName, onCreated, onCancel }: { volunteerId: string; fullName: string; onCreated: (a: CreatedAccount) => void; onCancel?: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const f = new FormData(event.currentTarget);
    const password = String(f.get("password") || "");
    setBusy(true);
    setError("");
    try {
      const r = await teamRequest<{ username: string; email: string | null; temporaryPassword?: string; existing?: boolean }>({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create-account", volunteerId, email: f.get("email"), username: f.get("username"), password, requireChange: f.get("requireChange") === "on" }),
      }, "/api/admin");
      if (r.existing) throw new Error("لهذا الشخص حساب بالفعل.");
      onCreated({ fullName, username: r.username, email: r.email, password: r.temporaryPassword || password });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "تعذر إنشاء الحساب.");
      setBusy(false);
    }
  }
  return (
    <form className="platform-item platform-form" onSubmit={submit}>
      <p className="platform-muted">الاسم: <strong>{fullName}</strong></p>
      <label className="team-field"><span>البريد الإلكتروني</span><input name="email" type="email" dir="ltr" required maxLength={254} autoComplete="off" /></label>
      <label className="team-field"><span>اسم المستخدم <small>اختياري — يُقترح تلقائيًا من الاسم</small></span><input name="username" dir="ltr" maxLength={40} pattern="[a-zA-Z0-9][a-zA-Z0-9._-]{2,39}" autoComplete="off" /></label>
      <label className="team-field"><span>كلمة المرور</span><input name="password" type="text" dir="ltr" required minLength={8} maxLength={128} autoComplete="off" /></label>
      <label className="platform-check"><input type="checkbox" name="requireChange" />يُطلب من الشخص تغييرها عند أول دخول</label>
      {error && <p className="team-error" role="alert">{error}</p>}
      <div className="flex gap-2">
        <button className="team-button" disabled={busy}>{busy && <Loader2 size={15} className="animate-spin" />}إنشاء الحساب</button>
        {onCancel && <button type="button" className="team-button team-button-secondary" onClick={onCancel} disabled={busy}>إلغاء</button>}
      </div>
    </form>
  );
}
