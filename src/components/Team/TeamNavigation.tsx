import { Suspense, useState } from "react";
import { UserRound, ChevronDown, LogOut } from "lucide-react";
import { Link, NavLink, useLocation, useNavigate } from "../../lib/navigation";
import { useSearchParams } from "next/navigation";
import { useSession } from "../../auth/useSession";

// One navigation for every person; items follow the server-computed
// permissions. Pages are still guarded on the server.
const ITEMS = [
  { to: "/team", label: "لوحتي", key: "dashboard", end: true },
  { to: "/team/workspace", label: "مساحة العمل", key: "workspace" },
  { to: "/team/people", label: "فريق صحوة", key: "directory" },
  { to: "/team/guide", label: "لائحة صحوة", key: "guide" },
  { to: "/team/forms", label: "النماذج والاقتراحات", key: "forms", end: true },
] as const;

function isWorkspacePath(path: string) {
  return path === "/studio" || ["/team/workspace", "/team/events", "/team/volunteers", "/team/admin", "/team/relations", "/team/forms/inbox"].some((p) => path === p || path.startsWith(p + "/"));
}

function WorkspaceNavigation({ tools, pathname }: { tools: {id: string; title: string; href: string}[]; pathname: string }) {
  const params = useSearchParams();
  return <nav className="workspace-bar" aria-label="مساحة العمل">{tools.map((tool) => {
    const [path, query] = tool.href.split("?");
    const active = (pathname === path || (tool.id === "studio" && pathname === "/studio")) &&
      (!query ? (path !== "/team/relations" || params.get("new") !== "1") : [...new URLSearchParams(query)].every(([k,v]) => params.get(k) === v));
    return <Link key={tool.id} to={tool.href} scroll={false} aria-current={active ? "page" : undefined}>{tool.title}</Link>;
  })}</nav>;
}

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
  const workspace = isWorkspacePath(pathname);
  return <><header className="internal-header" role="banner" dir="rtl">
    <div className="page-container internal-nav">
      <Link to="/" className="internal-brand" aria-label="العودة إلى موقع صحوة"><img src="/logo.png" alt="صحوة" width="38" height="46" /></Link>
      <nav className="internal-links" aria-label="منصة صحوة">
        {items.map((item) => item.key === "workspace" ? <Link key={item.to} to={item.to} className={workspace ? "active" : ""} aria-current={workspace ? "page" : undefined}>{item.label}</Link> : <NavLink key={item.to} to={item.to} end={"end" in item && item.end}>{item.label}</NavLink>)}
      </nav>
      <details className="internal-account" key={pathname}>
        <summary><UserRound size={17} /> حسابي <ChevronDown size={14} /></summary>
        <div onClick={(event) => { if ((event.target as HTMLElement).closest("a")) event.currentTarget.closest("details")?.removeAttribute("open"); }}>
          <Link to="/team/account?tab=security">إعدادات الحساب</Link>
          {nav?.profile && !user?.mustChangePassword && <>
            <Link to="/team/account?tab=profile">الملف الشخصي</Link>
            <Link to="/team/account?tab=profile#public-page">صفحتي الشخصية</Link>
          </>}
          {nav?.achievements && !user?.mustChangePassword && <Link to="/team/account?tab=achievements">إنجازاتي</Link>}
          <button onClick={logout} disabled={leaving}><LogOut size={15} />تسجيل الخروج</button>
          {error && <p role="alert">{error}</p>}
        </div>
      </details>
    </div>
  </header>{workspace && !user?.mustChangePassword && Boolean(user?.workspaceTools?.length) && <div className="page-container workspace-navigation"><Suspense><WorkspaceNavigation pathname={pathname} tools={user?.workspaceTools || []} /></Suspense></div>}</>;
}
