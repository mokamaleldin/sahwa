import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { currentUser } from "./auth.js";
import { teamStore } from "./team-store.js";

export async function requirePageUser(admin = false) {
  const incoming = await headers();
  const host = incoming.get("host") || "sahwa.world";
  const local = /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host);
  const request = new Request(`${local ? "http" : "https"}://${host}/`, {
    headers: incoming,
  });
  const user = await currentUser(request, teamStore);
  if (!user) redirect("/login");
  if (admin && user.accessRole !== "admin") redirect("/team");
  return user;
}
