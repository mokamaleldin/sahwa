import { requirePageActor } from "../../../../server/page-auth";
import { platformStore } from "../../../../server/platform/store.js";
import { describeAssignment } from "../../../../server/platform/service.js";
import ProfileEditor from "../../../views/platform/ProfileEditor";
import PageHeading from "../../../components/shared/PageIdentity";

export const metadata = { title: "ملفي الشخصي" };

export default async function Page() {
  const actor = await requirePageActor({ permission: "profile.edit" });
  if (actor.kind !== "account") return (<><PageHeading title="ملفي الشخصي" description="" /><p className="platform-empty">الحساب المشترك لا يملك ملفًا شخصيًا.</p></>);
  const [person, profile] = await Promise.all([platformStore.person(actor.volunteerId), platformStore.profile(actor.volunteerId)]);
  return (
    <ProfileEditor
      initial={profile || null}
      person={{ fullName: person.fullName, university: person.university, major: person.major }}
      roles={actor.assignments.map((a: { roleId: string; university: string | null; sector: string | null; id: string }) => describeAssignment(a)).map((r: { title: string; scope: string }) => `${r.title} — ${r.scope}`)}
      isTest={actor.isTest}
    />
  );
}
