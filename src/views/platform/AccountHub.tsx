"use client";

import { useState, type FormEvent } from "react";
import { Award, KeyRound, Loader2, Save, UserRound } from "lucide-react";
import PageHeading from "../../components/shared/PageIdentity";
import TeamComboField, { type ComboGroup, type ComboOption } from "../../components/Team/TeamComboField";
import { teamRequest } from "../../lib/team";
import { useSession } from "../../auth/useSession";
import {
  MAJORS,
  MAJOR_SEARCH_KEYWORDS,
  STUDY_YEARS,
  ageFromBirthDate,
  normalizeMajor,
  normalizeSearch,
  todayInIstanbul,
} from "../../../shared/team-options.js";
import ProfileEditor from "./ProfileEditor";

interface Profile {
  handle: string | null;
  displayName: string;
  bio: string;
  work: string;
  skills: string;
  participation: string;
  links: { label: string; url: string }[];
  directoryFields: string[];
  publicFields: string[];
  isPublic: boolean;
}

export interface AccountPerson {
  fullName: string;
  university: string;
  major: string;
  studyYear?: string;
  birthDate?: string;
  phone?: string;
  gender?: string;
}

export interface AccountHubProps {
  kind: "owner" | "account";
  fullName: string;
  email: string;
  username: string;
  forced: boolean;
  initialTab?: string;
  profile?: Profile | null;
  person?: AccountPerson | null;
  roles?: string[];
}

const MAJOR_OPTIONS: ComboOption[] = MAJORS.map((title, index) => ({
  id: `self-major-${index}`,
  title,
  keywords: MAJOR_SEARCH_KEYWORDS.get(title),
}));
const MAJOR_GROUPS: ComboGroup[] = [{ options: MAJOR_OPTIONS }];
const MAJOR_BY_TITLE = new Map(
  MAJOR_OPTIONS.map((option) => [normalizeSearch(option.title), option]),
);
function exactMajor(raw: string): ComboOption | undefined {
  const normalized = normalizeMajor(raw);
  return normalized ? MAJOR_BY_TITLE.get(normalizeSearch(normalized)) : undefined;
}

function PersonalInfoSection({
  person,
  onUpdated,
}: {
  person: AccountPerson;
  onUpdated: (updated: AccountPerson) => void;
}) {
  const { refresh } = useSession();
  const [fullName, setFullName] = useState(person.fullName);
  const [birthDate, setBirthDate] = useState(person.birthDate || "");
  const [phone, setPhone] = useState(person.phone || "");
  const [major, setMajor] = useState(person.major || "");
  const [studyYear, setStudyYear] = useState(person.studyYear || "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const age = ageFromBirthDate(birthDate);
  const studyYears = [
    ...new Set([...STUDY_YEARS, ...(studyYear && !STUDY_YEARS.includes(studyYear) ? [studyYear] : [])]),
  ];

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    const normalizedMajor = normalizeMajor(major);
    try {
      const result = await teamRequest<{ person: AccountPerson }>(
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            personal: {
              fullName,
              birthDate,
              phone,
              major: normalizedMajor,
              studyYear,
            },
          }),
        },
        "/api/account",
      );
      setMajor(normalizedMajor);
      onUpdated({ ...person, ...result.person });
      await refresh({ force: true });
      setNotice("تم حفظ بياناتك الشخصية بنجاح.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "تعذر حفظ البيانات.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="platform-card" style={{ maxWidth: 680 }} aria-labelledby="personal-info-heading">
      <h2 id="personal-info-heading" className="font-heading flex items-center gap-2">
        <UserRound size={18} aria-hidden="true" />
        بياناتي الشخصية
      </h2>
      <p className="platform-muted mb-4">
        يمكنك تحديث اسمك وتاريخ ميلادك وهاتفك وتخصصك وسنتك الدراسية في أي وقت.
      </p>
      <div className="platform-chips mb-4">
        {person.university && <span className="platform-chip">الجامعة: {person.university}</span>}
        {person.gender && <span className="platform-chip platform-chip-muted">{person.gender}</span>}
        {age !== null && <span className="platform-chip platform-chip-gold">العمر: {age.toLocaleString("ar-EG")} سنة</span>}
      </div>
      <form className="platform-form" onSubmit={save} aria-busy={busy}>
        <div className="team-form-grid">
          <label className="team-field team-field-full">
            <span>الاسم الكامل *</span>
            <input
              name="fullName"
              required
              autoComplete="name"
              maxLength={120}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </label>
          <label className="team-field">
            <span>
              تاريخ الميلاد <small>يُستخدم لحساب العمر وإتاحة الصفحة العامة</small>
            </span>
            <input
              name="birthDate"
              type="date"
              min="1900-01-01"
              max={todayInIstanbul()}
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
            />
          </label>
          <label className="team-field">
            <span>
              رقم الهاتف <small>اختياري</small>
            </span>
            <input
              name="phone"
              type="tel"
              dir="ltr"
              autoComplete="tel"
              maxLength={30}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+90 ..."
            />
          </label>
          <TeamComboField
            label="التخصص"
            name="major"
            optional
            value={major}
            onChange={setMajor}
            onBlurValue={() => setMajor(normalizeMajor(major))}
            groups={MAJOR_GROUPS}
            exactMatch={exactMajor}
            placeholder="اختر تخصصًا أو اكتب تخصصك"
            listLabel="التخصصات"
            openLabel="عرض التخصصات"
            closeLabel="إغلاق قائمة التخصصات"
          />
          <label className="team-field">
            <span>
              السنة الدراسية <small>اختياري</small>
            </span>
            <select name="studyYear" value={studyYear} onChange={(e) => setStudyYear(e.target.value)}>
              <option value="">غير محدد</option>
              {studyYears.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="platform-muted">
          لتعديل الجامعة أو الأدوار التنظيمية، تواصل مع مسؤول فريقك.
        </p>
        {error && (
          <p className="team-error" role="alert">
            {error}
          </p>
        )}
        {notice && (
          <p className="team-success" role="status">
            {notice}
          </p>
        )}
        <div>
          <button type="submit" className="team-button" disabled={busy}>
            {busy ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Save size={16} aria-hidden="true" />}
            حفظ بياناتي الشخصية
          </button>
        </div>
      </form>
    </section>
  );
}

function PasswordSection({ email, forced }: { email: string; forced: boolean }) {
  const { refresh } = useSession();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (form.get("newPassword") !== form.get("confirm")) {
      setError("كلمتا المرور الجديدتان غير متطابقتين.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await teamRequest(
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currentPassword: form.get("currentPassword"),
            newPassword: form.get("newPassword"),
          }),
        },
        "/api/account",
      );
      setDone(true);
      await refresh({ force: true });
      if (forced) window.location.assign("/team");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "تعذر تغيير كلمة المرور.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="platform-card" style={{ maxWidth: 560 }} aria-labelledby="password-heading">
      <h2 id="password-heading" className="font-heading flex items-center gap-2">
        <KeyRound size={18} aria-hidden="true" />
        تغيير كلمة المرور
      </h2>
      {email && (
        <p className="platform-muted mb-4">
          البريد الإلكتروني للدخول: <span className="platform-secret">{email}</span>
        </p>
      )}
      {done && !forced ? (
        <p className="team-success" role="status">
          تم تغيير كلمة المرور بنجاح.
        </p>
      ) : (
        <form className="platform-form" onSubmit={submit}>
          <label className="team-field">
            <span>{forced ? "كلمة المرور المؤقتة" : "كلمة المرور الحالية"}</span>
            <input name="currentPassword" type="password" dir="ltr" autoComplete="current-password" required maxLength={256} />
          </label>
          <label className="team-field">
            <span>
              كلمة المرور الجديدة <small>8 أحرف على الأقل</small>
            </span>
            <input name="newPassword" type="password" dir="ltr" autoComplete="new-password" required minLength={8} maxLength={128} />
          </label>
          <label className="team-field">
            <span>تأكيد كلمة المرور الجديدة</span>
            <input name="confirm" type="password" dir="ltr" autoComplete="new-password" required minLength={8} maxLength={128} />
          </label>
          {error && (
            <p className="team-error" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="team-button" disabled={busy}>
            {busy ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <KeyRound size={16} aria-hidden="true" />}
            حفظ كلمة المرور
          </button>
        </form>
      )}
    </section>
  );
}

function OwnerNameSection({ initialName }: { initialName: string }) {
  const { refresh } = useSession();
  const [name, setName] = useState(initialName);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await teamRequest(
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ displayName: name }),
        },
        "/api/account",
      );
      await refresh({ force: true });
      setNotice("تم حفظ الاسم. سيظهر اسمك الأول في الترحيب بالصفحة الرئيسية.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "تعذر الحفظ.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="platform-card mb-6" style={{ maxWidth: 560 }} aria-labelledby="owner-name-heading">
      <h2 id="owner-name-heading" className="font-heading flex items-center gap-2">
        <UserRound size={18} aria-hidden="true" />
        الاسم المعروض
      </h2>
      <p className="platform-muted mb-3">يُستخدم الاسم الأول للترحيب بك في الصفحة الرئيسية وفي سجل التغييرات.</p>
      <form className="platform-form" onSubmit={save}>
        <label className="team-field">
          <span>اسمك</span>
          <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={120} placeholder="مثال: محمد كمال الدين" />
        </label>
        {error && <p className="team-error" role="alert">{error}</p>}
        {notice && <p className="team-success" role="status">{notice}</p>}
        <button type="submit" className="team-button" disabled={busy}>
          {busy ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Save size={16} aria-hidden="true" />}
          حفظ الاسم
        </button>
      </form>
    </section>
  );
}

function AchievementsSection() {
  return (
    <section className="platform-card" style={{ maxWidth: 640 }} aria-labelledby="achievements-heading">
      <h2 id="achievements-heading" className="font-heading flex items-center gap-2">
        <Award size={19} aria-hidden="true" />
        إنجازاتي
        <span className="platform-badge-soon">قريبًا</span>
      </h2>
      <p>
        هنا ستظهر لاحقًا مشاركاتك الموثقة في الفعاليات والمشروعات، والشهادات الإلكترونية بعد اعتمادها.
      </p>
    </section>
  );
}

export default function AccountHub({
  kind,
  fullName,
  email,
  forced,
  initialTab,
  profile = null,
  person: initialPerson = null,
  roles = [],
}: AccountHubProps) {
  const [person, setPerson] = useState<AccountPerson | null>(initialPerson);
  const isAccount = kind === "account" && Boolean(person);
  const tabs = isAccount
    ? ([
        { id: "personal", label: "بياناتي الشخصية" },
        { id: "profile", label: "صفحتي العامة" },
        { id: "security", label: "كلمة المرور والأمان" },
        { id: "achievements", label: "إنجازاتي" },
      ] as const)
    : ([
        { id: "security", label: "بيانات الحساب وكلمة المرور" },
        { id: "achievements", label: "إنجازاتي" },
      ] as const);

  const defaultTab = tabs.some((t) => t.id === initialTab) ? (initialTab as string) : tabs[0].id;
  const [tab, setTab] = useState<string>(defaultTab);

  if (forced) {
    return (
      <>
        <PageHeading
          title="اختر كلمة مرورك"
          description="هذا أول دخول لك. اختر كلمة مرور خاصة بك، ولن يراها أي مسؤول."
        />
        <div className="mx-auto" style={{ maxWidth: 560 }}>
          <PasswordSection email={email} forced />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeading
        title="حسابي"
        description="بياناتك الشخصية، وصفحتك العامة، وكلمة المرور في مكان واحد."
      />
      <div className="platform-tabs" role="tablist" aria-label="أقسام الحساب">
        {tabs.map((t) => (
          <button
            key={t.id}
            id={`account-tab-${t.id}`}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "personal" && isAccount && person && (
        <div role="tabpanel" aria-labelledby="account-tab-personal">
          <PersonalInfoSection person={person} onUpdated={setPerson} />
        </div>
      )}

      {tab === "profile" && isAccount && person && (
        <div role="tabpanel" aria-labelledby="account-tab-profile">
          <ProfileEditor embedded initial={profile} person={person} roles={roles} />
        </div>
      )}

      {tab === "security" && (
        <div role="tabpanel" aria-labelledby="account-tab-security">
          {kind === "owner" && <OwnerNameSection initialName={fullName} />}
          <PasswordSection email={email} forced={false} />
        </div>
      )}

      {tab === "achievements" && (
        <div role="tabpanel" aria-labelledby="account-tab-achievements">
          <AchievementsSection />
        </div>
      )}
    </>
  );
}
