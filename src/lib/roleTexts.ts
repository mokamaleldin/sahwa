import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseStructureBook, type StructureEntry } from "./structureParser";
import type { GovernanceBlock } from "../data/sahwaGovernance";
import { guideEntriesFor, roleById } from "../../shared/platform-roles.js";

// Server-only: the verbatim Chapter 2 entries linked to a technical role.
let book: ReturnType<typeof parseStructureBook> | null = null;
let documentStatus = "";
function structure() {
  if (!book) {
    const source = readFileSync(join(process.cwd(), "docs/guide/structure.md"), "utf8");
    book = parseStructureBook(source);
    documentStatus = /\*\*الحالة: ([^*]+)\*\*/.exec(source)?.[1]?.trim() || "";
  }
  return book;
}

export interface RoleText {
  entries: Pick<StructureEntry, "id" | "title" | "blocks">[];
  definition: GovernanceBlock | null;
  position: GovernanceBlock | null;
  status: string;
  pendingTitles: string[];
  needsApproval: boolean;
}

// Picks blocks as they are; nothing is rewritten or summarised.
export function roleText(roleId: string, sector: string | null): RoleText {
  const entries = guideEntriesFor(roleId, sector)
    .map((id: string) => structure().entries.get(id))
    .filter(Boolean) as StructureEntry[];
  const blocks = entries.flatMap((e) => e.blocks);
  const definition =
    blocks.find((b) => b.kind === "paragraph" && b.text.startsWith("**الدور:**")) ||
    blocks.find((b) => b.kind === "paragraph" && !/^\*\*الحالة/.test(b.text)) ||
    null;
  const position =
    blocks.find((b) => b.kind === "table" && b.headers[0] === "العنصر") ||
    blocks.find((b) => b.kind === "list" && b.items.some((i) => /^\*\*(يتبع|تتبع)/.test(i))) ||
    null;
  const role = roleById(roleId);
  return {
    entries: entries.map(({ id, title, blocks: b }) => ({ id, title, blocks: b })),
    definition,
    position,
    status: documentStatus,
    pendingTitles: (role?.pendingGuide || []).map((id: string) => structure().entries.get(id)?.title || id),
    needsApproval: Boolean(role?.guideNeedsApproval),
  };
}
