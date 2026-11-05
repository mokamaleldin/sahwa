import { makeOgImage } from "../lib/og-image";

export const runtime = "nodejs";
export const alt = "شعار صحوة – مجتمع طلابي وأنشطة طلابية في إسطنبول";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return makeOgImage("صحوة", "أنشطة طلابية ومجتمع طلابي في إسطنبول");
}
