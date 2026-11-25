"use client";

import { useState } from "react";
import { Copy, Eye, Loader2, Plus, Trash2 } from "lucide-react";
import PageHeading from "../../components/shared/PageIdentity";
import { teamRequest } from "../../lib/team";

interface Profile {
  handle: string | null; displayName: string; bio: string; work: string; skills: string; participation: string;
  links: { label: string; url: string }[]; directoryFields: string[]; publicFields: string[]; isPublic: boolean;
}
const EMPTY: Profile = { handle: "", displayName: "", bio: "", work: "", skills: "", participation: "", links: [], directoryFields: ["major", "bio", "skills"], publicFields: [], isPublic: false };
const PUBLIC_OPTIONS = [["university", "الجامعة"], ["major", "التخصص"], ["work", "العمل أو المجال المهني"], ["skills", "المهارات والاهتمامات"], ["participation", "مشاركتي في صحوة"], ["links", "روابط التواصل"], ["roles", "الصفة التنظيمية"]] as const;
const DIRECTORY_OPTIONS = [["major", "التخصص"], ["bio", "النبذة"], ["skills", "المهارات"], ["work", "العمل"]] as const;

export default function ProfileEditor({ initial, person, roles, isTest }: { initial: Profile | null; person: { fullName: string; university: string; major: string }; roles: string[]; isTest: boolean }) {
  const [profile, setProfile] = useState<Profile>({ ...EMPTY, ...(initial || {}), handle: initial?.handle || "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [preview, setPreview] = useState(false);
  const set = <K extends keyof Profile>(key: K, value: Profile[K]) => setProfile((p) => ({ ...p, [key]: value }));
  const toggle = (key: "publicFields" | "directoryFields", field: string) => set(key, profile[key].includes(field) ? profile[key].filter((f) => f !== field) : [...profile[key], field]);
  const url = profile.handle ? `https://sahwa.world/u/${profile.handle}` : "";
  async function save() {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const result = await teamRequest<{ profile: Profile }>({ method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ profile }) }, "/api/account");
      setProfile({ ...EMPTY, ...result.profile, handle: result.profile.handle || "" });
      setNotice(result.profile.isPublic ? "تم الحفظ. صفحتك العامة منشورة." : "تم الحفظ. صفحتك العامة خاصة (غير منشورة).");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "تعذر الحفظ.");
    } finally {
      setBusy(false);
    }
  }
  const shown = (field: string) => profile.publicFields.includes(field);
  return (
    <>
      <PageHeading title="ملفي الشخصي" description="ملف صغير يعرّف بك. أنت تتحكم فيما يظهر." />
      <div className="platform-grid">
        <section className="platform-card platform-form" aria-label="تحرير الملف">
          <h2 className="font-heading">بياناتي</h2>
          <p className="platform-muted">الاسم الرسمي: {person.fullName}. الأدوار والصفة التنظيمية تُجلب من النظام ولا تُعدّل من هنا.</p>
          <label className="team-field"><span>الاسم المعروض <small>اختياري</small></span><input value={profile.displayName} onChange={(e) => set("displayName", e.target.value)} maxLength={80} placeholder={person.fullName} /></label>
          <label className="team-field"><span>نبذة مختصرة <small>{[...profile.bio].length}/300</small></span><textarea value={profile.bio} onChange={(e) => set("bio", e.target.value)} maxLength={300} /></label>
          <label className="team-field"><span>العمل أو المجال المهني <small>اختياري</small></span><input value={profile.work} onChange={(e) => set("work", e.target.value)} maxLength={120} /></label>
          <label className="team-field"><span>المهارات والاهتمامات <small>اختياري</small></span><input value={profile.skills} onChange={(e) => set("skills", e.target.value)} maxLength={300} /></label>
          <label className="team-field"><span>مشاركتي في صحوة <small>بكلماتك، اختياري</small></span><textarea value={profile.participation} onChange={(e) => set("participation", e.target.value)} maxLength={500} /></label>
          <fieldset className="team-field">
            <span>روابط التواصل <small>https فقط</small></span>
            {profile.links.map((link, i) => (
              <div key={i} className="flex gap-2">
                <input aria-label="اسم الرابط" value={link.label} onChange={(e) => set("links", profile.links.map((l, j) => (j === i ? { ...l, label: e.target.value } : l)))} maxLength={40} placeholder="Instagram" />
                <input aria-label="الرابط" dir="ltr" value={link.url} onChange={(e) => set("links", profile.links.map((l, j) => (j === i ? { ...l, url: e.target.value } : l)))} maxLength={300} placeholder="https://" />
                <button type="button" className="team-icon-button" aria-label="حذف الرابط" onClick={() => set("links", profile.links.filter((_, j) => j !== i))}><Trash2 size={16} /></button>
              </div>
            ))}
            {profile.links.length < 6 && <button type="button" className="team-text-button" onClick={() => set("links", [...profile.links, { label: "", url: "" }])}><Plus size={15} />إضافة رابط</button>}
          </fieldset>
          <fieldset className="team-field">
            <span>ما يراه أهل صحوة في دليل التعارف</span>
            {DIRECTORY_OPTIONS.map(([id, label]) => (
              <label key={id} className="platform-check"><input type="checkbox" checked={profile.directoryFields.includes(id)} onChange={() => toggle("directoryFields", id)} />{label}</label>
            ))}
          </fieldset>
        </section>
        <section className="platform-card platform-form" aria-label="الصفحة العامة">
          <h2 className="font-heading">الصفحة العامة</h2>
          <p className="platform-muted">خاصة افتراضيًا. لا تظهر فيها أرقام الهواتف أو البيانات الإدارية أبدًا، ولا تُفهرس في محركات البحث.</p>
          <label className="team-field"><span>اسم المستخدم للصفحة <small>حروف لاتينية وأرقام و . _ -</small></span><input dir="ltr" value={profile.handle || ""} onChange={(e) => set("handle", e.target.value.toLowerCase())} maxLength={30} placeholder="ahmed.mohamed" /></label>
          {url && <p className="platform-muted">الرابط: <span className="platform-secret">{url}</span> <button type="button" className="team-text-button" onClick={() => void navigator.clipboard?.writeText(url)}><Copy size={14} />نسخ</button></p>}
          <fieldset className="team-field">
            <span>الحقول الاختيارية الظاهرة للزوار</span>
            {PUBLIC_OPTIONS.map(([id, label]) => <label key={id} className="platform-check"><input type="checkbox" checked={shown(id)} onChange={() => toggle("publicFields", id)} />{label}</label>)}
          </fieldset>
          <label className="platform-check"><input type="checkbox" checked={profile.isPublic} disabled={isTest} onChange={(e) => set("isPublic", e.target.checked)} />نشر الصفحة العامة</label>
          {isTest && <p className="platform-muted">الحسابات التجريبية لا تنشر صفحات عامة.</p>}
          <button type="button" className="team-button team-button-secondary" onClick={() => setPreview((v) => !v)}><Eye size={16} />{preview ? "إخفاء المعاينة" : "معاينة ما يراه الزائر"}</button>
          {preview && (
            <div className="platform-item" aria-label="معاينة">
              <h4 className="font-heading text-[#752026]">{profile.displayName || person.fullName}</h4>
              {profile.bio && <p>{profile.bio}</p>}
              {shown("university") && person.university && <p>الجامعة: {person.university}</p>}
              {shown("major") && person.major && <p>التخصص: {person.major}</p>}
              {shown("work") && profile.work && <p>العمل: {profile.work}</p>}
              {shown("skills") && profile.skills && <p>المهارات: {profile.skills}</p>}
              {shown("participation") && profile.participation && <p>مشاركتي في صحوة: {profile.participation}</p>}
              {shown("roles") && roles.length > 0 && <p>الصفة في صحوة: {roles.join("، ")}</p>}
              {shown("links") && profile.links.filter((l) => l.url).map((l, i) => <p key={i} className="platform-ltr">{l.label || l.url}</p>)}
            </div>
          )}
        </section>
      </div>
      {error && <p className="team-error" role="alert">{error}</p>}
      {notice && <p className="team-success" role="status">{notice}</p>}
      <button className="team-button" onClick={() => void save()} disabled={busy}>{busy && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}حفظ الملف</button>
    </>
  );
}
