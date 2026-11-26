import { useState } from "react";
import { UserRound, ChevronDown, LogOut } from "lucide-react";
import { Link, NavLink, useLocation, useNavigate } from "../../lib/navigation";
import { useSession } from "../../auth/useSession";

// One navigation for every person; items follow the server-computed
// permissions. Pages are still guarded on the server.
const ITEMS = [
  { to: "/team", label: "لوحتي", key: "dashboard", end: true },
  { to: "/team/people", label: "فريق صحوة", key: "directory" },
  { to: "/team/guide", label: "دليل صحوة", key: "guide" },
  { to: "/team/forms", label: "النماذج والاقتراحات", key: "forms", end: true },
] as const;

export default function TeamNavigation() {
  const { signOut, user } = useSession();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [leaving, setLeaving] = useState(false);
  const nav = user?.nav;
  const { pathname } = useLocation();
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
  const items = ITEMS.filter((item) => !user?.mustChangePassword && (nav ? nav[item.key] : item.key === "guide" || item.key === "dashboard"));
  return <header className="internal-header" role="banner" dir="rtl">
    <div className="page-container internal-nav">
      <Link to="/" className="internal-brand" aria-label="العودة إلى موقع صحوة"><img src="/logo.png" alt="صحوة" width="38" height="46" /></Link>
      <nav className="internal-links" aria-label="منصة صحوة">
        {items.map((item) => <NavLink key={item.to} to={item.to} end={"end" in item && item.end}>{item.label}</NavLink>)}
      </nav>
      <details className="internal-account" key={pathname}>
        <summary><UserRound size={17} /> حسابي <ChevronDown size={14} /></summary>
        <div onClick={(event) => { if ((event.target as HTMLElement).closest("a")) event.currentTarget.closest("details")?.removeAttribute("open"); }}>
          <Link to="/team/account">إعدادات الحساب</Link>
          {nav?.profile && !user?.mustChangePassword && <>
            <Link to="/team/profile">الملف الشخصي</Link>
            <Link to="/team/profile#public-page">صفحتي الشخصية</Link>
          </>}
          {nav?.achievements && !user?.mustChangePassword && <Link to="/team/achievements">إنجازاتي</Link>}
          <button onClick={logout} disabled={leaving}><LogOut size={15} />تسجيل الخروج</button>
          {error && <p role="alert">{error}</p>}
        </div>
      </details>
    </div>
  </header>;
}
