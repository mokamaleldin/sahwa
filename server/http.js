import { TeamError } from "./team-data.js";
import { privateHeaders, sameOrigin } from "./auth.js";
export const json = (data, status = 200, headers = {}) =>
  Response.json(data, { status, headers: { ...privateHeaders, ...headers } });
export async function readInput(request, max = 16 * 1024) {
  if (!sameOrigin(request))
    throw new TeamError("أعد تحميل الصفحة وحاول مجددًا.", 403);
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    throw new TeamError("طلب غير صالح.", 415);
  if (Number(request.headers.get("content-length")) > max)
    throw new TeamError("حجم الطلب كبير.", 413);
  const body = await request.text();
  if (Buffer.byteLength(body) > max)
    throw new TeamError("حجم الطلب كبير.", 413);
  try {
    const input = JSON.parse(body);
    if (!input || typeof input !== "object" || Array.isArray(input))
      throw new Error();
    return input;
  } catch {
    throw new TeamError("بيانات الطلب غير صالحة.");
  }
}
export function errorResponse(error) {
  if (error instanceof TeamError)
    return json({ error: error.message, code: error.code }, error.status);
  if (error?.code === "23505")
    return json({ error: "البريد الإلكتروني مستخدم بالفعل." }, 409);
  console.error("Sahwa data request unavailable");
  return json(
    {
      error: "تعذر الاتصال ببيانات الفريق. حاول مجددًا بعد قليل.",
      code: "UNAVAILABLE",
    },
    503,
  );
}
