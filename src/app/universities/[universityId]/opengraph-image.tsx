import { notFound } from "next/navigation";
import { getUniversityById } from "../../../data/universities";
import { makeOgImage } from "../../../lib/og-image";

export const runtime = "nodejs";
export const alt = "صحوة – المجتمع الطلابي في الجامعة";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ universityId: string }> }) {
  const { universityId } = await params;
  const university = getUniversityById(universityId);
  if (!university) notFound();
  return makeOgImage("صحوة " + university.name, university.nameEn + " • إسطنبول");
}
