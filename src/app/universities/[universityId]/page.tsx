import type { Metadata } from "next";
import { notFound } from "next/navigation";
import View from "../../../views/UniversityPage";
import StructuredData from "../../../components/StructuredData";
import { getUniversityById, universities } from "../../../data/universities";
import { absoluteUrl, breadcrumbData, pageMetadata } from "../../../lib/seo";

type Props = { params: Promise<{ universityId: string }> };

export function generateStaticParams() {
  return universities.map((university) => ({ universityId: university.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { universityId } = await params;
  const university = getUniversityById(universityId);
  if (!university) notFound();

  return pageMetadata({
    title: "صحوة " + university.name + " | أنشطة ومجتمع طلابي",
    description: university.seoDescription + " " + university.nameEn + " – " + university.nameTr + ".",
    path: "/universities/" + university.id,
    imagePath: "/universities/" + university.id + "/opengraph-image",
  });
}

export default async function Page({ params }: Props) {
  const { universityId } = await params;
  const university = getUniversityById(universityId);
  if (!university) notFound();
  const path = "/universities/" + university.id;
  return (
    <>
      <StructuredData data={[
        {
          "@context": "https://schema.org",
          "@type": "WebPage",
          "@id": absoluteUrl(path + "#webpage"),
          url: absoluteUrl(path),
          name: "صحوة " + university.name + " – مجتمع طلابي",
          description: university.seoDescription,
          inLanguage: "ar",
          isPartOf: { "@id": absoluteUrl("/#website") },
          about: {
            "@type": "CollegeOrUniversity",
            name: university.nameTr,
            alternateName: [university.nameEn, university.name, ...university.aliases],
          },
          mainEntity: {
            "@type": "Organization",
            name: "صحوة " + university.name,
            parentOrganization: { "@id": absoluteUrl("/#organization") },
          },
        },
        breadcrumbData([
          { name: "الرئيسية", path: "/" },
          { name: "الجامعات", path: "/universities" },
          { name: university.name, path },
        ]),
      ]} />
      <View />
    </>
  );
}
