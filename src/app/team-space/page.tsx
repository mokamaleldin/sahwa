import type { Metadata } from "next";
import Link from "next/link";
import PageHeading, { PageEmblem } from "../../components/shared/PageIdentity";
import StructuredData from "../../components/StructuredData";
import { absoluteUrl, breadcrumbData, pageMetadata } from "../../lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "فريق صحوة | تنظيم الأنشطة الطلابية والتطوع في إسطنبول",
  description: "تعرف على فريق صحوة وكيف نتعاون في تنظيم الأنشطة الطلابية والمبادرات والعمل التطوعي بين طلاب الجامعات في إسطنبول، وكيف تتواصل معنا.",
  path: "/team-space",
});

export default function TeamSpaceAboutPage() {
  return (
    <>
      <StructuredData data={[
        {
          "@context": "https://schema.org",
          "@type": "AboutPage",
          "@id": absoluteUrl("/team-space#webpage"),
          url: absoluteUrl("/team-space"),
          name: "عن فريق صحوة والعمل الطلابي",
          about: { "@id": absoluteUrl("/#organization") },
        },
        breadcrumbData([
          { name: "الرئيسية", path: "/" },
          { name: "فريق صحوة", path: "/team-space" },
        ]),
      ]} />
      <main className="app-shell sahwa-page-surface pt-24 sm:pt-28 pb-14 sm:pb-20">
        <PageEmblem />
        <div className="page-container max-w-4xl relative z-10">
          <PageHeading title="فريق صحوة" description="نتعاون لنصنع بيئة طلابية نافعة في إسطنبول" />
          <section className="section-card p-6 sm:p-10 mb-6">
            <h2 className="text-xl font-bold text-[#752026] mb-4">عن مساحة الفريق</h2>
            <p className="text-[#350E15]/85 leading-loose">
              مساحة فريق صحوة هي بيئة عمل داخلية تساعد المتطوعين على متابعة الأنشطة الطلابية،
              والتنسيق بين الفرق، وتنظيم الأفكار والمهام. وهي مخصصة للأعضاء المصرح لهم بالدخول.
            </p>
          </section>
          <section className="section-card p-6 sm:p-10 mb-6">
            <h2 className="text-xl font-bold text-[#752026] mb-4">الأنشطة والمبادرات الطلابية</h2>
            <p className="text-[#350E15]/85 leading-loose">
              نلتقي مع طلاب الجامعات في إسطنبول حول الصحبة الصالحة والقرآن والوعي والعمل النافع،
              ونسعى لبناء علاقات ومبادرات طلابية تعين على النمو والتعاون.
            </p>
          </section>
          <div className="flex flex-wrap gap-3">
            <Link href="/universities" className="tap-target rounded-xl bg-[#752026] text-[#F2E9E2] px-6 py-3">اكتشف مجتمعات الجامعات</Link>
            <Link href="/social" className="tap-target rounded-xl border border-[#752026] text-[#752026] px-6 py-3">تواصل مع فريق صحوة</Link>
            <Link href="/login" rel="nofollow" className="tap-target rounded-xl text-[#752026] underline px-3 py-3">دخول أعضاء الفريق</Link>
          </div>
        </div>
      </main>
    </>
  );
}
