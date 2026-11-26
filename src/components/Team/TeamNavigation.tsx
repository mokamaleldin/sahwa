"use client";

import { useState } from "react";
import { LayoutGrid, LogOut, UserRound } from "lucide-react";
import { Link, NavLink, useLocation, useNavigate } from "../../lib/navigation";
import { useSession } from "../../auth/useSession";

const WORKSPACE_PREFIXES = [
  "/team/workspace",
  "/team/volunteers",
  "/team/events",
  "/team/forms/inbox",
  "/team/admin",
];

function isWorkspacePath(pathname: string) {
  return WORKSPACE_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

// Clean, calm primary navigation: Home (includes أهل صحوة), Workspace (contains
// Admin, Volunteers, Events, Inbox, Studio), Team Directory, Guide, Forms,
// plus unified Account (Profile + Password + Achievements) and Sign Out.
export default function TeamNavigation() {
  const { signOut, user } = useSession();
  const navigate = useNavigate();
  const pathname = useLocation().pathname ?? "";
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

  const inWorkspace = isWorkspacePath(pathname);
  const workspaceTools = user?.workspaceTools || [];
  const showAccount = user?.kind === "account" || user?.kind === "owner";

  return (
    <>
      <div className="team-navigation-row">
        <nav className="team-navigation" aria-label="منصة صحوة">
          <NavLink to="/team" end>لوحتي</NavLink>
          {(nav ? nav.workspace : true) && (
            <Link
              to="/team/workspace"
              aria-current={inWorkspace ? "page" : undefined}
              className={inWorkspace ? "active" : ""}
            >
              مساحة العمل
            </Link>
          )}
          {nav?.directory && <NavLink to="/team/people">فريق صحوة</NavLink>}
          {(nav ? nav.guide : true) && <NavLink to="/team/guide">دليل صحوة</NavLink>}
          {nav?.forms && <NavLink to="/team/forms" end>النماذج</NavLink>}
        </nav>
        <div className="flex items-center gap-1">
          {showAccount && (
            <NavLink to="/team/account" className="team-text-button" aria-label="حسابي">
              <UserRound size={16} aria-hidden="true" />
              <span>حسابي</span>
            </NavLink>
          )}
          <button type="button" className="team-text-button" onClick={logout} disabled={leaving}>
            <LogOut size={16} aria-hidden="true" />
            <span>{leaving ? "جارٍ الخروج…" : "خروج"}</span>
          </button>
        </div>
      </div>

      {inWorkspace && workspaceTools.length > 0 && (
        <nav className="workspace-bar" aria-label="أدوات مساحة العمل">
          <Link
            to="/team/workspace"
            aria-current={pathname === "/team/workspace" ? "page" : undefined}
            className={pathname === "/team/workspace" ? "active" : ""}
          >
            <LayoutGrid size={15} aria-hidden="true" />
            <span>كل الأدوات</span>
          </Link>
          {workspaceTools.map((tool) => {
            const active = pathname === tool.href || pathname.startsWith(`${tool.href}/`);
            return (
              <Link
                key={tool.id}
                to={tool.href}
                aria-current={active ? "page" : undefined}
                className={active ? "active" : ""}
              >
                {tool.title}
              </Link>
            );
          })}
        </nav>
      )}

      {error && (
        <p className="team-error mb-6" role="alert">
          {error}
        </p>
      )}
    </>
  );
}
