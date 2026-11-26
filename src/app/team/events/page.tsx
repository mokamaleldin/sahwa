import Events from "../../../views/TeamEvents";
import { requirePageActor } from "../../../../server/page-auth";
export default async function Page({ searchParams }: { searchParams: Promise<{ new?: string }> }) {
  await requirePageActor({ permission: "events.open" });
  return <Events openNew={(await searchParams).new === "1"} />;
}
