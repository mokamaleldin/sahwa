"use client";

import { useState, type FormEvent } from "react";
import { Loader2, KeyRound } from "lucide-react";
import PageHeading from "../../components/shared/PageIdentity";
import { teamRequest } from "../../lib/team";
import { useSession } from "../../auth/useSession";

export default function AccountSettings({ username, forced }: { username: string; forced: boolean }) {
  const { refresh } = useSession();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (form.get("newPassword") !== form.get("confirm")) { setError("كلمتا المرور الجديدتان غير متطابقتين."); return; }
    setBusy(true);
    setError("");
    try {
      await teamRequest({ method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentPassword: form.get("currentPassword"), newPassword: form.get("newPassword") }) }, "/api/account");
      setDone(true);
      await refresh({ force: true });
      if (forced) window.location.assign("/team");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "تعذر تغيير كلمة المرور.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageHeading title={forced ? "اختر كلمة مرورك" : "إعدادات الحساب"} description={forced ? "هذا أول دخول لك. اختر كلمة مرور خاصة بك، ولن يراها أي مسؤول." : "غيّر كلمة المرور. تنتهي جلساتك على الأجهزة الأخرى بعد التغيير."} />
      <section className="platform-card mx-auto" style={{ maxWidth: 520 }}>
        <p className="platform-muted mb-4">اسم المستخدم: <span className="platform-secret">{username}</span></p>
        {done && !forced ? <p className="team-success" role="status">تم تغيير كلمة المرور.</p> : (
          <form className="platform-form" onSubmit={submit}>
            <label className="team-field"><span>{forced ? "كلمة المرور المؤقتة" : "كلمة المرور الحالية"}</span><input name="currentPassword" type="password" dir="ltr" autoComplete="current-password" required maxLength={256} /></label>
            <label className="team-field"><span>كلمة المرور الجديدة <small>10 أحرف على الأقل</small></span><input name="newPassword" type="password" dir="ltr" autoComplete="new-password" required minLength={10} maxLength={128} /></label>
            <label className="team-field"><span>تأكيد كلمة المرور الجديدة</span><input name="confirm" type="password" dir="ltr" autoComplete="new-password" required minLength={10} maxLength={128} /></label>
            {error && <p className="team-error" role="alert">{error}</p>}
            <button className="team-button" disabled={busy}>{busy ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <KeyRound size={16} aria-hidden="true" />}حفظ كلمة المرور</button>
          </form>
        )}
      </section>
    </>
  );
}
