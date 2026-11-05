import type { Metadata } from "next";
import View from "../../views/Universities";
import StructuredData from "../../components/StructuredData";
import { universities } from "../../data/universities";
import { absoluteUrl, breadcrumbData, pageMetadata } from "../../lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "مجتمعات الجامعات في إسطنبول | استينيا وبيلجي وجيليشيم",
  description: "تعرّف على أنشطة ومجتمعات صحوة الطلابية في جامعات إسطنبول: جامعة استينيا، جامعة بيلجي وجامعة جيليشيم. اختر جامعتك وانضم إلى صحبة طلابية نافعة.",
  path: "/universities",
  imagePath: "/universities/opengraph-image",
});

export default function Page() {
  return (
    <>
      <StructuredData data={[
        {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "@id": absoluteUrl("/universities#webpage"),
          url: absoluteUrl("/universities"),
          name: "مجتمعات صحوة الطلابية في جامعات إسطنبول",
          inLanguage: "ar",
          isPartOf: { "@id": absoluteUrl("/#website") },
          mainEntity: {
            "@type": "ItemList",
            itemListElement: universities.map((university, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: university.name,
              url: absoluteUrl("/universities/" + university.id),
            })),
          },
        },
        breadcrumbData([
          { name: "الرئيسية", path: "/" },
          { name: "الجامعات", path: "/universities" },
        ]),
      ]} />
      <View />
    </>
  );
}
