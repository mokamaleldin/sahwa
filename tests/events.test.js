import test from "node:test";
import assert from "node:assert/strict";
import { validateEvent } from "../server/team-data.js";
import { event } from "./helpers/database.js";
test("optional attendance is distinct from zero attendance", () => {
  for (const attendance of [undefined, null, ""])
    assert.equal(validateEvent(event({ attendance })).attendance, null);
  assert.equal(validateEvent(event({ attendance: 0 })).attendance, 0);
  assert.equal(validateEvent(event({ attendance: 42 })).attendance, 42);
});
test("invalid attendance, calendar dates and empty required fields are rejected", () => {
  for (const attendance of [-1, 1.5, "12", Infinity, 1000001])
    assert.throws(() => validateEvent(event({ attendance })));
  for (const input of [
    event({ eventDate: "2026-02-30" }),
    event({ eventDate: "" }),
    event({ title: " " }),
    event({ responsible: "" }),
    event({ notes: "x".repeat(1001) }),
  ])
    assert.throws(() => validateEvent(input));
});
test("notes accept line breaks and are bounded; extra fields are ignored", () => {
  const parsed = validateEvent(
    event({ notes: " سطر أول\nسطر ثانٍ ", unexpected: "ignored" }),
  );
  assert.equal(parsed.notes, "سطر أول\nسطر ثانٍ");
  assert.equal(Object.keys(parsed).length, 5);
});
