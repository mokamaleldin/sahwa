"use client";
import { sessionClient } from "../lib/sessionClient";

export default function ErrorPage({ reset }: { reset: () => void }) {
  async function logout() {
    try { await sessionClient.signOut(); } catch { /* ignore */ }
    window.location.assign("/login");
  }
  return (
    <main className="app-shell pt-28 team-loading">
      <h1 className="font-heading text-3xl">تعذر فتح الصفحة</h1>
      <p>تعذر الاتصال ببيانات الفريق. حاول مجددًا بعد قليل.</p>
      <div className="flex flex-wrap gap-2 justify-center">
        <button className="team-button" onClick={reset}>
          إعادة المحاولة
        </button>
        <button className="team-button team-button-secondary" onClick={() => void logout()}>
          تسجيل الخروج
        </button>
      </div>
    </main>
  );
}
