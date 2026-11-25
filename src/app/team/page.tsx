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
  if (actor.kind === "shared") {
    return (
      <>
        <PageHeading title="حساب صحوة المشترك" description="هذا الحساب مؤقت لإدارة المنصة في مرحلتها الأولى، وليس حسابًا شخصيًا." />
        <div className="platform-notice">أنشئ الحسابات الشخصية للمسؤولين من لوحة التحكم، ثم يُنصح بإيقاف الحساب المشترك بعد أن يستلم مسؤول صحوة حسابه.</div>
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
