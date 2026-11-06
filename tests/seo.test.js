import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const read = (path) => fs.readFileSync(path, "utf8");

test("all public routes define server metadata and each university has a canonical URL", () => {
  const paths = [
    "src/app/page.tsx",
    "src/app/universities/page.tsx",
    "src/app/universities/[universityId]/page.tsx",
    "src/app/social/page.tsx",
  ];
  for (const path of paths) {
    assert.match(read(path), /pageMetadata\(/, path);
    assert.match(read(path), /StructuredData/, path);
  }
  assert.match(read("src/app/universities/[universityId]/page.tsx"), /generateStaticParams/);
  assert.match(read("src/app/universities/[universityId]/page.tsx"), /generateMetadata/);
  assert.match(read("src/lib/seo.ts"), /alternates: \{ canonical:/);
});

test("sitemap and robots are generated with the current domain and no private team pages", () => {
  assert.equal(fs.existsSync("public/sitemap.xml"), false);
  assert.equal(fs.existsSync("public/robots.txt"), false);
  const sitemap = read("src/app/sitemap.ts");
  assert.match(sitemap, /universities\.map/);
  assert.doesNotMatch(sitemap, /team-space/);
  assert.equal(fs.existsSync("src/app/team-space/page.tsx"), false);
  assert.equal(fs.existsSync("src/components/Home/StudentActivitiesSection.tsx"), false);
  assert.doesNotMatch(sitemap, /["']\/team["']/);
  assert.match(read("src/app/robots.ts"), /sitemap:/);
  assert.match(read("src/lib/seo.ts"), /https:\/\/sahwa\.world/);
  assert.match(read("src/app/team/layout.tsx"), /index: false/);
});

test("university records cover all published groups and useful Arabic/English/Turkish variants", async () => {
  const output = ts.transpileModule(read("src/data/universities.ts"), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
  }).outputText;
  const { universities, getUniversityById } = await import(
    "data:text/javascript;charset=utf-8," + encodeURIComponent(output)
  );
  assert.deepEqual(universities.map((u) => u.id), ["istinye", "bilgi", "gelisim"]);
  for (const u of universities) {
    assert.ok(u.name && u.nameEn && u.nameTr);
    assert.ok(u.description && u.seoDescription && u.introduction && u.studentMessage);
    assert.ok(u.aliases.length >= 3);
    assert.equal(getUniversityById(u.id), u);
  }
  assert.equal(getUniversityById("unknown"), undefined);
});

test("share previews use real logo assets and do not depend on missing og-image.png", () => {
  assert.equal(fs.existsSync("public/sahwa-icon.png"), true);
  assert.equal(fs.existsSync("public/logo.png"), true);
  assert.match(read("src/lib/og-image.tsx"), /sahwa-icon\.png/);
  for (const path of [
    "src/app/opengraph-image.tsx",
    "src/app/universities/opengraph-image.tsx",
    "src/app/universities/[universityId]/opengraph-image.tsx",
    "src/app/social/opengraph-image.tsx",
  ]) assert.match(read(path), /makeOgImage/, path);
});

test("public pages no longer inject conflicting client-side SEO tags", () => {
  for (const page of ["Home", "Universities", "UniversityPage", "SocialMedia", "Library", "NotFound"]) {
    const source = read("src/views/" + page + ".tsx");
    assert.doesNotMatch(source, /<SEO|components\/SEO|sahwa\.space/, page);
  }
  assert.doesNotMatch(read("src/views/Home.tsx"), /StudentActivitiesSection/);
  assert.doesNotMatch(read("src/views/Universities.tsx"), /university\.nameTr|هذه صفحات مجتمعات صحوة/);
  assert.doesNotMatch(read("src/views/UniversityPage.tsx"), /الاسم التركي|university\.aliases/);
  assert.doesNotMatch(read("src/components/shared/Footer.tsx"), /team-space/);
  const files = [
    "src/app/page.tsx", "src/app/layout.tsx", "src/app/sitemap.ts", "src/app/robots.ts",
    "src/app/universities/page.tsx",
    "src/app/universities/[universityId]/page.tsx", "src/app/social/page.tsx",
    "src/lib/og-image.tsx", "src/components/StructuredData.tsx",
  ];
  for (const path of files) {
    const source = ts.createSourceFile(path, read(path), ts.ScriptTarget.Latest, true, path.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
    assert.equal(source.parseDiagnostics.length, 0, path + ": " + source.parseDiagnostics.map(d => d.messageText).join(", "));
  }
});
