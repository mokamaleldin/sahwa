import type { Metadata } from "next";
import View from "../views/Home";
import StructuredData from "../components/StructuredData";
import { HOME_DESCRIPTION, SITE_URL, pageMetadata } from "../lib/seo";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "أنشطة طلابية ومجتمع طلابي في إسطنبول",
    description: HOME_DESCRIPTION,
    path: "/",
  }),
  title: { absolute: "صحوة | أنشطة طلابية ومجتمع طلابي في إسطنبول" },
};

export default function Page() {
  return (
    <>
      <StructuredData data={{
        "@context": "https://schema.org",
        "@type": "WebPage",
        "@id": SITE_URL + "/#webpage",
        url: SITE_URL + "/",
        name: "صحوة | أنشطة طلابية ومجتمع طلابي في إسطنبول",
        description: HOME_DESCRIPTION,
        inLanguage: "ar",
        isPartOf: { "@id": SITE_URL + "/#website" },
        about: { "@id": SITE_URL + "/#organization" },
      }} />
      <View />
    </>
  );
}
