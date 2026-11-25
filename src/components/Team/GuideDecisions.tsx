"use client";

import { useMemo } from "react";
import GuideBooklet from "./GuideBooklet";
import { parseDecisionsBook } from "../../lib/structureParser";

export default function GuideDecisions({ source }: { source: string }) {
  const chapters = useMemo(() => parseDecisionsBook(source), [source]);

  return (
    <section
      id="guide-decisions-booklet"
      className="guide-decisions"
      data-decisions=""
      aria-label="الباب الثالث: اتخاذ القرار والمجلس والتفويض"
    >
      <GuideBooklet
        title="اتخاذ القرار والمجلس والتفويض"
        filename="sahwa-decisions-booklet"
        chapters={chapters}
      />
    </section>
  );
}
