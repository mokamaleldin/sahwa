"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  UserCog,
} from "lucide-react";
import PageHeading from "../components/shared/PageIdentity";
import AccountForm from "../components/Team/AccountForm";
import { teamRequest, type Volunteer, type VolunteerInput } from "../lib/team";
import { useSession } from "../auth/useSession";
import { normalizeSearch } from "../../shared/team-options.js";

const PAGE_SIZE = 12;

export default function TeamAccounts() {
  const { refresh } = useSession();
  const [accounts, setAccounts] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const [notice, setNotice] = useState(""),
    [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Volunteer | null>(null);
  const [formVersion, setFormVersion] = useState(0),
    [page, setPage] = useState(1);
  const editor = useRef<HTMLDivElement>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");
    try {
      const result = await teamRequest<{ volunteers: Volunteer[] }>({ signal });
      if (!signal?.aborted) setAccounts(result.volunteers);
    } catch (reason) {
      if (!signal?.aborted)
        setError(
          reason instanceof Error ? reason.message : "تعذر تحميل الحسابات.",
        );
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const results = useMemo(
    () =>
      accounts
        .filter((account) =>
          normalizeSearch(
            `${account.fullName} ${account.email} ${account.university}`,
          ).includes(normalizeSearch(query)),
        )
        .sort((a, b) => a.fullName.localeCompare(b.fullName, "ar")),
    [accounts, query],
  );
  const pages = Math.max(1, Math.ceil(results.length / PAGE_SIZE)),
    currentPage = Math.min(page, pages);

  function openEditor(account: Volunteer | null) {
    setEditing(account);
    setFormVersion((previous) => previous + 1);
    setNotice("");
    editor.current?.scrollIntoView({ block: "start" });
  }

  async function save(person: VolunteerInput) {
    const result = await teamRequest<{ person: Volunteer }>({
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        person,
        ...(editing ? { id: editing.id, revision: editing.revision } : {}),
      }),
    });
    setAccounts((previous) =>
      editing
        ? previous.map((account) =>
            account.id === result.person.id ? result.person : account,
          )
        : [result.person, ...previous],
    );
    setEditing(null);
    setFormVersion((previous) => previous + 1);
    setQuery("");
    setPage(1);
    setNotice(
      editing
        ? "تم حفظ بيانات الحساب."
        : "تم إنشاء الحساب وملف المتطوع. يمكنه الدخول بالبريد وكلمة المرور التي حددتها.",
    );
    await refresh({ force: true });
  }

  return (
    <>
      <Helmet>
        <title>إدارة الحسابات | صحوة</title>
      </Helmet>
      <PageHeading
        title="إدارة الحسابات"
        description="صفحة خاصة بالأدمن لإنشاء حسابات الفريق وإدارة بيانات الدخول والصلاحيات."
      />
      {notice && (
        <p className="team-success" role="status">
          {notice}
        </p>
      )}
      {error && (
        <p className="team-error mb-5" role="alert">
          {error}{" "}
          <button className="underline" onClick={() => void load()}>
            إعادة المحاولة
          </button>
        </p>
      )}
      <div ref={editor} className="team-account-anchor">
        <AccountForm
          key={formVersion}
          person={editing}
          onSave={save}
          onCancel={() => openEditor(null)}
          disabled={loading || Boolean(error)}
        />
      </div>
      <section aria-label="حسابات الفريق" className="team-accounts-directory">
        <div className="team-directory-toolbar">
          <div>
            <h2 className="font-heading text-3xl text-brand-primary">
              حسابات الفريق
            </h2>
            <p className="text-sm text-brand-muted">
              {accounts.length.toLocaleString("ar-EG")} حساب
            </p>
          </div>
          <div className="flex gap-2">
            <button
              className="team-button team-button-secondary"
              disabled={loading}
              onClick={() => void load()}
            >
              <RefreshCw size={16} aria-hidden="true" />
              تحديث
            </button>
            <button className="team-button" onClick={() => openEditor(null)}>
              <Plus size={18} aria-hidden="true" />
              حساب جديد
            </button>
          </div>
        </div>
        <label className="team-search">
          <span className="sr-only">البحث في الحسابات</span>
          <Search size={20} aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            maxLength={254}
            placeholder="ابحث بالاسم أو البريد الإلكتروني…"
          />
        </label>
        <p className="team-results-count" role="status">
          {loading
            ? "جارٍ تحميل الحسابات…"
            : `${results.length.toLocaleString("ar-EG")} نتيجة`}
        </p>
        {loading ? (
          <div className="team-loading">
            <Loader2 className="animate-spin" aria-hidden="true" />
            <p>جارٍ تحميل الحسابات…</p>
          </div>
        ) : !results.length ? (
          <div className="team-empty">
            <UserCog size={36} aria-hidden="true" />
            <h3>{error ? "تعذر تحميل الحسابات" : "لا توجد نتائج مطابقة"}</h3>
            <p>
              {error
                ? "أعد المحاولة لعرض بيانات الحسابات."
                : "جرّب بحثًا آخر أو أنشئ حسابًا جديدًا من النموذج أعلاه."}
            </p>
          </div>
        ) : (
          <div className="team-people-grid">
            {results
              .slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
              .map((account) => (
                <button
                  key={account.id}
                  className="team-person-card"
                  onClick={() => openEditor(account)}
                  aria-label={`تعديل حساب ${account.fullName}`}
                >
                  <div className="team-person-card-top">
                    <span className="team-avatar">
                      <UserCog size={26} aria-hidden="true" />
                    </span>
                    <span
                      className={`team-status${account.status === "نشط" ? " team-status-active" : ""}`}
                    >
                      {account.status}
                    </span>
                  </div>
                  <h3>{account.fullName}</h3>
                  <p className="team-person-university">{account.university}</p>
                  <p className="team-account-email" dir="ltr">
                    {account.email}
                  </p>
                  <div className="team-person-role">
                    <strong>
                      {account.accessRole === "admin" ? "مسؤول" : "متطوع عادي"}
                    </strong>
                  </div>
                  <span className="team-person-open">
                    تعديل الحساب
                    <ChevronLeft size={16} aria-hidden="true" />
                  </span>
                </button>
              ))}
          </div>
        )}
        {pages > 1 && (
          <nav className="team-pagination" aria-label="صفحات الحسابات">
            <button
              className="team-button team-button-secondary"
              disabled={currentPage <= 1}
              onClick={() => setPage(currentPage - 1)}
            >
              <ChevronRight size={16} aria-hidden="true" />
              السابق
            </button>
            <span>
              {currentPage} / {pages}
            </span>
            <button
              className="team-button team-button-secondary"
              disabled={currentPage >= pages}
              onClick={() => setPage(currentPage + 1)}
            >
              التالي
              <ChevronLeft size={16} aria-hidden="true" />
            </button>
          </nav>
        )}
      </section>
    </>
  );
}
