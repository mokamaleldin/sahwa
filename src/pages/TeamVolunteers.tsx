import { useCallback, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ChevronLeft, ChevronRight, Filter, Loader2, Plus, RefreshCw, Search, UserRound, UsersRound } from 'lucide-react';
import { GENDERS, PERSON_STATUSES, ROLES, STUDY_STATUSES, UNIVERSITIES, WORK_AREAS, filterVolunteers } from '../../shared/team-options.js';
import PageHeading from '../components/shared/PageIdentity';
import PersonForm from '../components/Team/PersonForm';
import PersonDetails from '../components/Team/PersonDetails';
import { EMPTY_FILTERS, photoUrl, teamRequest, type Volunteer, type VolunteerFilters, type VolunteerInput } from '../lib/team';

const PAGE_SIZE = 12;
const count = (value: number) => value.toLocaleString('ar');

export default function TeamVolunteers() {
  const [people, setPeople] = useState<Volunteer[]>([]);
  const [storageReady, setStorageReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [filters, setFilters] = useState<VolunteerFilters>({ ...EMPTY_FILTERS });
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Volunteer | null | undefined>(undefined);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError('');
    try {
      const result = await teamRequest<{ volunteers: Volunteer[]; storageReady: boolean }>({ signal });
      if (signal?.aborted) return;
      setPeople(result.volunteers);
      setStorageReady(result.storageReady);
      setLoaded(true);
    } catch (reason) {
      if (!signal?.aborted) setError(reason instanceof Error ? reason.message : 'تعذر تحميل الدليل.');
    } finally { if (!signal?.aborted) setLoading(false); }
  }, []);

  useEffect(() => { const controller = new AbortController(); void load(controller.signal); return () => controller.abort(); }, [load]);

  const roles = useMemo(() => [...new Set([...ROLES, ...people.map(person => person.role)])], [people]);
  const universities = useMemo(() => [...new Set([...UNIVERSITIES, ...people.map(person => person.university)])], [people]);
  const results = useMemo(() => filterVolunteers(people, filters), [people, filters]);
  const pages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const currentPage = Math.min(page, pages);
  const selected = people.find(person => person.id === selectedId);
  const filtered = Object.values(filters).some(Boolean);
  const canEdit = loaded && storageReady && !loading && !error;

  function updateFilter(key: keyof VolunteerFilters, value: string) { setFilters(previous => ({ ...previous, [key]: value })); setPage(1); }

  async function save(person: VolunteerInput, photo: string | null | undefined) {
    const result = await teamRequest<{ person: Volunteer }>({
      method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...(editing ? { id: editing.id, revision: editing.revision } : {}), person, photo }),
    });
    setPeople(previous => editing ? previous.map(value => value.id === result.person.id ? result.person : value) : [...previous, result.person]);
    setEditing(undefined);
    setNotice(editing ? 'تم حفظ التعديلات.' : 'تمت إضافة الشخص إلى دليل صحوة.');
    if (!editing) { setFilters({ ...EMPTY_FILTERS }); setPage(1); }
  }

  const filterFields: { key: keyof VolunteerFilters; label: string; options: string[] }[] = [
    { key: 'university', label: 'الجامعة', options: universities }, { key: 'workArea', label: 'المجال', options: WORK_AREAS },
    { key: 'role', label: 'الدور', options: roles }, { key: 'studyStatus', label: 'طالب / خريج', options: STUDY_STATUSES },
    { key: 'status', label: 'حالة الشخص', options: PERSON_STATUSES }, { key: 'gender', label: 'شباب / بنات', options: GENDERS },
  ];

  return <>
    <Helmet><title>معلومات المتطوعين | صحوة</title></Helmet>
    <PageHeading title="معلومات المتطوعين" description="دليل من انضموا إلى صحوة أو عملوا معها، وبيانات مشاركتهم في الفريق." />
    <section aria-label="دليل المتطوعين">
      <div className="team-directory-toolbar"><div className="flex items-center gap-3"><span className="team-icon team-icon-small"><UsersRound size={23} aria-hidden="true" /></span><div><h2 className="font-bold text-brand-primary">أهل صحوة</h2><p className="text-sm text-brand-muted">{count(people.length)} شخص في الدليل</p></div></div><div className="flex flex-wrap gap-2"><button className="team-button team-button-secondary" disabled={loading} onClick={() => void load()}><RefreshCw size={16} className={loading ? 'animate-spin' : ''} aria-hidden="true" />تحديث</button><button className="team-button" disabled={!canEdit} onClick={() => { setNotice(''); setEditing(null); }}><Plus size={18} aria-hidden="true" />إضافة شخص</button></div></div>
      {loaded && !storageReady && <div className="team-setup-notice" role="status"><strong>الدليل جاهز لاستقبال بيانات الفريق</strong><p>يلزم تفعيل الحفظ المشترك من إعدادات الموقع أولًا. ستتاح إضافة الأشخاص وتعديل بياناتهم بعد التفعيل.</p></div>}
      {notice && <p className="team-success" role="status">{notice}</p>}
      {error && <p className="team-error mb-5" role="alert">{error} <button className="underline" onClick={() => void load()}>إعادة المحاولة</button></p>}
      <div className="team-filter-panel">
        <label className="team-search"><span className="sr-only">البحث في المتطوعين</span><Search size={20} aria-hidden="true" /><input type="search" value={filters.query} onChange={event => updateFilter('query', event.target.value)} placeholder="ابحث بالاسم، التخصص، المهارات أو رقم الهاتف…" maxLength={120} /></label>
        <div className="team-filter-heading"><span><Filter size={15} aria-hidden="true" />تصفية الدليل</span>{filtered && <button className="team-text-button" onClick={() => { setFilters({ ...EMPTY_FILTERS }); setPage(1); }}>مسح الفلاتر</button>}</div>
        <div className="team-filter-grid">{filterFields.map(({ key, label, options }) => <label className="team-field" key={key}><span>{label}</span><select value={filters[key]} onChange={event => updateFilter(key, event.target.value)}><option value="">الكل</option>{options.map(option => <option key={option} value={option}>{key === 'gender' ? option === 'شاب' ? 'شباب' : 'بنات' : option}</option>)}</select></label>)}</div>
      </div>
      <div className="team-results-count" role="status">{loading ? 'جارٍ تحميل البيانات…' : `${count(results.length)} نتيجة${filtered ? ` من ${count(people.length)} شخص` : ''}`}</div>
      {loading && !loaded ? <div className="team-loading" role="status"><Loader2 size={25} className="animate-spin" aria-hidden="true" /><p>جارٍ تحميل دليل المتطوعين…</p></div> : !results.length ? <div className="team-empty"><UsersRound size={37} strokeWidth={1.3} aria-hidden="true" /><h3>{people.length ? 'لا توجد نتائج مطابقة' : error ? 'لم يتم تحميل الدليل' : 'هنا يبدأ دليل أهل صحوة'}</h3><p>{people.length ? 'جرّب اسمًا آخر أو غيّر الفلاتر.' : error ? 'أعد المحاولة لعرض بيانات الفريق.' : storageReady ? 'أضف أول شخص، وستجد بيانات الفريق هنا بشكل مرتب.' : 'ستظهر سجلات الفريق هنا بعد تفعيل الحفظ وإضافة الأشخاص.'}</p>{canEdit && !people.length && <button className="team-button mt-4" onClick={() => setEditing(null)}><Plus size={17} aria-hidden="true" />إضافة أول شخص</button>}</div> : <div className="team-people-grid">{results.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE).map(person => <button type="button" key={person.id} className="team-person-card" onClick={() => setSelectedId(person.id)} aria-label={`عرض بيانات ${person.fullName}`}>
        <div className="team-person-card-top"><div className="team-avatar">{person.photoId ? <img src={photoUrl(person.photoId)} alt="" loading="lazy" /> : <UserRound size={27} aria-hidden="true" />}</div><span className={`team-status${person.status === PERSON_STATUSES[0] ? ' team-status-active' : ''}`}>{person.status}</span></div>
        <h3>{person.fullName}</h3><p className="team-person-university">{person.university} · {person.studyStatus}</p>{person.major && <p className="team-person-major">{person.major}</p>}<div className="team-person-role"><strong>{person.role}</strong><span>{person.workArea} · {person.workScope}</span></div><span className="team-person-open">عرض البيانات <ChevronLeft size={16} aria-hidden="true" /></span>
      </button>)}</div>}
      {pages > 1 && <nav className="team-pagination" aria-label="صفحات دليل المتطوعين"><button className="team-button team-button-secondary" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}><ChevronRight size={17} aria-hidden="true" />السابق</button><span>صفحة {count(currentPage)} من {count(pages)}</span><button className="team-button team-button-secondary" disabled={currentPage >= pages} onClick={() => setPage(currentPage + 1)}>التالي<ChevronLeft size={17} aria-hidden="true" /></button></nav>}
    </section>
    {editing !== undefined && <PersonForm person={editing} roles={roles} onSave={save} onClose={() => setEditing(undefined)} />}
    {selected && editing === undefined && <PersonDetails person={selected} canEdit={canEdit} onClose={() => setSelectedId(null)} onEdit={() => { setEditing(selected); setSelectedId(null); }} onDelete={async () => {
      await teamRequest({ method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: selected.id, revision: selected.revision }) });
      setPeople(previous => previous.filter(person => person.id !== selected.id)); setSelectedId(null); setNotice('تم حذف السجل.');
    }} />}
  </>;
}
