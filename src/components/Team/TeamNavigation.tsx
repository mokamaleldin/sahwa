import { useState } from "react";
import { KeyRound, LogOut } from "lucide-react";
import { NavLink, useNavigate } from "../../lib/navigation";
import { useSession } from "../../auth/useSession";

// One navigation for every person; items follow the server-computed
// permissions. Pages are still guarded on the server.
const ITEMS = [
  { to: "/team", label: "لوحتي", key: "dashboard", end: true },
  { to: "/team/community", label: "أهل صحوة", key: "community" },
  { to: "/team/workspace", label: "مساحة العمل", key: "workspace" },
  { to: "/team/people", label: "فريق صحوة", key: "directory" },
  { to: "/team/guide", label: "دليل صحوة", key: "guide" },
  { to: "/team/forms", label: "النماذج والاقتراحات", key: "forms", end: true },
  { to: "/team/profile", label: "ملفي الشخصي", key: "profile" },
  { to: "/team/achievements", label: "إنجازاتي", key: "achievements", soon: true },
] as const;

export default function TeamNavigation() {
  const { signOut, user } = useSession();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [leaving, setLeaving] = useState(false);
  const nav = user?.nav;
  async function logout() {
    setLeaving(true);
    setError("");
    try {
      await signOut();
      navigate("/login", { replace: true });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "تعذر تسجيل الخروج. حاول مجددًا.");
      setLeaving(false);
    }
  }
  if (user?.mustChangePassword) return null;
  const items = ITEMS.filter((item) => (nav ? nav[item.key] : item.key === "guide" || item.key === "workspace"));
  return (
    <>
      {user?.isTest && <p className="platform-notice" role="note">أنت في حساب تجريبي معزول. البيانات هنا تجريبية ولا تظهر في سجلات صحوة الحقيقية.</p>}
      <div className="team-navigation-row">
        <nav className="team-navigation" aria-label="منصة صحوة">
          {items.map((item) => (
            <NavLink key={item.to} to={item.to} end={"end" in item ? item.end : false} className={"soon" in item ? "platform-nav-soon" : ""}>
              {item.label}
              {"soon" in item && <span className="platform-badge-soon">قريبًا</span>}
            </NavLink>
          ))}
          {nav?.admin && <NavLink to="/team/admin">لوحة التحكم</NavLink>}
        </nav>
        <div className="flex items-center gap-1">
          {user?.kind === "account" && (
            <NavLink to="/team/account" className="team-text-button" aria-label="إعدادات الحساب">
              <KeyRound size={16} aria-hidden="true" />
              <span className="hidden sm:inline">الحساب</span>
            </NavLink>
          )}
          <button className="team-text-button" onClick={logout} disabled={leaving}>
            <LogOut size={16} aria-hidden="true" />
            {leaving ? "جارٍ الخروج…" : "تسجيل الخروج"}
          </button>
        </div>
      </div>
      {error && (
        <p className="team-error mb-6" role="alert">
          {error}
        </p>
      )}
    </>
  );
}
