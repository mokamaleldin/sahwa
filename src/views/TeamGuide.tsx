import { readFileSync } from "node:fs";
import { join } from "node:path";
import GuideTabs from "../components/Team/GuideTabs";

const outline = readFileSync(join(process.cwd(), "docs/guide/bylaws.md"), "utf8");
const identity = readFileSync(join(process.cwd(), "docs/guide/identity.md"), "utf8");

// Only the seven main headings start a book. The appendices stay in the last one.
const books = outline.split(/(?=^# الباب )/m).map((source) => {
  const titleEnd = source.indexOf("\n");
  return { title: source.slice(2, titleEnd), body: source.slice(titleEnd + 1) };
});

export default function TeamGuide() {
  return <GuideTabs books={books} identity={identity} />;
}
