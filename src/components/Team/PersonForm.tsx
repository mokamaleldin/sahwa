import { useState, type FormEvent } from 'react';
import { Camera, Loader2, UserRound } from 'lucide-react';
import { UNIVERSITIES, GENDERS, STUDY_STATUSES, WORK_AREAS, WORK_SCOPES, ROLES, PERSON_STATUSES } from '../../../shared/team-options.js';
import { EMPTY_PERSON, photoUrl, preparePhoto, type Volunteer, type VolunteerInput } from '../../lib/team';
import TeamDialog from './TeamDialog';

interface Props {
  person: Volunteer | null;
  roles: string[];
  onSave: (person: VolunteerInput, photo: string | null | undefined) => Promise<void>;
  onClose: () => void;
}

export default function PersonForm({ person, roles, onSave, onClose }: Props) {
  const [form, setForm] = useState<VolunteerInput>(person ? { ...person } : { ...EMPTY_PERSON });
  const [customUniversity, setCustomUniversity] = useState(Boolean(person && !UNIVERSITIES.includes(person.university)));
  const [customRole, setCustomRole] = useState(false);
  const [photo, setPhoto] = useState<string | null | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const [readingPhoto, setReadingPhoto] = useState(false);
  const [error, setError] = useState('');
  const update = (key: keyof VolunteerInput, value: string) => setForm(previous => ({ ...previous, [key]: value }));
  const roleOptions = [...new Set([...ROLES, ...roles, ...(person ? [person.role] : [])])];
  const preview = photo === undefined ? person?.photoId ? photoUrl(person.photoId) : null : photo;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy || readingPhoto) return;
    setBusy(true);
    setError('');
    try { await onSave(form, photo); } catch (reason) { setError(reason instanceof Error ? reason.message : 'تعذر الحفظ. حاول مجددًا.'); setBusy(false); }
  }

  function select(label: string, key: keyof VolunteerInput, options: string[]) {
    return <label className="team-field" key={key}><span>{label}</span><select value={form[key]} onChange={event => update(key, event.target.value)} required><option value="" disabled>اختر {label}</option>{options.map(value => <option key={value}>{value}</option>)}</select></label>;
  }

  return <TeamDialog title={person ? 'تعديل بيانات الشخص' : 'إضافة شخص إلى صحوة'} onClose={onClose} busy={busy || readingPhoto}>
    <form onSubmit={submit} aria-busy={busy || readingPhoto}>
      <fieldset disabled={busy} className="team-form-body">
        <div className="team-photo-picker">
          <div className="team-avatar team-avatar-large">{preview ? <img src={preview} alt="معاينة الصورة" /> : <UserRound size={35} aria-hidden="true" />}</div>
          <div><label className="team-button team-button-secondary team-photo-label"><Camera size={17} aria-hidden="true" />{readingPhoto ? 'جارٍ تجهيز الصورة…' : 'اختيار صورة'}<input type="file" accept="image/jpeg,image/png,image/webp" disabled={readingPhoto} onChange={async event => {
            const file = event.target.files?.[0]; event.target.value = ''; if (!file) return;
            setReadingPhoto(true); setError('');
            try { setPhoto(await preparePhoto(file)); } catch (reason) { setError(reason instanceof Error ? reason.message : 'تعذرت قراءة الصورة.'); } finally { setReadingPhoto(false); }
          }} /></label><p className="text-xs text-brand-muted mt-2">الصورة اختيارية</p>{preview && <button type="button" className="team-text-button mt-1" disabled={readingPhoto} onClick={() => setPhoto(null)}>إزالة الصورة</button>}</div>
        </div>
        <div className="team-form-section"><h3>البيانات الشخصية والدراسة</h3><div className="team-form-grid">
          <label className="team-field sm:col-span-2"><span>الاسم الكامل <span aria-hidden="true">*</span></span><input value={form.fullName} onChange={event => update('fullName', event.target.value)} required maxLength={120} autoComplete="name" /></label>
          {select('النوع', 'gender', GENDERS)}
          <label className="team-field"><span>الجامعة</span><select required value={customUniversity ? '__other' : form.university} onChange={event => { const other = event.target.value === '__other'; setCustomUniversity(other); update('university', other ? '' : event.target.value); }}><option value="" disabled>اختر الجامعة</option>{UNIVERSITIES.map(value => <option key={value}>{value}</option>)}<option value="__other">أخرى</option></select></label>
          {customUniversity && <label className="team-field sm:col-span-2"><span>اسم الجامعة الأخرى</span><input required value={form.university} onChange={event => update('university', event.target.value)} maxLength={120} /></label>}
          <label className="team-field"><span>التخصص</span><input value={form.major} onChange={event => update('major', event.target.value)} maxLength={120} /></label>
          {select('طالب / خريج', 'studyStatus', STUDY_STATUSES)}
          <label className="team-field"><span>السنة الدراسية</span><input value={form.studyYear} onChange={event => update('studyYear', event.target.value)} maxLength={60} placeholder="مثال: الثالثة، تحضيري، ماجستير" /></label>
          <label className="team-field"><span>رقم الهاتف</span><input type="tel" dir="ltr" value={form.phone} onChange={event => update('phone', event.target.value)} maxLength={30} autoComplete="tel" placeholder="+90…" /></label>
        </div></div>
        <div className="team-form-section"><h3>المشاركة داخل صحوة</h3><div className="team-form-grid">
          {select('مجال العمل', 'workArea', WORK_AREAS)}
          {select('نطاق العمل', 'workScope', WORK_SCOPES)}
          <label className="team-field"><span>الدور</span><select required value={customRole ? '__other' : form.role} onChange={event => { const other = event.target.value === '__other'; setCustomRole(other); update('role', other ? '' : event.target.value); }}>{roleOptions.map(value => <option key={value}>{value}</option>)}<option value="__other">إضافة دور آخر…</option></select></label>
          <label className="team-field"><span>تاريخ الانضمام إلى صحوة</span><input type="date" dir="ltr" value={form.joinedAt} onChange={event => update('joinedAt', event.target.value)} min="2000-01-01" max="2100-12-31" /></label>
          {customRole && <label className="team-field sm:col-span-2"><span>اسم الدور الجديد</span><input required value={form.role} onChange={event => update('role', event.target.value)} maxLength={80} /></label>}
          <div className="sm:col-span-2">{select('حالة الشخص داخل صحوة', 'status', PERSON_STATUSES)}<p className="text-xs text-brand-muted mt-2">حالة المشاركة مستقلة عن كونه طالبًا أو خريجًا.</p></div>
          <label className="team-field sm:col-span-2"><span>المهارات <small>اختياري</small></span><textarea rows={3} value={form.skills} onChange={event => update('skills', event.target.value)} maxLength={1000} placeholder="مثال: التصميم، التصوير، التنظيم…" /></label>
        </div></div>
      </fieldset>
      {error && <p className="team-error mx-5 mb-4" role="alert">{error}</p>}
      <div className="team-dialog-footer"><button type="submit" className="team-button" disabled={busy || readingPhoto}>{busy && <Loader2 size={17} className="animate-spin" aria-hidden="true" />}{busy ? 'جارٍ الحفظ…' : person ? 'حفظ التعديلات' : 'إضافة الشخص'}</button><button type="button" className="team-button team-button-secondary" onClick={onClose} disabled={busy || readingPhoto}>إلغاء</button></div>
    </form>
  </TeamDialog>;
}
