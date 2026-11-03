import { redirect } from "next/navigation";
import { SITE_FEATURES } from "../../config/features";
import Library from "../../views/Library";
export default function Page() {
  if (!SITE_FEATURES.library) redirect("/");
  return <Library />;
}
