"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Search } from "lucide-react";
import PageHeading from "../../components/shared/PageIdentity";
import { teamRequest } from "../../lib/team";
import { roleTitle } from "../../../shared/platform-roles.js";
import { normalizeSearch } from "../../../shared/team-options.js";

type Json = Record<string, unknown>;
const post = <T,>(body: Json) =>
  teamRequest<T>(
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) },
    "/api/admin",
  );
const get = <T,>(view: string) => teamRequest<T>({}, `/api/admin?view=${view}`);

const ACTIONS: Record<string, string> = {
  "account.login": "تسجيل دخول",
  "account.create": "إنشاء حساب",
  "account.reset": "إعادة ضبط كلمة مرور",
  "account.suspend": "إيقاف حساب",
  "account.reactivate": "إعادة تفعيل حساب",
  "account.password-change": "تغيير كلمة المرور",
  "volunteer.create": "إضافة متطوع",
  "volunteer.edit": "تعديل بيانات متطوع",
  "volunteer.self-edit": "تعديل بيانات شخصية",
  "volunteer.archive": "أرشفة متطوع",
  "volunteer.restore": "استرجاع متطوع",
  "volunteer.level": "تغيير المستوى التنظيمي",
  "role.assign": "إسناد دور",
  "role.replace": "تغيير دور",
  "role.end": "إنهاء دور",
  "permission.grant": "منح صلاحية",
  "permission.deny": "منع صلاحية",
  "permission.revoke": "إلغاء صلاحية",
  "settings.update": "تعديل الإعدادات",
  "form.save": "تعديل نموذج",
  "form.delete": "حذف نموذج",
  "submission.delete": "حذف طلب وارد",
  "relation.create": "إضافة علاقة",
  "relation.edit": "تعديل علاقة",
  "relation.delete": "حذف علاقة",
  "event.delete": "حذف فعالية",
  "post.publish": "نشر مستجد",
  "post.edit": "تعديل مستجد",
  "post.delete": "حذف مستجد",
};

const DETAIL_LABELS: Record<string, string> = {
  university: "الجامعة",
  sector: "القطاع",
  roleId: "الدور",
  username: "اسم المستخدم",
  email: "البريد",
  title: "العنوان",
  name: "الجهة",
  kind: "النوع",
  from: "من",
  to: "إلى",
  key: "الإعداد",
  value: "القيمة",
  reason: "السبب",
  permission: "الصلاحية",
  active: "مفعل",
};

const SECTOR_LABELS: Record<string, string> = { youth: "الشباب", women: "الطالبات" };

function formatDetails(details: Json) {
  return Object.entries(details || {})
    .filter(([k, v]) => v !== null && v !== undefined && v !== "" && !["id", "assignmentId", "previous", "previousCount"].includes(k))
    .map(([k, v]) => {
      const label = DETAIL_LABELS[k] || k;
      if (k === "roleId" && typeof v === "string") return `${label}: ${roleTitle(v, typeof details.sector === "string" ? details.sector : undefined)}`;
      if (k === "sector" && typeof v === "string") return `${label}: ${SECTOR_LABELS[v] || v}`;
      if (k === "active" && typeof v === "boolean") return `${label}: ${v ? "نعم" : "لا"}`;
      return `${label}: ${String(v)}`;
    })
    .join(" · ");
}

function Audit() {
  const [log, setLog] = useState<
    { id: string; actor: string; action: string; details: Json; createdAt: string; targetName: string | null }[] | null
  >(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    get<{ log: typeof log }>("audit")
      .then((d) => setLog(d.log))
      .catch((r) => setError(r instanceof Error ? r.message : "تعذر التحميل."));
  }, []);

  const filtered = useMemo(() => {
    if (!log) return [];
    const q = normalizeSearch(query);
    if (!q) return log;
    return log.filter((e) =>
      normalizeSearch([e.actor, ACTIONS[e.action] || e.action, e.targetName || "", formatDetails(e.details)].join(" ")).includes(q),
    );
  }, [log, query]);

  if (!log) {
    return error ? (
      <p className="team-error" role="alert">
        {error}
      </p>
    ) : (
      <p className="team-loading">
        <Loader2 className="animate-spin" aria-hidden="true" /> جارٍ التحميل…
      </p>
    );
  }

  return (
    <>
      {log.length > 0 && (
        <search className="mb-4">
          <label className="team-search" style={{ maxWidth: 420 }}>
            <span className="sr-only">البحث في سجل التغييرات</span>
            <Search size={18} aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث بالاسم أو نوع الإجراء (دخول، كلمة مرور، فعالية…)"
              maxLength={100}
            />
          </label>
        </search>
      )}
      {filtered.length ? (
        <div className="platform-table-wrap">
          <table className="platform-table">
            <thead>
              <tr>
                <th scope="col">الوقت</th>
                <th scope="col">المنفذ</th>
                <th scope="col">الإجراء</th>
                <th scope="col">الشخص المعني</th>
                <th scope="col">التفاصيل</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.id}>
                  <td className="whitespace-nowrap">{new Date(e.createdAt).toLocaleString("ar-EG")}</td>
                  <td>{e.actor}</td>
                  <td>{ACTIONS[e.action] || e.action}</td>
                  <td>{e.targetName || "—"}</td>
                  <td className="platform-muted">{formatDetails(e.details) || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="platform-empty">
          {log.length ? "لا توجد نتائج مطابقة للبحث." : "لا توجد تغييرات مسجلة بعد."}
        </p>
      )}
    </>
  );
}

function Settings() {
  const [value, setValue] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    get<{ settings: Record<string, string> }>("settings")
      .then((d) => setValue(d.settings["directory.crossSector"]))
      .catch((r) => setError(r instanceof Error ? r.message : "تعذر التحميل."));
  }, []);
  async function save(next: string) {
    setError("");
    setNotice("");
    try {
      await post({ action: "settings", key: "directory.crossSector", value: next });
      setValue(next);
      setNotice("تم الحفظ.");
    } catch (r) {
      setError(r instanceof Error ? r.message : "تعذر الحفظ.");
    }
  }
  if (value === null) {
    return error ? (
      <p className="team-error" role="alert">
        {error}
      </p>
    ) : (
      <p className="team-loading">
        <Loader2 className="animate-spin" aria-hidden="true" />
      </p>
    );
  }
  return (
    <section className="platform-card platform-form" style={{ maxWidth: 640 }}>
      <h2 className="font-heading">الاطلاع بين الشباب والطالبات في دليل «فريق صحوة»</h2>
      <p className="platform-muted">
        زملاء الفرق المشتركة (الإعلام والعلاقات) يرون بعضهم في كل الحالات.
      </p>
      {[
        ["none", "لا يظهر القطاع الآخر"],
        ["leads", "يظهر من القطاع الآخر شاغلو المناصب الرسمية فقط (الاسم والدور) — الافتراضي"],
        ["all", "يظهر الجميع للجميع"],
      ].map(([k, l]) => (
        <label key={k} className="platform-check">
          <input type="radio" name="crossSector" checked={value === k} onChange={() => void save(k)} />
          {l}
        </label>
      ))}
      {notice && (
        <p className="team-success" role="status">
          {notice}
        </p>
      )}
      {error && (
        <p className="team-error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}

const TABS = [
  { id: "audit", label: "سجل التغييرات", needs: "audit" },
  { id: "settings", label: "الإعدادات", needs: "settings" },
] as const;

export default function AdminPanel({
  abilities,
  initial,
}: {
  abilities: Record<string, boolean>;
  initial?: string;
}) {
  const tabs = TABS.filter((t) => abilities[t.needs]);
  const [tab, setTab] = useState<string>(tabs.find((t) => t.id === initial)?.id || tabs[0]?.id || "");
  return (
    <>
      <PageHeading
        title={tabs.find((t) => t.id === tab)?.label || "سجل التغييرات والإعدادات"}
        description="متابعة نشاط المنصة وتسجيلات الدخول والتعديلات، وضبط إعدادات فريق صحوة."
      />
      {tabs.length > 1 && (
        <div className="platform-tabs" role="tablist" aria-label="سجل التغييرات والإعدادات">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}
      {tab === "audit" && <Audit />}
      {tab === "settings" && <Settings />}
    </>
  );
}
