import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import Providers from "./providers";
import "../index.css";
import "../team.css";
import "../guide.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://sahwa.world"),
  title: "صحوة | Sahwa - مجتمع طلابي شبابي في الجامعات التركية",
  description:
    "صحوة مساحة شبابية لطلاب الجامعات في تركيا. نجتمع حول الصحبة الصالحة والوعي والعمل.",
  icons: { icon: "/logo.png", apple: "/logo.png" },
  manifest: "/site.webmanifest",
};
export const viewport: Viewport = { themeColor: "#752026" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link
          rel="preload"
          href="/fonts/milan/milan-display-black.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/ibm-plex/IBMPlexSansArabic-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <div id="root">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
