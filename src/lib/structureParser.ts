import type { GovernanceBlock } from "../data/sahwaGovernance";

export interface StructureChapter {
  id: string;
  label: string;
  markdown: string;
  blocks: GovernanceBlock[];
}

export interface StructureEntry {
  id: string;
  title: string;
  kind: "board" | "unit" | "role" | "general";
  blocks: GovernanceBlock[];
  childIds?: string[];
}

export interface ParsedStructureBook {
  chapters: StructureChapter[];
  entries: Map<string, StructureEntry>;
}

const CHAPTER_BOUNDARIES: Array<{ id: string; label: string; marker: string }> = [
  { id: "2.1", label: "الهيكل التنظيمي العام لصحوة", marker: "## الفصل 2.1 — الهيكل التنظيمي العام لصحوة" },
  { id: "2.2", label: "مجلس الإدارة المركزي", marker: "# الفصل 2.2 — مجلس الإدارة المركزي" },
  { id: "2.3", label: "مسؤول صحوة", marker: "# الفصل 2.3 — مسؤول صحوة" },
  { id: "2.4", label: "مسؤولة قطاع الطالبات", marker: "# الفصل 2.4 — مسؤولة قطاع الطالبات" },
  { id: "2.5", label: "مسؤولو وأعضاء الوحدات المركزية", marker: "\n2.5\n" },
  { id: "2.6", label: "مسؤولو وأعضاء الفرق الجامعية", marker: "# الباب الثاني: الهيكل الإداري والأدوار والصلاحيات\n\n## الفصل 2.6 — مسؤولو وأعضاء الفرق الجامعية" },
  { id: "2.7", label: "الفرق المساندة والمتابعة والمراجعة والتظلمات", marker: "الفصل 2.7 — الفرق المساندة والمتابعة والمراجعة والتظلمات" },
  { id: "2.8", label: "قيادة الفعاليات والمشروعات", marker: "### أولًا: الفرق بين المسؤول الإداري وقائد الفعالية" },
  { id: "2.9", label: "قواعد التبعية والتنسيق والإنابة", marker: "## الفصل 2.9 — قواعد التبعية والتنسيق والإنابة" },
];

function trimDivider(text: string): string {
  return text
    .replace(/^\s*---\s*(?:\r?\n|$)/, "")
    .replace(/(?:^|\r?\n)\s*---\s*$/, "")
    .trim();
}

function sliceBetween(source: string, startMarker: string, endMarker?: string, includeStart = true): string {
  const startIndex = source.indexOf(startMarker);
  if (startIndex === -1) return "";
  const from = includeStart ? startIndex : startIndex + startMarker.length;
  if (!endMarker) return trimDivider(source.slice(from));
  const endIndex = source.indexOf(endMarker, from);
  if (endIndex === -1) return trimDivider(source.slice(from));
  return trimDivider(source.slice(from, endIndex));
}

function parseTableCells(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

export function parseMarkdownBlocks(markdown: string): GovernanceBlock[] {
  const blocks: GovernanceBlock[] = [];
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  let index = 0;

  while (index < lines.length) {
    const line = lines[index].trim();
    if (!line || line === "---") {
      index += 1;
      continue;
    }

    const heading = /^(#{1,4})\s+(.+)$/.exec(line);
    if (heading) {
      blocks.push({ kind: "heading", text: heading[2].trim() });
      index += 1;
      continue;
    }

    if (
      line.startsWith("|") &&
      index + 1 < lines.length &&
      /^\|[\s:|-]+\|$/.test(lines[index + 1].trim())
    ) {
      const headers = parseTableCells(line);
      index += 2;
      const rows: string[][] = [];
      while (index < lines.length && lines[index].trim().startsWith("|")) {
        rows.push(parseTableCells(lines[index]));
        index += 1;
      }
      blocks.push({ kind: "table", headers, rows });
      continue;
    }

    if (/^- /.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^- /.test(lines[index].trim())) {
        items.push(lines[index].trim().slice(2));
        index += 1;
      }
      blocks.push({ kind: "list", ordered: false, items });
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\d+\.\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^\d+\.\s+/, ""));
        index += 1;
      }
      blocks.push({ kind: "list", ordered: true, items });
      continue;
    }

    blocks.push({ kind: "paragraph", text: line });
    index += 1;
  }

  return blocks;
}

function splitChapters(source: string): StructureChapter[] {
  const normalized = source.replace(/\r\n/g, "\n");
  const starts = CHAPTER_BOUNDARIES.map((item) => {
    const idx = normalized.indexOf(item.marker);
    return { ...item, idx };
  });

  return starts.map((item, i) => {
    const next = starts[i + 1];
    let raw = item.idx === -1
      ? ""
      : normalized.slice(item.idx, next && next.idx !== -1 ? next.idx : normalized.length);
    if (item.id === "2.5") {
      raw = raw.replace(/^\n?2\.5\n/, "");
    }
    const markdown = trimDivider(raw);
    return {
      id: item.id,
      label: item.label,
      markdown,
      blocks: parseMarkdownBlocks(markdown),
    };
  });
}

function joinParts(...parts: string[]): GovernanceBlock[] {
  const combined = parts.map(trimDivider).filter(Boolean).join("\n\n");
  return parseMarkdownBlocks(combined);
}

const DECISIONS_BOUNDARIES: Array<{ id: string; label: string; marker: string }> = [
  { id: "3.1", label: "مصفوفة الصلاحيات والاعتماد", marker: "الفصل 3.1 — مصفوفة الصلاحيات والاعتماد" },
  { id: "3.2", label: "القرارات الخاصة بمجلس الإدارة المركزي", marker: "**الفصل 3.2 — القرارات الخاصة بمجلس الإدارة المركزي**" },
  { id: "3.3", label: "اجتماعات المجلس والنصاب والتصويت", marker: "الباب الثالث — الفصل 3.4" },
  { id: "3.4", label: "اتخاذ القرار داخل الفرق واللجان", marker: "# الفصل 3.4 — اتخاذ القرار داخل الفرق واللجان" },
  { id: "3.5", label: "القرارات المشتركة بين الجهات", marker: "# الفصل 3.5 — القرارات المشتركة بين الجهات" },
];

const DECISION_CHAPTER_TITLE = /^(?:\*\*)?(?:الفصل\s+3\.\d+\s*—.+|الباب الثالث — الفصل 3\.4)(?:\*\*)?$/;
const DECISION_ORDINAL_HEADING =
  /^\*\*(?:أولًا|ثانيًا|ثالثًا|رابعًا|خامسًا|سادسًا|سابعًا|ثامنًا|تاسعًا|عاشرًا):[^*]+\*\*$/;

function parseDecisionBlocks(markdown: string): GovernanceBlock[] {
  return parseMarkdownBlocks(markdown).map((block) => {
    if (block.kind !== "paragraph") return block;
    if (DECISION_CHAPTER_TITLE.test(block.text) || DECISION_ORDINAL_HEADING.test(block.text)) {
      return {
        kind: "heading",
        text: block.text.replace(/^\*\*/, "").replace(/\*\*$/, ""),
      };
    }
    return block;
  });
}

export function parseDecisionsBook(source: string): StructureChapter[] {
  const normalized = source.replace(/\r\n/g, "\n");
  const starts = DECISIONS_BOUNDARIES.map((item) => ({
    ...item,
    idx: normalized.indexOf(item.marker),
  }));

  return starts.map((item, i) => {
    const next = starts[i + 1];
    const raw =
      item.idx === -1
        ? ""
        : normalized.slice(item.idx, next && next.idx !== -1 ? next.idx : normalized.length);
    const markdown = trimDivider(raw);
    return {
      id: item.id,
      label: item.label,
      markdown,
      blocks: parseDecisionBlocks(markdown),
    };
  });
}

export function parseIdentityBook(source: string): StructureChapter[] {
  const rawChapters = source
    .replace(/\r\n/g, "\n")
    .trim()
    .split(/\n---\n/);

  return rawChapters.map((raw, index) => {
    const markdown = trimDivider(raw);
    const firstLine = markdown.split("\n")[0] || "";
    const label = firstLine
      .replace(/^#{1,4}\s+/, "")
      .replace(/^الفصل\s+[\d.]+\s*—\s*/, "")
      .trim();
    return {
      id: `1.${index + 1}`,
      label: label || `الفصل ${index + 1}`,
      markdown,
      blocks: parseMarkdownBlocks(markdown),
    };
  });
}

export function parseStructureBook(source: string): ParsedStructureBook {
  const chapters = splitChapters(source);
  const byId = new Map(chapters.map((chapter) => [chapter.id, chapter.markdown]));
  const c21 = byId.get("2.1") || "";
  const c22 = byId.get("2.2") || "";
  const c23 = byId.get("2.3") || "";
  const c24 = byId.get("2.4") || "";
  const c25 = byId.get("2.5") || "";
  const c26 = byId.get("2.6") || "";
  const c27 = byId.get("2.7") || "";
  const c28 = byId.get("2.8") || "";
  const c29 = byId.get("2.9") || "";

  const stripTopHeading = (md: string) =>
    md.replace(/^(?:#{1,2}\s+.+\n+)+/, "").trim();

  const definitions: StructureEntry[] = [
    // Board & top leadership
    {
      id: "board",
      title: "مجلس الإدارة المركزي",
      kind: "board",
      blocks: parseMarkdownBlocks(stripTopHeading(c22)),
      childIds: [
        "sahwa-lead",
        "women-sector-lead",
        "central-youth-lead",
        "central-women-lead",
        "central-media-lead",
        "central-relations-lead",
      ],
    },
    {
      id: "sahwa-lead",
      title: "مسؤول صحوة",
      kind: "role",
      blocks: parseMarkdownBlocks(stripTopHeading(c23)),
    },
    {
      id: "women-sector-lead",
      title: "مسؤولة قطاع الطالبات",
      kind: "role",
      blocks: parseMarkdownBlocks(stripTopHeading(c24)),
    },

    // University track (2.6 + 2.1)
    {
      id: "universities",
      title: "فرق صحوة الجامعية",
      kind: "unit",
      blocks: joinParts(
        sliceBetween(c26, "### أولًا: فرق صحوة الجامعية", "### ثانيًا: مجلس إدارة الجامعة"),
        sliceBetween(c21, "#### 6. متابعة الجامعات", "### خامسًا: المسار المشترك"),
      ),
      childIds: [
        "university-board",
        "university-youth-coordinator",
        "university-women-coordinator",
        "internal-youth-activities",
        "internal-women-activities",
        "university-relations",
        "university-media",
      ],
    },
    {
      id: "university-board",
      title: "مجلس إدارة الجامعة",
      kind: "unit",
      blocks: joinParts(
        sliceBetween(c26, "### ثانيًا: مجلس إدارة الجامعة", "### ثالثًا: فريق الشباب داخل الجامعة"),
      ),
      childIds: [
        "university-youth-coordinator",
        "university-women-coordinator",
        "internal-youth-activities",
        "internal-women-activities",
        "university-relations-lead",
      ],
    },
    {
      id: "university-youth",
      title: "فريق الشباب داخل الجامعة",
      kind: "unit",
      blocks: joinParts(
        sliceBetween(c26, "### ثالثًا: فريق الشباب داخل الجامعة", "#### 1. مسؤول الشباب داخل الجامعة"),
      ),
      childIds: [
        "university-youth-coordinator",
        "internal-youth-activities",
        "university-youth-activities-member",
      ],
    },
    {
      id: "university-youth-coordinator",
      title: "مسؤول الشباب داخل الجامعة",
      kind: "role",
      blocks: joinParts(
        sliceBetween(c26, "#### 1. مسؤول الشباب داخل الجامعة", "#### 2. مسؤول الأنشطة الداخلية للشباب", false),
      ),
    },
    {
      id: "internal-youth-activities",
      title: "مسؤول الأنشطة الداخلية للشباب",
      kind: "role",
      blocks: joinParts(
        sliceBetween(c26, "#### 2. مسؤول الأنشطة الداخلية للشباب", "#### 3. عضو لجنة الأنشطة الداخلية للشباب", false),
      ),
    },
    {
      id: "university-youth-activities-member",
      title: "عضو لجنة الأنشطة الداخلية للشباب",
      kind: "role",
      blocks: joinParts(
        sliceBetween(c26, "#### 3. عضو لجنة الأنشطة الداخلية للشباب", "### رابعًا: فريق الطالبات داخل الجامعة", false),
      ),
    },
    {
      id: "university-women",
      title: "فريق الطالبات داخل الجامعة",
      kind: "unit",
      blocks: joinParts(
        sliceBetween(c26, "### رابعًا: فريق الطالبات داخل الجامعة", "#### 1. مسؤولة الطالبات داخل الجامعة"),
      ),
      childIds: [
        "university-women-coordinator",
        "internal-women-activities",
        "university-women-activities-member",
      ],
    },
    {
      id: "university-women-coordinator",
      title: "مسؤولة الطالبات داخل الجامعة",
      kind: "role",
      blocks: joinParts(
        sliceBetween(c26, "#### 1. مسؤولة الطالبات داخل الجامعة", "#### 2. مسؤولة الأنشطة الداخلية للطالبات", false),
      ),
    },
    {
      id: "internal-women-activities",
      title: "مسؤولة الأنشطة الداخلية للطالبات",
      kind: "role",
      blocks: joinParts(
        sliceBetween(c26, "#### 2. مسؤولة الأنشطة الداخلية للطالبات", "#### 3. عضوة لجنة الأنشطة الداخلية للطالبات", false),
      ),
    },
    {
      id: "university-women-activities-member",
      title: "عضوة لجنة الأنشطة الداخلية للطالبات",
      kind: "role",
      blocks: joinParts(
        sliceBetween(c26, "#### 3. عضوة لجنة الأنشطة الداخلية للطالبات", "### خامسًا: الفرق المساندة داخل الجامعة", false),
      ),
    },
    {
      id: "university-relations",
      title: "العلاقات الجامعية",
      kind: "unit",
      blocks: joinParts(
        sliceBetween(c21, "**أ. العلاقات الجامعية**", "**ب. الإعلام الميداني**"),
        sliceBetween(c26, "**1. العلاقات الجامعية**", "**2. الإعلام الميداني**"),
      ),
      childIds: ["university-relations-lead", "university-relations-member"],
    },
    {
      id: "university-relations-lead",
      title: "مسؤول العلاقات الجامعية",
      kind: "role",
      blocks: joinParts(
        sliceBetween(c21, "**أ. العلاقات الجامعية**", "**ب. الإعلام الميداني**"),
        sliceBetween(c26, "**1. العلاقات الجامعية**", "**2. الإعلام الميداني**"),
      ),
    },
    {
      id: "university-relations-member",
      title: "عضو العلاقات الجامعية",
      kind: "role",
      blocks: joinParts(
        sliceBetween(c21, "**أ. العلاقات الجامعية**", "**ب. الإعلام الميداني**"),
        sliceBetween(c26, "**1. العلاقات الجامعية**", "**2. الإعلام الميداني**"),
      ),
    },
    {
      id: "university-media",
      title: "الإعلام الميداني",
      kind: "unit",
      blocks: joinParts(
        sliceBetween(c21, "**ب. الإعلام الميداني**", "**ج. اللجان الإضافية**"),
        sliceBetween(c26, "**2. الإعلام الميداني**", "**3. اللجان الإضافية**"),
      ),
      childIds: ["field-media-member"],
    },
    {
      id: "field-media-member",
      title: "عضو الإعلام الميداني",
      kind: "role",
      blocks: joinParts(
        sliceBetween(c21, "**ب. الإعلام الميداني**", "**ج. اللجان الإضافية**"),
        sliceBetween(c26, "**2. الإعلام الميداني**", "**3. اللجان الإضافية**"),
      ),
    },
    {
      id: "additional-committees",
      title: "اللجان الإضافية داخل الجامعة",
      kind: "unit",
      blocks: joinParts(
        sliceBetween(c21, "**ج. اللجان الإضافية**", "#### 5. المتطوعون خارج اللجان"),
        sliceBetween(c26, "**3. اللجان الإضافية**", "### سادسًا: المتطوعون خارج اللجان"),
      ),
    },
    {
      id: "university-volunteers",
      title: "المتطوعون خارج اللجان",
      kind: "role",
      blocks: joinParts(
        sliceBetween(c26, "### سادسًا: المتطوعون خارج اللجان"),
        sliceBetween(c21, "#### 5. المتطوعون خارج اللجان", "#### 6. متابعة الجامعات"),
      ),
    },

    // Central track (2.5 + 2.1)
    {
      id: "central",
      title: "الفرق والوحدات المركزية",
      kind: "unit",
      blocks: joinParts(
        sliceBetween(c25, "### أولًا: مفهوم الفرق والوحدات المركزية", "## 1. فريق أنشطة الشباب المركزية"),
        sliceBetween(c21, "### خامسًا: المسار المشترك — الفرق والوحدات المركزية", "### سادسًا: المساندة الإدارية"),
      ),
      childIds: [
        "central-youth-lead",
        "central-women-lead",
        "central-media-lead",
        "central-relations-lead",
        "expansion-lead",
        "technology-lead",
        "programs-lead",
      ],
    },
    {
      id: "central-youth",
      title: "فريق أنشطة الشباب المركزية",
      kind: "unit",
      blocks: joinParts(
        sliceBetween(c25, "### تعريف الفريق", "### 1.1 مسؤول أنشطة الشباب المركزية"),
      ),
      childIds: ["central-youth-lead", "central-youth-member"],
    },
    {
      id: "central-youth-lead",
      title: "مسؤول أنشطة الشباب المركزية",
      kind: "role",
      blocks: joinParts(
        sliceBetween(c25, "### 1.1 مسؤول أنشطة الشباب المركزية", "### 1.2 عضو أنشطة الشباب المركزية", false),
      ),
    },
    {
      id: "central-youth-member",
      title: "عضو أنشطة الشباب المركزية",
      kind: "role",
      blocks: joinParts(
        sliceBetween(c25, "### 1.2 عضو أنشطة الشباب المركزية", "## 2. فريق أنشطة الطالبات المركزية", false),
      ),
    },
    {
      id: "central-women",
      title: "فريق أنشطة الطالبات المركزية",
      kind: "unit",
      blocks: joinParts(
        sliceBetween(
          sliceBetween(c25, "## 2. فريق أنشطة الطالبات المركزية", "## 3. الإعلام المركزي"),
          "### تعريف الفريق",
          "### 2.1 مسؤولة أنشطة الطالبات المركزية",
        ),
      ),
      childIds: ["central-women-lead", "central-women-member"],
    },
    {
      id: "central-women-lead",
      title: "مسؤولة أنشطة الطالبات المركزية",
      kind: "role",
      blocks: joinParts(
        sliceBetween(c25, "### 2.1 مسؤولة أنشطة الطالبات المركزية", "### 2.2 عضوة أنشطة الطالبات المركزية", false),
      ),
    },
    {
      id: "central-women-member",
      title: "عضوة أنشطة الطالبات المركزية",
      kind: "role",
      blocks: joinParts(
        sliceBetween(c25, "### 2.2 عضوة أنشطة الطالبات المركزية", "## 3. الإعلام المركزي", false),
      ),
    },
    {
      id: "central-media",
      title: "الإعلام المركزي",
      kind: "unit",
      blocks: joinParts(
        sliceBetween(
          sliceBetween(c25, "## 3. الإعلام المركزي", "## 4. العلاقات العامة المركزية"),
          "### تعريف الوحدة",
          "### 3.1 مسؤول الإعلام المركزي",
        ),
      ),
      childIds: ["central-media-lead", "central-media-member", "field-media-member"],
    },
    {
      id: "central-media-lead",
      title: "مسؤول الإعلام المركزي",
      kind: "role",
      blocks: joinParts(
        sliceBetween(c25, "### 3.1 مسؤول الإعلام المركزي", "### 3.2 عضو الإعلام المركزي", false),
      ),
    },
    {
      id: "central-media-member",
      title: "عضو الإعلام المركزي",
      kind: "role",
      blocks: joinParts(
        sliceBetween(c25, "### 3.2 عضو الإعلام المركزي", "## 4. العلاقات العامة المركزية", false),
      ),
    },
    {
      id: "central-relations",
      title: "العلاقات العامة المركزية",
      kind: "unit",
      blocks: joinParts(
        sliceBetween(
          sliceBetween(c25, "## 4. العلاقات العامة المركزية", "## 5. وحدة التوسع والتدريب"),
          "### تعريف الوحدة",
          "### 4.1 مسؤول العلاقات العامة المركزية",
        ),
      ),
      childIds: ["central-relations-lead", "central-relations-member"],
    },
    {
      id: "central-relations-lead",
      title: "مسؤول العلاقات العامة المركزية",
      kind: "role",
      blocks: joinParts(
        sliceBetween(c25, "### 4.1 مسؤول العلاقات العامة المركزية", "### 4.2 عضو العلاقات العامة المركزية", false),
      ),
    },
    {
      id: "central-relations-member",
      title: "عضو العلاقات العامة المركزية",
      kind: "role",
      blocks: joinParts(
        sliceBetween(c25, "### 4.2 عضو العلاقات العامة المركزية", "## 5. وحدة التوسع والتدريب", false),
      ),
    },
    {
      id: "expansion",
      title: "وحدة التوسع والتدريب",
      kind: "unit",
      blocks: joinParts(
        sliceBetween(
          sliceBetween(c25, "## 5. وحدة التوسع والتدريب", "## 6. وحدة التقنية والمنصة"),
          "### تعريف الوحدة",
          "### 5.1 مسؤول التوسع والتدريب",
        ),
      ),
      childIds: ["expansion-lead", "expansion-member"],
    },
    {
      id: "expansion-lead",
      title: "مسؤول التوسع والتدريب",
      kind: "role",
      blocks: joinParts(
        sliceBetween(c25, "### 5.1 مسؤول التوسع والتدريب", "### 5.2 عضو فريق التوسع والتدريب", false),
      ),
    },
    {
      id: "expansion-member",
      title: "عضو فريق التوسع والتدريب",
      kind: "role",
      blocks: joinParts(
        sliceBetween(c25, "### 5.2 عضو فريق التوسع والتدريب", "## 6. وحدة التقنية والمنصة", false),
      ),
    },
    {
      id: "technology",
      title: "وحدة التقنية والمنصة",
      kind: "unit",
      blocks: joinParts(
        sliceBetween(
          sliceBetween(c25, "## 6. وحدة التقنية والمنصة", "## 7. وحدة البرامج والبحوث"),
          "### تعريف الوحدة",
          "### 6.1 مسؤول التقنية والمنصة",
        ),
      ),
      childIds: ["technology-lead", "technology-member"],
    },
    {
      id: "technology-lead",
      title: "مسؤول التقنية والمنصة",
      kind: "role",
      blocks: joinParts(
        sliceBetween(c25, "### 6.1 مسؤول التقنية والمنصة", "### 6.2 عضو الفريق التقني", false),
      ),
    },
    {
      id: "technology-member",
      title: "عضو الفريق التقني",
      kind: "role",
      blocks: joinParts(
        sliceBetween(c25, "### 6.2 عضو الفريق التقني", "## 7. وحدة البرامج والبحوث", false),
      ),
    },
    {
      id: "programs",
      title: "وحدة البرامج والبحوث",
      kind: "unit",
      blocks: joinParts(
        sliceBetween(
          sliceBetween(c25, "## 7. وحدة البرامج والبحوث"),
          "### تعريف الوحدة",
          "### 7.1 مسؤول البرامج والبحوث",
        ),
      ),
      childIds: ["programs-lead", "programs-member"],
    },
    {
      id: "programs-lead",
      title: "مسؤول البرامج والبحوث",
      kind: "role",
      blocks: joinParts(
        sliceBetween(c25, "### 7.1 مسؤول البرامج والبحوث", "### 7.2 عضو فريق البرامج والبحوث", false),
      ),
    },
    {
      id: "programs-member",
      title: "عضو فريق البرامج والبحوث",
      kind: "role",
      blocks: joinParts(
        sliceBetween(c25, "### 7.2 عضو فريق البرامج والبحوث", undefined, false),
      ),
    },

    // Administrative Support & Review (2.7)
    {
      id: "admin-support",
      title: "المساندة الإدارية",
      kind: "unit",
      blocks: joinParts(
        sliceBetween(c27, "### أولًا: المساندة الإدارية", "## 1. المالية"),
        sliceBetween(c21, "### سادسًا: المساندة الإدارية", "### سابعًا: المتابعة والمراجعة والتظلمات"),
      ),
      childIds: ["finance-lead", "finance-member", "records-lead", "records-member"],
    },
    {
      id: "finance",
      title: "المالية",
      kind: "unit",
      blocks: joinParts(
        sliceBetween(
          sliceBetween(c27, "## 1. المالية", "## 2. التوثيق والأرشفة المركزية"),
          "### تعريف الفريق",
          "### 1.1 مسؤول المالية",
        ),
      ),
      childIds: ["finance-lead", "finance-member"],
    },
    {
      id: "finance-lead",
      title: "مسؤول المالية",
      kind: "role",
      blocks: joinParts(
        sliceBetween(c27, "### 1.1 مسؤول المالية", "### 1.2 عضو الفريق المالي", false),
      ),
    },
    {
      id: "finance-member",
      title: "عضو الفريق المالي",
      kind: "role",
      blocks: joinParts(
        sliceBetween(c27, "### 1.2 عضو الفريق المالي", "## 2. التوثيق والأرشفة المركزية", false),
      ),
    },
    {
      id: "records",
      title: "التوثيق والأرشفة المركزية",
      kind: "unit",
      blocks: joinParts(
        sliceBetween(
          sliceBetween(c27, "## 2. التوثيق والأرشفة المركزية", "### ثانيًا: المتابعة والمراجعة والتظلمات"),
          "### تعريف الفريق",
          "### 2.1 مسؤول التوثيق والأرشفة المركزية",
        ),
      ),
      childIds: ["records-lead", "records-member"],
    },
    {
      id: "records-lead",
      title: "مسؤول التوثيق والأرشفة المركزية",
      kind: "role",
      blocks: joinParts(
        sliceBetween(c27, "### 2.1 مسؤول التوثيق والأرشفة المركزية", "### 2.2 عضو التوثيق والأرشفة", false),
      ),
    },
    {
      id: "records-member",
      title: "عضو التوثيق والأرشفة",
      kind: "role",
      blocks: joinParts(
        sliceBetween(c27, "### 2.2 عضو التوثيق والأرشفة", "### ثانيًا: المتابعة والمراجعة والتظلمات", false),
      ),
    },
    {
      id: "review",
      title: "مجلس المتابعة والمراجعة والتظلمات",
      kind: "unit",
      blocks: joinParts(
        sliceBetween(c27, "### تعريف المجلس", "### 3.1 مسؤول مجلس المتابعة والمراجعة والتظلمات"),
        sliceBetween(c27, "### 3.3 نظام استقبال الطلبات والمقترحات"),
      ),
      childIds: ["review-lead", "review-member"],
    },
    {
      id: "review-lead",
      title: "مسؤول مجلس المتابعة والمراجعة والتظلمات",
      kind: "role",
      blocks: joinParts(
        sliceBetween(c27, "### 3.1 مسؤول مجلس المتابعة والمراجعة والتظلمات", "### 3.2 عضو مجلس المتابعة والمراجعة والتظلمات", false),
      ),
    },
    {
      id: "review-member",
      title: "عضو مجلس المتابعة والمراجعة والتظلمات",
      kind: "role",
      blocks: joinParts(
        sliceBetween(c27, "### 3.2 عضو مجلس المتابعة والمراجعة والتظلمات", "### 3.3 نظام استقبال الطلبات والمقترحات", false),
      ),
    },

    // General participation, events & deputies (2.1 + 2.8 + 2.9)
    {
      id: "membership-levels",
      title: "مستويات العمل التطوعي",
      kind: "general",
      blocks: joinParts(
        sliceBetween(c21, "### ثانيًا: مستويات العمل التطوعي", "### ثالثًا: مجلس الإدارة المركزي"),
      ),
    },
    {
      id: "event-lead",
      title: "قائد الفعالية",
      kind: "general",
      blocks: joinParts(c28),
    },
    {
      id: "deputy-rules",
      title: "البدائل واستمرارية العمل (النائب)",
      kind: "general",
      blocks: joinParts(
        sliceBetween(c21, "### ثامنًا: البدائل واستمرارية العمل (النائب)"),
        sliceBetween(c29, "### سادسًا: الإنابة واستمرارية العمل"),
      ),
    },
  ];

  return {
    chapters,
    entries: new Map(definitions.map((entry) => [entry.id, entry])),
  };
}
