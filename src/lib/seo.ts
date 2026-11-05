import type { Metadata } from "next";

export const SITE_URL = "https://sahwa.world";
export const SITE_NAME = "صحوة | Sahwa";
export const HOME_DESCRIPTION =
  "صحوة مجتمع طلابي في إسطنبول يجمع طلاب الجامعات التركية على الصحبة الصالحة والقرآن والتعارف والمبادرات والأنشطة الطلابية النافعة.";

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}

export function pageMetadata({
  title,
  description,
  path,
  imagePath = "/opengraph-image",
}: {
  title: string;
  description: string;
  path: string;
  imagePath?: string;
}): Metadata {
  const fullTitle = title + " | صحوة";
  const image = absoluteUrl(imagePath);
  return {
    title,
    description,
    alternates: { canonical: absoluteUrl(path) },
    openGraph: {
      type: "website",
      locale: "ar_EG",
      siteName: SITE_NAME,
      title: fullTitle,
      description,
      url: absoluteUrl(path),
      images: [{ url: image, width: 1200, height: 630, alt: fullTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image],
    },
  };
}

export function breadcrumbData(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
