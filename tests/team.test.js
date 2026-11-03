import test from "node:test";
import assert from "node:assert/strict";
import { validatePerson } from "../server/team-data.js";
import { filterVolunteers } from "../shared/team-options.js";
import { person } from "./helpers/database.js";
test("only basic volunteer fields survive validation; email is normalized", () => {
  const p = validatePerson(
    person({
      email: " AHMED@Example.Invalid ",
      skills: "ignored",
      joinedAt: "ignored",
      accessRole: "admin",
    }),
  );
  assert.equal(p.email, "ahmed@example.invalid");
  assert.equal(p.accessRole, "admin");
  assert.ok(!("skills" in p));
  assert.ok(!("joinedAt" in p));
});
test("new accounts need a strong password; edits can keep the existing one", () => {
  assert.throws(
    () => validatePerson(person({ password: "short" })),
    /كلمة المرور/,
  );
  assert.throws(() => validatePerson(person({ password: "" })), /كلمة المرور/);
  assert.equal(validatePerson(person({ password: "" }), false).password, "");
});
test("invalid status, role, dates and identifiers are rejected", () => {
  for (const value of [
    person({ accessRole: "owner" }),
    person({ status: "anything" }),
    person({ birthDate: "2003-02-29" }),
    person({ birthDate: "2099-01-01" }),
    person({ email: "not-an-email" }),
    person({ fullName: "  " }),
  ])
    assert.throws(() => validatePerson(value));
});
test("basic Arabic directory search combines with university and status filters", () => {
  const p = [
    person({ fullName: "أَحْمَد", email: "one@example.invalid" }),
    person({ fullName: "فاطمة", university: "بيلجي", status: "خريج" }),
  ];
  assert.equal(
    filterVolunteers(p, { query: "احمد", university: "استنيا", status: "نشط" })
      .length,
    1,
  );
  assert.equal(
    filterVolunteers(p, { query: "", university: "بيلجي", status: "نشط" })
      .length,
    0,
  );
  assert.equal(
    filterVolunteers(p, { query: "فاطمه", university: "", status: "خريج" })
      .length,
    1,
  );
});
