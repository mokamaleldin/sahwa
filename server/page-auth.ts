import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { currentActor } from "./platform/session.js";
import { canAny } from "./platform/access.js";
import { stores } from "./platform/stores.js";

async function pageRequest() {
  const incoming = await headers();
  const host = incoming.get("host") || "sahwa.world";
  const local = /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host);
  return new Request(`${local ? "http" : "https"}://${host}/`, { headers: incoming });
}

// Server-side page guard. A missing permission sends the person back to
// their dashboard; hiding a link is never the only protection.
export async function requirePageActor({ permission, allowPasswordChange = false }: { permission?: string | string[]; allowPasswordChange?: boolean } = {}) {
  const actor = await currentActor(await pageRequest(), stores);
  if (!actor) redirect("/login");
  if (actor.mustChangePassword && !allowPasswordChange) redirect("/team/account");
  const needed = permission === undefined ? [] : Array.isArray(permission) ? permission : [permission];
  if (needed.length && !needed.some((key) => canAny(actor, key))) redirect("/team");
  return actor;
}

// Kept for existing pages: `admin` now means "may manage volunteers".
export async function requirePageUser(admin = false) {
  return requirePageActor(admin ? { permission: "volunteers.view" } : {});
}
