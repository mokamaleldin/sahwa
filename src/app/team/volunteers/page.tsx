import Volunteers from "../../../views/TeamVolunteers";
import { requirePageActor } from "../../../../server/page-auth";
export default async function Page({ searchParams }: { searchParams: Promise<{ assignment?: string }> }) {
  await requirePageActor({ permission: "volunteers.open" });
  return <Volunteers assignment={(await searchParams).assignment} />;
}
