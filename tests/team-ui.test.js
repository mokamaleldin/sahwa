import test from "node:test";
import assert from "node:assert/strict";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { compileUI } from "./helpers/compile-ui.js";
const at = compileUI("tmp/forms-tests", [
  "shared/team-options.js",
  "src/lib/team.ts",
  "src/components/Team/TeamDialog.tsx",
  "src/components/Team/PersonForm.tsx",
  "src/components/Team/EventForm.tsx",
]);
const { default: PersonForm } = await at("src/components/Team/PersonForm.js");
const { default: EventForm } = await at("src/components/Team/EventForm.js");
const noop = () => {};
test("volunteer form asks for basics and account details without history or skill fields", () => {
  const html = renderToStaticMarkup(
    h(PersonForm, { person: null, onSave: noop, onClose: noop }),
  );
  for (const label of [
    "اسم المتطوع",
    "الجامعة",
    "التخصص",
    "السنة الدراسية",
    "تاريخ الميلاد",
    "البريد الإلكتروني",
    "الصلاحيات",
  ])
    assert.ok(html.includes(label), label);
  for (const excluded of ["تاريخ الانضمام", "المهارات", "المساهمات المستقبلية"])
    assert.ok(!html.includes(excluded), excluded);
  assert.match(html, /minLength="10"/);
  assert.match(html, /autoComplete="new-password"/);
  assert.ok(!html.includes("fixture-password"));
});
test("event form keeps exactly five data inputs and attendance remains optional", () => {
  const html = renderToStaticMarkup(
    h(EventForm, { event: null, onSave: noop, onDelete: noop, onClose: noop }),
  );
  assert.equal(
    (html.match(/<input /g) || []).length +
      (html.match(/<textarea /g) || []).length,
    5,
  );
  const attendance = html.match(/<input[^>]*type="number"[^>]*>/)[0];
  assert.ok(!attendance.includes("required"));
  assert.match(attendance, /min="0"/);
  assert.match(attendance, /value=""/);
});
