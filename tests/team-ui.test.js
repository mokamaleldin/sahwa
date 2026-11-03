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
  "src/components/Team/AccountForm.tsx",
  "src/components/Team/EventForm.tsx",
]);
const { default: PersonForm } = await at("src/components/Team/PersonForm.js");
const { default: AccountForm } = await at("src/components/Team/AccountForm.js");
const { default: EventForm } = await at("src/components/Team/EventForm.js");
import { person } from "./helpers/database.js";
const noop = () => {};
test("volunteer profile form contains only basic details, without account controls", () => {
  const html = renderToStaticMarkup(
    h(PersonForm, { person: person(), onSave: noop, onClose: noop }),
  );
  for (const label of [
    "اسم المتطوع",
    "الجامعة",
    "التخصص",
    "السنة الدراسية",
    "تاريخ الميلاد",
  ])
    assert.ok(html.includes(label), label);
  for (const excluded of [
    "تاريخ الانضمام",
    "المهارات",
    "المساهمات المستقبلية",
    "البريد الإلكتروني",
    "الصلاحيات",
    "كلمة المرور",
    "حساب الدخول",
  ])
    assert.ok(!html.includes(excluded), excluded);
  assert.ok(!html.includes('type="password"'));
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

test("account creation form owns email, password, permissions and status", () => {
  const html = renderToStaticMarkup(
    h(AccountForm, { person: null, onSave: noop, onCancel: noop }),
  );
  for (const label of [
    "إنشاء حساب جديد",
    "اسم المتطوع",
    "الجامعة",
    "حساب الدخول",
    "البريد الإلكتروني",
    "كلمة المرور",
    "الصلاحيات",
    "الحالة",
  ])
    assert.ok(html.includes(label), label);
  assert.match(html, /minLength="10"/);
  assert.match(html, /autoComplete="new-password"/);
  assert.ok(!html.includes("fixture-password"));
  assert.ok(!html.includes("التخصص"));
});
test("editing an account does not display or replace the volunteer's basic profile fields", () => {
  const html = renderToStaticMarkup(
    h(AccountForm, {
      person: { ...person(), id: "fixture", revision: 1 },
      onSave: noop,
      onCancel: noop,
    }),
  );
  assert.ok(html.includes("تعديل حساب الدخول"));
  assert.ok(html.includes("اتركها فارغة"));
  assert.ok(!html.includes("هندسة"));
  assert.ok(!html.includes("fixture-password"));
  const password = html.match(/<input[^>]*id="account-password"[^>]*>/)[0];
  assert.ok(!password.includes("required"));
  assert.match(password, /value=""/);
});
