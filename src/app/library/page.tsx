import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SITE_FEATURES } from "../../config/features";
import { pageMetadata } from "../../lib/seo";
import Library from "../../views/Library";

export const metadata: Metadata = pageMetadata({
  title: "مكتبة صحوة في إسطنبول | كتب وقراءة",
  description: "تعرف على مكتبة صحوة في إسطنبول، كتبها ومكانها وطريقة الوصول إليها.",
  path: "/library",
});

export default function Page() {
  if (!SITE_FEATURES.library) redirect("/");
  return <Library />;
}
