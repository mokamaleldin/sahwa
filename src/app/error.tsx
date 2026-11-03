"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="app-shell pt-28 team-loading">
      <h1 className="font-heading text-3xl">تعذر فتح الصفحة</h1>
      <p>تعذر الاتصال ببيانات الفريق. حاول مجددًا بعد قليل.</p>
      <button className="team-button" onClick={reset}>
        إعادة المحاولة
      </button>
    </main>
  );
}
