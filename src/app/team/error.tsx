"use client";
import { useState } from "react";
import { LogOut } from "lucide-react";
import { sessionClient } from "../../lib/sessionClient";

export default function TeamError({ reset }: { reset: () => void }) {
  const [leaving, setLeaving] = useState(false);
  async function logout() {
    setLeaving(true);
    try { await sessionClient.signOut(); } catch { /* the cookie is cleared server-side when reachable */ }
    window.location.assign("/login");
  }
  return (
    <main className="app-shell pt-28 team-loading">
      <h1 className="font-heading text-3xl">تعذر فتح الصفحة</h1>
      <p>تعذر الاتصال ببيانات الفريق. حاول مجددًا بعد قليل.</p>
      <div className="flex flex-wrap gap-2 justify-center">
        <button className="team-button" onClick={reset}>إعادة المحاولة</button>
        <button className="team-button team-button-secondary" onClick={() => void logout()} disabled={leaving}>
          <LogOut size={16} aria-hidden="true" />{leaving ? "جارٍ الخروج…" : "تسجيل الخروج"}
        </button>
      </div>
    </main>
  );
}
