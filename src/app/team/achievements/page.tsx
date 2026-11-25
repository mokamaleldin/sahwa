import { requirePageActor } from "../../../../server/page-auth";
import PageHeading from "../../../components/shared/PageIdentity";

export const metadata = { title: "إنجازاتي" };

export default async function Page() {
  await requirePageActor();
  return (
    <>
      <PageHeading title="إنجازاتي" description="قريبًا." />
      <p className="platform-empty">
        هنا ستظهر لاحقًا مشاركاتك الموثقة في الفعاليات والمشروعات، والشهادات الإلكترونية بعد اعتمادها.
        لم يُفعّل نظام المشاركات والشهادات بعد، ولا تُحتسب أي مشاركة تلقائيًا.
      </p>
    </>
  );
}
