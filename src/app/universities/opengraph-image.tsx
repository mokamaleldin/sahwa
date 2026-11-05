import { makeOgImage } from "../../lib/og-image";

export const runtime = "nodejs";
export const alt = "جامعات صحوة في إسطنبول – استينيا وبيلجي وجيليشيم";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return makeOgImage("الجامعات", "مجتمعات صحوة الطلابية في جامعات إسطنبول");
}
