import { requirePageActor } from "../../../../server/page-auth";
import { platformStore } from "../../../../server/platform/store.js";
import { describeAssignment } from "../../../../server/platform/service.js";
import AccountHub from "../../../views/platform/AccountHub";

export const metadata = { title: "حسابي" };

export default async function Page({ searchParams }: { searchParams?: Promise<{ tab?: string }> }) {
  const actor = await requirePageActor({ allowPasswordChange: true });
  const params = searchParams ? await searchParams : {};
  const initialTab = typeof params?.tab === "string" ? params.tab : undefined;

  if (actor.kind !== "account") {
    return (
      <AccountHub
        kind="owner"
        fullName={actor.fullName}
        email={actor.email || ""}
        username={actor.username}
        forced={actor.mustChangePassword}
        initialTab={initialTab}
      />
    );
  }

  const [person, profile] = actor.mustChangePassword
    ? [null, null]
    : await Promise.all([platformStore.person(actor.volunteerId), platformStore.profile(actor.volunteerId)]);

  const roles = actor.assignments
    .map((a: { roleId: string; university: string | null; sector: string | null; id: string }) => describeAssignment(a))
    .map((r: { title: string; scope: string }) => `${r.title} — ${r.scope}`);

  return (
    <AccountHub
      kind="account"
      fullName={actor.fullName}
      email={actor.email || ""}
      username={actor.username}
      forced={actor.mustChangePassword}
      initialTab={initialTab}
      profile={profile || null}
      person={person ? { fullName: person.fullName, university: person.university, major: person.major } : null}
      roles={roles}
    />
  );
}
