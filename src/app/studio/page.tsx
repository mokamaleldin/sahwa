import type { Metadata } from "next";
import Studio from "../../views/Studio";
import { requirePageUser } from "../../../server/page-auth";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "استوديو صحوة",
  robots: { index: false, follow: false },
};
export default async function Page() {
  await requirePageUser();
  return <Studio />;
}
