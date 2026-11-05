import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export async function makeOgImage(heading: string, subtitle: string) {
  const [font, logo] = await Promise.all([
    readFile(join(process.cwd(), "public/fonts/ibm-plex/IBMPlexSansArabic-Bold.ttf")),
    readFile(join(process.cwd(), "public/sahwa-icon.png")),
  ]);
  const logoData = "data:image/png;base64," + logo.toString("base64");

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        height: "100%",
        padding: 76,
        background: "#F2E9E2",
        color: "#752026",
        fontFamily: "Plex Arabic",
        direction: "rtl",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
        <img src={logoData} alt="" width={148} height={148} />
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 840, gap: 18 }}>
          <div style={{ fontSize: 54, fontWeight: 700, lineHeight: 1.35 }}>{heading}</div>
          <div style={{ fontSize: 29, color: "#594648", lineHeight: 1.5 }}>{subtitle}</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "2px solid #D6AD63", paddingTop: 26 }}>
        <span style={{ fontSize: 29 }}>صحوة | Sahwa</span>
        <span style={{ fontSize: 24, direction: "ltr" }}>sahwa.world</span>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [{ name: "Plex Arabic", data: Uint8Array.from(font).buffer as ArrayBuffer, weight: 700, style: "normal" }],
    },
  );
}
