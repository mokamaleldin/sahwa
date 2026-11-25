// Latin usernames derived from Arabic names, e.g. «أحمد محمد» -> ahmed.mohamed.
const MAP = {
  ا: "a", أ: "a", إ: "e", آ: "a", ٱ: "a", ب: "b", ت: "t", ث: "th", ج: "j", ح: "h", خ: "kh", د: "d", ذ: "th", ر: "r", ز: "z",
  س: "s", ش: "sh", ص: "s", ض: "d", ط: "t", ظ: "z", ع: "a", غ: "gh", ف: "f", ق: "q", ك: "k", ل: "l", م: "m", ن: "n", ه: "h",
  ة: "a", و: "w", ي: "y", ى: "a", ئ: "e", ؤ: "o", ء: "", "ّ": "", "َ": "a", "ُ": "u", "ِ": "i",
};
const COMMON = new Map([
  ["محمد", "mohamed"], ["أحمد", "ahmed"], ["احمد", "ahmed"], ["محمود", "mahmoud"], ["مصطفى", "mostafa"], ["عبد", "abd"], ["عبدالله", "abdullah"],
  ["عبد الله", "abdullah"], ["علي", "ali"], ["عمر", "omar"], ["عثمان", "othman"], ["يوسف", "yousef"], ["إبراهيم", "ibrahim"], ["ابراهيم", "ibrahim"],
  ["خالد", "khaled"], ["حسن", "hasan"], ["حسين", "hussein"], ["فاطمة", "fatima"], ["مريم", "maryam"], ["عائشة", "aisha"], ["سارة", "sara"],
  ["نور", "nour"], ["آلاء", "alaa"], ["أسماء", "asmaa"], ["اسماء", "asmaa"], ["زينب", "zainab"], ["هاجر", "hajar"], ["رحمة", "rahma"],
]);
export const RESERVED = new Set(["admin", "administrator", "root", "sahwa", "support", "team", "studio", "login", "api", "u", "system", "test"]);

function word(token) {
  if (COMMON.has(token)) return COMMON.get(token);
  if (/^[a-z0-9]+$/i.test(token)) return token.toLowerCase();
  let out = "";
  for (const ch of token) out += MAP[ch] ?? (/[a-z0-9]/i.test(ch) ? ch.toLowerCase() : "");
  return out.replace(/(.)\1{2,}/g, "$1$1");
}

export function baseUsername(fullName) {
  const tokens = String(fullName || "").normalize("NFKC").replace(/[ً-ْـ]/g, "").trim().split(/\s+/).filter(Boolean);
  const words = tokens.map(word).filter((w) => w.length > 1);
  const first = words[0] || "member";
  const last = words.length > 1 ? words[words.length - 1] : "";
  return (last ? `${first}.${last}` : first).slice(0, 34).replace(/^[^a-z0-9]+/, "") || "member";
}

// Real accounts never take the test. prefix, which is reserved for test accounts.
export async function uniqueUsername(fullName, taken) {
  let base = baseUsername(fullName);
  if (base.startsWith("test.") || RESERVED.has(base)) base = `m.${base}`;
  for (let i = 0; i < 1000; i++) {
    const candidate = i === 0 ? base : `${base}${i + 1}`;
    if (!(await taken(candidate))) return candidate;
  }
  throw new Error("No free username");
}
