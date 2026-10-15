export interface VolunteerInput {
  fullName: string;
  gender: string;
  university: string;
  major: string;
  studyYear: string;
  studyStatus: string;
  workArea: string;
  workScope: string;
  role: string;
  joinedAt: string;
  phone: string;
  skills: string;
  status: string;
}

export interface Volunteer extends VolunteerInput {
  id: string;
  revision: number;
  photoId: string | null;
  createdAt: string;
  updatedAt: string;
}

export type VolunteerFilters = Pick<VolunteerInput, 'university' | 'workArea' | 'role' | 'studyStatus' | 'status' | 'gender'> & { query: string };
export const EMPTY_FILTERS: VolunteerFilters = { query: '', university: '', workArea: '', role: '', studyStatus: '', status: '', gender: '' };
export const EMPTY_PERSON: VolunteerInput = {
  fullName: '', gender: '', university: '', major: '', studyYear: '', studyStatus: 'طالب',
  workArea: 'متطوع عام', workScope: 'عام / مركزي', role: 'عضو', joinedAt: '', phone: '', skills: '', status: 'متطوع حاليًا',
};

export async function teamRequest<T>(options: RequestInit = {}): Promise<T> {
  const response = await fetch('/api/team', { ...options, cache: 'no-store', credentials: 'same-origin' });
  if (response.status === 401) {
    window.dispatchEvent(new Event('sahwa:unauthorized'));
    throw new Error('انتهت الجلسة. سجّل الدخول مجددًا.');
  }
  let result;
  try { result = await response.json(); } catch { throw new Error('تعذر الاتصال ببيانات الفريق. حاول مجددًا.'); }
  if (!response.ok) throw new Error(result.error || 'تعذر حفظ التعديل. حاول مجددًا.');
  return result as T;
}

export function photoUrl(photoId: string) {
  return `/api/team?photo=${encodeURIComponent(photoId)}`;
}

export async function preparePhoto(file: File): Promise<string> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('اختر صورة JPG أو PNG أو WebP.');
  if (file.size > 10 * 1024 * 1024) throw new Error('اختر صورة أصغر من 10 ميجابايت.');
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    if (!image.naturalWidth || image.naturalWidth * image.naturalHeight > 40_000_000) throw new Error('الصورة كبيرة جدًا. اختر نسخة أصغر.');
    const scale = Math.min(1, 400 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('تعذرت قراءة الصورة.');
    context.fillStyle = '#f2e9e2';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.85);
  } finally { URL.revokeObjectURL(url); }
}
