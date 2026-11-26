import { requirePageActor } from "../../../../server/page-auth";
import Relations from "../../../views/platform/Relations";
export const metadata = { title: "سجل العلاقات" };
export default async function Page({ searchParams }: { searchParams: Promise<{ new?: string }> }) {
  await requirePageActor({ permission: "relations.open" });
  return <Relations openNew={(await searchParams).new === "1"} />;
}
