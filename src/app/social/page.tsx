import type { Metadata } from "next";
import View from "../../views/SocialMedia";
import StructuredData from "../../components/StructuredData";
import { absoluteUrl, breadcrumbData, pageMetadata } from "../../lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "تابع صحوة | واتساب وتيليجرام وإنستجرام",
  description: "تابع مجتمع صحوة الطلابي في إسطنبول عبر واتساب وتيليجرام وإنستجرام ويوتيوب وتيك توك، واعرف كيف تتواصل مع فرق صحوة في الجامعات.",
  path: "/social",
  imagePath: "/social/opengraph-image",
});

export default function Page() {
  return (
    <>
      <StructuredData data={[
        {
          "@context": "https://schema.org",
          "@type": "ContactPage",
          "@id": absoluteUrl("/social#webpage"),
          url: absoluteUrl("/social"),
          name: "تابع صحوة وتواصل معنا",
          inLanguage: "ar",
          isPartOf: { "@id": absoluteUrl("/#website") },
          about: { "@id": absoluteUrl("/#organization") },
        },
        breadcrumbData([
          { name: "الرئيسية", path: "/" },
          { name: "تابعنا", path: "/social" },
        ]),
      ]} />
      <View />
    </>
  );
}
