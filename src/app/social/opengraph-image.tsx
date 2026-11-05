import { makeOgImage } from "../../lib/og-image";

export const runtime = "nodejs";
export const alt = "تابع صحوة على واتساب وتيليجرام وإنستجرام";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return makeOgImage("تابع صحوة", "مجموعات الجامعات ومنصات التواصل الاجتماعي");
}
