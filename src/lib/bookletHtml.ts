import type { GovernanceBlock } from "../data/sahwaGovernance";
import type { StructureChapter } from "./structureParser";

function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function inlineHtml(text: string): string {
  return escapeHtml(text).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}

function blockToHtml(block: GovernanceBlock): string {
  if (block.kind === "heading") return `<h3>${inlineHtml(block.text)}</h3>`;
  if (block.kind === "paragraph") return `<p>${inlineHtml(block.text)}</p>`;
  if (block.kind === "list") {
    const tag = block.ordered ? "ol" : "ul";
    const items = block.items.map((item) => `<li>${inlineHtml(item)}</li>`).join("");
    return `<${tag}>${items}</${tag}>`;
  }
  if (block.kind === "table") {
    const head = block.headers.map((cell) => `<th>${inlineHtml(cell)}</th>`).join("");
    const body = block.rows
      .map((row) => `<tr>${row.map((cell) => `<td>${inlineHtml(cell)}</td>`).join("")}</tr>`)
      .join("");
    return `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
  }
  return "";
}

export function buildBookletHtml(title: string, chapters: StructureChapter[]): string {
  const origin = typeof window !== "undefined" && window.location?.origin ? window.location.origin : "";
  const fontFace = origin
    ? `@font-face{font-family:'IBM Plex Sans Arabic';src:url('${origin}/fonts/ibm-plex/IBMPlexSansArabic-Regular.woff2') format('woff2');font-weight:400;font-style:normal;}
@font-face{font-family:'IBM Plex Sans Arabic';src:url('${origin}/fonts/ibm-plex/IBMPlexSansArabic-Bold.woff2') format('woff2');font-weight:700;font-style:normal;}`
    : "";

  const toc = chapters
    .map((chapter, index) => `<li><a href="#ch-${index + 1}">${escapeHtml(chapter.label)}</a></li>`)
    .join("");
  const pages = chapters
    .map(
      (chapter, index) =>
        `<section id="ch-${index + 1}" class="chapter">
          <div class="chapter-meta">${escapeHtml(title)} · ${(index + 1).toLocaleString("ar-EG")} / ${chapters.length.toLocaleString("ar-EG")}</div>
          ${chapter.blocks.map(blockToHtml).join("\n")}
        </section>`,
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${escapeHtml(title)} — صحوة</title>
<style>
${fontFace}
:root{--primary:#752026;--dark:#350e15;--gold:#d6ad63;--bg:#f8f3ee;--paper:#fffcf8;--line:#dccdc7;}
*{box-sizing:border-box;}
body{margin:0;padding:28px 18px;background:var(--bg);color:var(--dark);font-family:'IBM Plex Sans Arabic',system-ui,-apple-system,sans-serif;line-height:2;font-size:15px;}
.cover,.chapter{max-width:780px;margin:0 auto 24px;padding:36px 40px;background:var(--paper);border:1px solid var(--line);border-inline-start:5px solid var(--primary);border-radius:16px;}
.cover{text-align:center;border-inline-start:1px solid var(--line);border-top:5px solid var(--primary);}
.cover h1{margin:0 0 10px;color:var(--primary);font-size:30px;line-height:1.5;}
.cover-bar{width:56px;height:3px;background:var(--gold);margin:14px auto 22px;border-radius:99px;}
.toc{text-align:right;margin:20px auto 0;max-width:460px;padding:0 22px 0 0;}
.toc li{margin:6px 0;}
.toc a{color:var(--primary);text-decoration:none;font-weight:600;}
.chapter-meta{margin:0 0 18px;padding-bottom:10px;border-bottom:1px solid var(--line);color:#765c5e;font-size:12px;}
h3{margin:24px 0 10px;padding-inline-start:12px;border-inline-start:3px solid var(--gold);color:var(--primary);font-size:18px;line-height:1.65;}
h3:first-of-type{margin-top:0;}
p{margin:8px 0 14px;}
ul,ol{margin:8px 0 16px;padding-inline-start:24px;}
li+li{margin-top:5px;}
li::marker{color:var(--primary);}
table{width:100%;border-collapse:collapse;margin:18px 0;font-size:13px;}
th,td{padding:10px 12px;border:1px solid var(--line);text-align:right;vertical-align:top;}
th{background:#d6ad6320;color:var(--primary);}
@page{size:A4;margin:16mm;}
@media print{
  body{background:#fff;padding:0;font-size:13px;line-height:1.85;}
  .cover,.chapter{max-width:none;margin:0;padding:10px 0 0;border:0;border-radius:0;break-after:page;}
  .chapter:last-child{break-after:auto;}
  .toc a{color:var(--dark);}
}
</style>
</head>
<body>
<header class="cover">
  <h1>${escapeHtml(title)}</h1>
  <div class="cover-bar"></div>
  <ol class="toc">${toc}</ol>
</header>
${pages}
</body>
</html>`;
}
