import { requirePageActor } from "../../../../../server/page-auth";
export const metadata = { title: "استوديو صحوة" };
export default async function Page() {
  await requirePageActor({ permission: "studio.use" });
  return null;
}
