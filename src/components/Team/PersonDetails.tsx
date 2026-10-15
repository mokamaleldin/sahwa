import { useState } from 'react';
import { Pencil, Phone, Trash2, UserRound, Loader2 } from 'lucide-react';
import { photoUrl, type Volunteer } from '../../lib/team';
import TeamDialog from './TeamDialog';

export default function PersonDetails({ person, onEdit, onDelete, onClose, canEdit }: { person: Volunteer; onEdit: () => void; onDelete: () => Promise<void>; onClose: () => void; canEdit: boolean }) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const details = [
    ['النوع', person.gender], ['الجامعة', person.university], ['التخصص', person.major],
    ['طالب / خريج', person.studyStatus], ['السنة الدراسية', person.studyYear],
    ['مجال العمل', person.workArea], ['نطاق العمل', person.workScope], ['الدور', person.role],
    ['تاريخ الانضمام', person.joinedAt ? new Intl.DateTimeFormat('ar', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(person.joinedAt)) : ''],
  ];
  return <TeamDialog title="بيانات الشخص" onClose={onClose} busy={busy}>
    <div className="team-form-body">
      <div className="team-person-intro"><div className="team-avatar team-avatar-large">{person.photoId ? <img src={photoUrl(person.photoId)} alt="" /> : <UserRound size={34} aria-hidden="true" />}</div><div><h3>{person.fullName}</h3><span className="team-status">{person.status}</span></div></div>
      <dl className="team-detail-grid">{details.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || 'غير مسجل'}</dd></div>)}
        <div><dt>رقم الهاتف</dt><dd>{person.phone ? <a href={`tel:${person.phone.replace(/[^+\d]/g, '')}`} className="team-phone"><Phone size={15} aria-hidden="true" /><bdi dir="ltr">{person.phone}</bdi></a> : 'غير مسجل'}</dd></div>
        <div className="sm:col-span-2"><dt>المهارات</dt><dd className="whitespace-pre-wrap">{person.skills || 'غير مسجلة'}</dd></div>
      </dl>
      {confirming && <div className="team-delete-confirm"><p>حذف سجل «{person.fullName}» نهائيًا؟ يمكنك تغيير حالة مشاركته بدل حذفه للاحتفاظ بتاريخه في الفريق.</p><div className="flex flex-wrap gap-3 mt-3"><button className="team-button team-button-danger" disabled={busy} onClick={async () => { setBusy(true); setError(''); try { await onDelete(); } catch (reason) { setError(reason instanceof Error ? reason.message : 'تعذر الحذف.'); setBusy(false); } }}>{busy ? <Loader2 className="animate-spin" size={16} aria-hidden="true" /> : <Trash2 size={16} aria-hidden="true" />}تأكيد حذف السجل</button><button className="team-button team-button-secondary" disabled={busy} onClick={() => setConfirming(false)}>رجوع</button></div></div>}
      {error && <p className="team-error mt-4" role="alert">{error}</p>}
    </div>
    <div className="team-dialog-footer"><button className="team-button" onClick={onEdit} disabled={busy || !canEdit}><Pencil size={16} aria-hidden="true" />تعديل البيانات</button><button className="team-text-button" onClick={() => setConfirming(true)} disabled={busy || !canEdit || confirming}><Trash2 size={16} aria-hidden="true" />حذف السجل</button></div>
  </TeamDialog>;
}
