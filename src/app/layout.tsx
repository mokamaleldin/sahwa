import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import Providers from "./providers";
import StructuredData from "../components/StructuredData";
import { HOME_DESCRIPTION, SITE_URL } from "../lib/seo";
import "../index.css";
import "../team.css";
import "../guide.css";
import "../guide-identity.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: "صحوة",
  title: {
    default: "صحوة | أنشطة طلابية ومجتمع طلابي في إسطنبول",
    template: "%s | صحوة",
  },
  description: HOME_DESCRIPTION,
  icons: { icon: "/sahwa-icon.png", apple: "/sahwa-icon.png" },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "ar_EG",
    siteName: "صحوة | Sahwa",
    title: "صحوة | أنشطة طلابية ومجتمع طلابي في إسطنبول",
    description: HOME_DESCRIPTION,
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "صحوة | Sahwa",
    description: HOME_DESCRIPTION,
  },
};
export const viewport: Viewport = { themeColor: "#752026" };

const siteStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": SITE_URL + "/#organization",
      name: "صحوة",
      alternateName: ["Sahwa", "صحوه", "Sahwa Turkey"],
      description: HOME_DESCRIPTION,
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: SITE_URL + "/logo.png" },
      sameAs: [
        "https://www.instagram.com/sahwa.tr/",
        "https://www.youtube.com/@sahwatr",
        "https://t.me/sahwatr",
        "https://www.tiktok.com/@sahwa.tr",
        "https://whatsapp.com/channel/0029Vb7fQXK5K3zbii8FQN2y",
      ],
    },
    {
      "@type": "WebSite",
      "@id": SITE_URL + "/#website",
      name: "صحوة | Sahwa",
      alternateName: "صحوة",
      url: SITE_URL + "/",
      inLanguage: "ar",
      publisher: { "@id": SITE_URL + "/#organization" },
    },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preload" href="/fonts/milan/milan-display-black.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/ibm-plex/IBMPlexSansArabic-Regular.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body>
        <StructuredData data={siteStructuredData} />
        <div id="root">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
