import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { SITE_FEATURES } from '../../config/features';
import { useSession } from '../../auth/useSession';

export default function TeamNavigation() {
  const { signOut } = useSession();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [leaving, setLeaving] = useState(false);
  async function logout() {
    setLeaving(true); setError('');
    try { await signOut(); navigate('/login', { replace: true }); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'تعذر تسجيل الخروج. حاول مجددًا.'); setLeaving(false); }
  }
  return <>
    <div className="team-navigation-row">
      <nav className="team-navigation" aria-label="مساحة الفريق">
        <NavLink to="/team" end>مساحة الفريق</NavLink>
        {SITE_FEATURES.volunteers && <NavLink to="/team/volunteers">المتطوعون</NavLink>}
        <NavLink to="/team/files">الملفات</NavLink>
        <NavLink to="/team/forms">النماذج المهمة</NavLink>
        <NavLink to="/studio">الاستوديو</NavLink>
      </nav>
      <button className="team-text-button" onClick={logout} disabled={leaving}><LogOut size={16} aria-hidden="true" />{leaving ? 'جارٍ الخروج…' : 'تسجيل الخروج'}</button>
    </div>
    {error && <p className="team-error mb-6" role="alert">{error}</p>}
  </>;
}
