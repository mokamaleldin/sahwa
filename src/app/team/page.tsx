import Link from "next/link";
import { requirePageActor } from "../../../server/page-auth";
import { platformStore } from "../../../server/platform/store.js";
import { loadRealm, dashboardData } from "../../../server/platform/service.js";
import { todayInIstanbul } from "../../../shared/team-options.js";
import { roleText } from "../../lib/roleTexts";
import Dashboard from "../../views/platform/Dashboard";
import PageHeading from "../../components/shared/PageIdentity";

export const metadata = { title: "لوحتي" };

export default async function Page() {
  const actor = await requirePageActor();
  if (actor.kind === "owner") {
    return (
      <>
        <PageHeading title={`أهلًا، ${actor.fullName}`} description="حساب المسؤول العام للمنصة: إدارة المتطوعين والحسابات والأدوار والصلاحيات." />
        <div className="platform-notice">أضف المسؤولين والمتطوعين من «إدارة المتطوعين»، وأنشئ لكل شخص حسابه (الاسم، البريد، اسم المستخدم، كلمة المرور) من ملفه أو من «لوحة التحكم ← المسؤولون والحسابات».</div>
        <div className="platform-shortcuts">
          <Link className="platform-shortcut" href="/team/admin">لوحة التحكم الإدارية</Link>
          <Link className="platform-shortcut" href="/team/volunteers">إدارة المتطوعين</Link>
          <Link className="platform-shortcut" href="/team/workspace">مساحة العمل</Link>
          <Link className="platform-shortcut" href="/team/guide">دليل صحوة</Link>
        </div>
      </>
    );
  }
  const [realm, eventsThisYear] = await Promise.all([
    loadRealm(platformStore, actor.isTest),
    platformStore.eventsThisYear(actor.isTest, Number(todayInIstanbul().slice(0, 4))),
  ]);
  const data = dashboardData(actor, realm, { eventsThisYear });
  const roles = data.roles.map((role: { roleId: string; sector: string | null }) => ({ ...role, text: roleText(role.roleId, role.sector) }));
  return <Dashboard person={data.person} roles={roles} eventsThisYear={data.eventsThisYear} />;
}
