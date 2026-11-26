"use client";

import { useState, type FormEvent } from "react";
import { Award, KeyRound, Loader2, Save, UserRound } from "lucide-react";
import PageHeading from "../../components/shared/PageIdentity";
import { teamRequest } from "../../lib/team";
import { useSession } from "../../auth/useSession";
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

export interface AccountHubProps {
  kind: "owner" | "account";
  fullName: string;
  email: string;
  username: string;
  forced: boolean;
  initialTab?: string;
  profile?: Profile | null;
  person?: { fullName: string; university: string; major: string } | null;
  roles?: string[];
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
  person = null,
  roles = [],
}: AccountHubProps) {
  const isAccount = kind === "account" && Boolean(person);
  const tabs = isAccount
    ? ([
        { id: "profile", label: "ملفي الشخصي" },
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
        description="ملفك الشخصي، وكلمة المرور، وإنجازاتك في مكان واحد."
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
