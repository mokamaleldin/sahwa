import type { ReactNode } from "react";
import type { Metadata } from "next";
import TeamLayout from "../../components/Team/TeamLayout";
import { requirePageUser } from "../../../server/page-auth";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };
export default async function Layout({ children }: { children: ReactNode }) {
  await requirePageUser();
  return <TeamLayout>{children}</TeamLayout>;
}
