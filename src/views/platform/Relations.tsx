"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Building2,
  ChevronLeft,
  ExternalLink,
  Handshake,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UserRound,
} from "lucide-react";
import PageHeading from "../../components/shared/PageIdentity";
import TeamDialog from "../../components/Team/TeamDialog";
import { teamRequest } from "../../lib/team";
import { normalizeSearch } from "../../../shared/team-options.js";

interface Details {
  name?: string;
  kind?: string;
  reason?: string;
  link?: string;
}
interface Row {
  id: string;
  details: Details;
  ownerId: string | null;
  ownerName: string | null;
  university: string | null;
  revision: number;
  canEdit: boolean;
  canDelete?: boolean;
  canAssign: boolean;
}
interface Data {
  records: Row[];
  scopes: string[];
  members: { id: string; name: string; university: string | null }[];
}

const central = "*central*";
const label = (u: string | null) => (!u || u === central ? "مركزي" : u);
const safeHref = (link?: string) => (link && /^https?:\/\//i.test(link) ? link : "");

// Splits structured Arabic notes ("جهة الاتصال: ... \n الحالة الحالية: ...") into
// clean key-value rows while preserving free-form paragraphs cleanly.
function parseReasonLines(reason?: string) {
  const lines = (reason || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const items: { key: string | null; value: string }[] = [];
  for (const line of lines) {
    const colon = line.indexOf(":");
    if (colon > 0 && colon <= 40 && !line.startsWith("http")) {
      const key = line.slice(0, colon).trim();
      const value = line.slice(colon + 1).trim();
      if (key && value) {
        items.push({ key, value });
        continue;
      }
    }
    items.push({ key: null, value: line });
  }
  return items;
}

function Editor({
  data,
  row,
  onClose,
  onSaved,
}: {
  data: Data;
  row: Row | null;
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const [scope, setScope] = useState(row ? row.university || central : data.scopes[0]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const members = data.members.filter((m) => (m.university || central) === scope);

  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    try {
      await teamRequest(
        {
          method: row ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...Object.fromEntries(form),
            university: scope === central ? "" : scope,
            ...(row ? { id: row.id, revision: row.revision } : {}),
          }),
        },
        "/api/relations",
      );
      onSaved(row ? "تم حفظ تعديلات العلاقة." : "تمت إضافة العلاقة إلى السجل.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "تعذر الحفظ.");
      setBusy(false);
    }
  }

  return (
    <TeamDialog title={row ? "تعديل العلاقة" : "إضافة علاقة"} busy={busy} onClose={onClose}>
      <form onSubmit={save} aria-busy={busy}>
        <fieldset className="team-form-body platform-form" disabled={busy}>
          {!row && (
            <label className="team-field">
              <span>نطاق العلاقة</span>
              <select value={scope} onChange={(e) => setScope(e.target.value)}>
                {data.scopes.map((s) => (
                  <option key={s} value={s}>
                    {label(s)}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label className="team-field">
            <span>اسم الجهة أو الشخص *</span>
            <input name="name" defaultValue={row?.details.name} required autoFocus maxLength={160} placeholder="مثال: جمعية أو مستشار أكاديمي أو ضيف" />
          </label>
          <label className="team-field">
            <span>نوع الجهة <small>يظهر كوسم واضح على البطاقة</small></span>
            <input name="kind" defaultValue={row?.details.kind} maxLength={120} placeholder="مثال: محاضر وضيف أنشطة، مستشارة أكاديمية، مؤسسة شريكة" />
          </label>
          <label className="team-field">
            <span>تفاصيل العلاقة والمتابعة</span>
            <textarea name="reason" rows={5} defaultValue={row?.details.reason} maxLength={3000} placeholder="طبيعة العلاقة، جهة الاتصال، التنسيق الجاري، المتابعة المطلوبة..." />
          </label>
          <label className="team-field">
            <span>رابط التواصل <small>اختياري</small></span>
            <input name="link" type="url" dir="ltr" autoCorrect="off" autoCapitalize="none" spellCheck={false} defaultValue={row?.details.link} maxLength={300} placeholder="https://..." />
          </label>
          {row?.canAssign && (
            <label className="team-field">
              <span>المكلف بالمتابعة</span>
              <select name="ownerId" defaultValue={row.ownerId || ""}>
                <option value="">غير محدد</option>
                {row.ownerId && !members.some((m) => m.id === row.ownerId) && (
                  <option value={row.ownerId}>{row.ownerName}</option>
                )}
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          {error && (
            <p role="alert" className="team-error">
              {error}
            </p>
          )}
        </fieldset>
        <div className="team-dialog-footer">
          <button type="submit" className="team-button" disabled={busy}>
            {busy && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
            حفظ العلاقة
          </button>
          <button type="button" className="team-button team-button-secondary" onClick={onClose} disabled={busy}>
            إلغاء
          </button>
        </div>
      </form>
    </TeamDialog>
  );
}

function RelationDetails({
  row,
  onClose,
  onEdit,
  onDeleted,
}: {
  row: Row;
  onClose: () => void;
  onEdit: () => void;
  onDeleted: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const href = safeHref(row.details.link);
  const lines = useMemo(() => parseReasonLines(row.details.reason), [row.details.reason]);

  async function remove() {
    if (deleting) return;
    setDeleting(true);
    setError("");
    try {
      await teamRequest(
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: row.id, revision: row.revision }),
        },
        "/api/relations",
      );
      onDeleted();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "تعذر حذف العلاقة.");
      setDeleting(false);
    }
  }

  return (
    <TeamDialog title={row.details.name || "تفاصيل العلاقة"} busy={deleting} onClose={onClose}>
      <div className="team-form-body">
        <div className="platform-chips mb-5">
          {row.details.kind && (
            <span className="platform-chip platform-chip-gold">
              <Building2 size={13} aria-hidden="true" />
              {row.details.kind}
            </span>
          )}
          <span className="platform-chip">{label(row.university)}</span>
          {row.ownerName && (
            <span className="platform-chip platform-chip-muted">
              <UserRound size={13} aria-hidden="true" />
              المكلف بالمتابعة: {row.ownerName}
            </span>
          )}
        </div>

        {lines.length > 0 ? (
          <dl className="relation-detail-list">
            {lines.map((item, idx) =>
              item.key ? (
                <div key={idx} className="relation-detail-row">
                  <dt>{item.key}</dt>
                  <dd>{item.value}</dd>
                </div>
              ) : (
                <p key={idx} className="relation-detail-text">
                  {item.value}
                </p>
              ),
            )}
          </dl>
        ) : (
          <p className="platform-muted">لا توجد تفاصيل إضافية مسجلة لهذه العلاقة.</p>
        )}

        {href && (
          <div className="mt-5">
            <a className="team-button team-button-secondary" href={href} target="_blank" rel="noopener noreferrer">
              <ExternalLink size={16} aria-hidden="true" />
              فتح رابط التواصل
            </a>
          </div>
        )}

        {error && (
          <p role="alert" className="team-error mt-4">
            {error}
          </p>
        )}

        {confirmDelete && (
          <div className="team-delete-confirm" role="alert">
            <p>هل تريد حذف علاقة «{row.details.name}» من سجل العلاقات؟</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                className="team-button team-button-secondary"
                autoFocus
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
              >
                تراجع
              </button>
              <button
                type="button"
                className="team-button team-button-danger"
                onClick={() => void remove()}
                disabled={deleting}
              >
                {deleting && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
                {deleting ? "جارٍ الحذف…" : "نعم، احذف العلاقة"}
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="team-dialog-footer">
        {row.canEdit && (
          <button type="button" className="team-button" onClick={onEdit} disabled={deleting || confirmDelete}>
            <Pencil size={16} aria-hidden="true" />
            تعديل العلاقة
          </button>
        )}
        <button type="button" className="team-button team-button-secondary" onClick={onClose} disabled={deleting}>
          إغلاق
        </button>
        {(row.canDelete ?? row.canEdit) && (
          <button
            type="button"
            className="team-text-button team-delete-action"
            onClick={() => setConfirmDelete(true)}
            disabled={deleting || confirmDelete}
          >
            <Trash2 size={16} aria-hidden="true" />
            حذف العلاقة
          </button>
        )}
      </div>
    </TeamDialog>
  );
}

export default function Relations({ openNew }: { openNew: boolean }) {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [scopeFilter, setScopeFilter] = useState("all");
  const [selected, setSelected] = useState<Row | null>(null);
  const [editing, setEditing] = useState<Row | null | undefined>(openNew ? null : undefined);

  const load = useCallback(async () => {
    try {
      const next = await teamRequest<Data>({}, "/api/relations");
      setData(next);
      setSelected((curr) => (curr ? next.records.find((r) => r.id === curr.id) || null : null));
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "تعذر تحميل السجل.");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const availableScopes = useMemo(() => {
    if (!data) return [];
    return [...new Set(data.records.map((r) => label(r.university)))];
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = normalizeSearch(query);
    return data.records.filter((r) => {
      if (scopeFilter !== "all" && label(r.university) !== scopeFilter) return false;
      if (!q) return true;
      return normalizeSearch(
        [r.details.name, r.details.kind, r.details.reason, r.ownerName, label(r.university)].join(" "),
      ).includes(q);
    });
  }, [data, query, scopeFilter]);

  return (
    <>
      <PageHeading
        title="سجل العلاقات"
        description="الجهات والشخصيات الشريكة ومتابعة التواصل معها في نطاقك."
      />
      <div className="team-directory-toolbar">
        <div className="flex items-center gap-3">
          <span className="team-icon team-icon-small">
            <Handshake size={22} aria-hidden="true" />
          </span>
          <span className="text-sm text-brand-muted">
            {data ? `${data.records.length.toLocaleString("ar-EG")} علاقة مسجلة` : "جارٍ التحميل…"}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="team-button team-button-secondary"
            onClick={() => void load()}
          >
            <RefreshCw size={16} aria-hidden="true" />
            تحديث
          </button>
          {data && data.scopes.length > 0 && (
            <button
              type="button"
              className="team-button"
              onClick={() => {
                setNotice("");
                setEditing(null);
              }}
            >
              <Plus size={18} aria-hidden="true" />
              إضافة علاقة
            </button>
          )}
        </div>
      </div>

      {notice && (
        <p className="team-success" role="status">
          {notice}
        </p>
      )}
      {error && (
        <p className="team-error mb-4" role="alert">
          {error}
        </p>
      )}
      {!data && !error && (
        <div className="team-loading" role="status">
          <Loader2 className="animate-spin" aria-hidden="true" />
          <p>جارٍ تحميل السجل…</p>
        </div>
      )}

      {data && (
        <>
          {data.records.length > 0 && (
            <search className="relations-toolbar mb-5">
              <label className="team-search">
                <span className="sr-only">البحث في سجل العلاقات</span>
                <Search size={18} aria-hidden="true" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="ابحث باسم الجهة أو النوع أو المكلف بالمتابعة…"
                  maxLength={120}
                />
              </label>
              {availableScopes.length > 1 && (
                <label className="team-field" style={{ minWidth: 180 }}>
                  <span className="sr-only">تصفية حسب النطاق</span>
                  <select value={scopeFilter} onChange={(e) => setScopeFilter(e.target.value)}>
                    <option value="all">كل النطاقات</option>
                    {availableScopes.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </search>
          )}

          {filtered.length ? (
            <div className="relations-grid">
              {filtered.map((r) => {
                const href = safeHref(r.details.link);
                return (
                  <article className="relation-card" key={r.id}>
                    <header className="relation-card-head">
                      <div className="platform-chips">
                        {r.details.kind && (
                          <span className="platform-chip platform-chip-gold">
                            <Building2 size={12} aria-hidden="true" />
                            {r.details.kind}
                          </span>
                        )}
                        <span className="platform-chip platform-chip-muted">{label(r.university)}</span>
                      </div>
                      {r.canEdit && (
                        <button
                          type="button"
                          className="team-icon-button"
                          aria-label={`تعديل ${r.details.name}`}
                          onClick={() => {
                            setNotice("");
                            setEditing(r);
                          }}
                        >
                          <Pencil size={16} aria-hidden="true" />
                        </button>
                      )}
                    </header>

                    <h3 className="font-heading relation-card-title">
                      <button
                        type="button"
                        className="card-trigger"
                        onClick={() => {
                          setNotice("");
                          setSelected(r);
                        }}
                      >
                        {r.details.name || "جهة بدون اسم"}
                      </button>
                    </h3>

                    {r.details.reason && <p className="relation-card-snippet">{r.details.reason}</p>}

                    <footer className="relation-card-footer">
                      <span className="relation-card-owner">
                        <UserRound size={14} aria-hidden="true" />
                        {r.ownerName || "غير محدد"}
                      </span>
                      <div className="flex items-center gap-2">
                        {href && (
                          <a
                            className="relation-card-link"
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`رابط التواصل مع ${r.details.name}`}
                          >
                            <ExternalLink size={14} aria-hidden="true" />
                            تواصل
                          </a>
                        )}
                        <span className="relation-card-more" aria-hidden="true">
                          التفاصيل
                          <ChevronLeft size={14} />
                        </span>
                      </div>
                    </footer>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="team-empty">
              <Handshake size={36} aria-hidden="true" />
              <h3>{data.records.length ? "لا توجد نتائج مطابقة" : "لا توجد علاقات مسجلة في نطاقك"}</h3>
              <p>{data.records.length ? "جرّب كلمة بحث أخرى أو غيّر النطاق." : "أضف أول جهة أو شريك لبدء تنظيم سجل العلاقات."}</p>
            </div>
          )}

          {selected && editing === undefined && (
            <RelationDetails
              row={selected}
              onClose={() => setSelected(null)}
              onEdit={() => {
                setEditing(selected);
                setSelected(null);
              }}
              onDeleted={() => {
                setSelected(null);
                setNotice("تم حذف العلاقة من السجل.");
                void load();
              }}
            />
          )}

          {editing !== undefined && (editing || data.scopes.length > 0) && (
            <Editor
              data={data}
              row={editing}
              onClose={() => setEditing(undefined)}
              onSaved={(msg) => {
                setEditing(undefined);
                setNotice(msg);
                void load();
              }}
            />
          )}
        </>
      )}
    </>
  );
}
