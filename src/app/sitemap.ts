import type { MetadataRoute } from "next";
import { universities } from "../data/universities";
import { SITE_FEATURES } from "../config/features";
import { absoluteUrl } from "../lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["/", "/universities", "/social"];
  if (SITE_FEATURES.library) paths.push("/library");
  return [
    ...paths.map((path) => ({ url: absoluteUrl(path) })),
    ...universities.map((university) => ({
      url: absoluteUrl("/universities/" + university.id),
    })),
  ];
}
