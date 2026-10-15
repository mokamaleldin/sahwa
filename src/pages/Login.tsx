import { useState, type FormEvent } from 'react';
import { ArrowLeft, Eye, EyeOff, Loader2, LockKeyhole } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useSession } from '../auth/useSession';
import PageHeading, { PageEmblem } from '../components/shared/PageIdentity';

export default function Login() {
  const [search] = useSearchParams();
  const requestedPath = search.get('next');
  const destination = requestedPath && ['/team', '/team/volunteers', '/team/files', '/studio'].includes(requestedPath) ? requestedPath : '/team';
  const navigate = useNavigate();
  const { status, error: sessionError, signIn, refresh } = useSession();
  const [email, setEmail] = useState('sahwaturkey@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const checking = status === 'loading';
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (checking || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      await signIn({ email, password, remember });
      navigate(destination, { replace: true });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'تعذر الاتصال. تحقق من الإنترنت وحاول مرة أخرى.');
      setSubmitting(false);
    }
  }

  const busy = checking || submitting;
  if (status === 'authenticated') return <Navigate to={destination} replace />;

  return (
    <>
      <Helmet>
        <title>تسجيل الدخول | صحوة</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <main className="app-shell sahwa-page-surface pt-24 sm:pt-28 pb-6 sm:pb-12">
        <PageEmblem />

        <div className="page-container relative z-10">
          <div className="mx-auto max-w-md">
            <PageHeading title="مساحة فريق صحوة" description="ادخل بحساب الفريق للوصول إلى أدوات ومساحة صحوة" />

            <section className="section-card p-6 sm:p-9" aria-labelledby="login-heading">
              <div className="flex items-center gap-3 mb-7">
                <div className="w-11 h-11 rounded-xl bg-[#752026]/[0.08] flex items-center justify-center text-[#752026]">
                  <LockKeyhole size={20} aria-hidden="true" />
                </div>
                <h2 id="login-heading" className="text-lg font-bold text-[#752026]">تسجيل الدخول</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5" aria-busy={busy}>
                <div>
                  <label htmlFor="login-email" className="block text-sm font-medium text-[#350E15] mb-2">البريد الإلكتروني</label>
                  <input id="login-email" type="email" name="email" dir="ltr" autoComplete="username"
                    value={email} onChange={event => setEmail(event.target.value)} required maxLength={254}
                    disabled={busy} className="login-input" />
                </div>
                <div>
                  <label htmlFor="login-password" className="block text-sm font-medium text-[#350E15] mb-2">كلمة المرور</label>
                  <div className="relative">
                    <input id="login-password" type={showPassword ? 'text' : 'password'} name="password" dir="ltr"
                      autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)}
                      required maxLength={256} disabled={busy} aria-describedby={error ? 'login-error' : undefined}
                      className="login-input login-password" />
                    <button type="button" onClick={() => setShowPassword(value => !value)}
                      className="tap-target absolute right-1 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-lg text-gray-400 hover:text-[#752026]"
                      aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'} aria-pressed={showPassword}>
                      {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                    </button>
                  </div>
                </div>
                <label className="flex items-center gap-2.5 text-sm text-[#350E15] cursor-pointer">
                  <input type="checkbox" checked={remember} onChange={event => setRemember(event.target.checked)}
                    disabled={busy} className="h-4 w-4 accent-[#752026]" />
                  تذكرني على هذا الجهاز
                </label>
                {(error || sessionError) && <p id="login-error" role="alert" className="rounded-xl bg-red-50/80 border border-red-200 px-4 py-3 text-sm text-red-800">{error || sessionError}{status === 'error' && <button type="button" onClick={() => void refresh({ force: true })} className="underline block mt-2">إعادة التحقق</button>}</p>}
                <button type="submit" disabled={busy}
                  className="tap-target w-full flex items-center justify-center gap-3 rounded-xl bg-[#752026] px-5 py-3.5 text-[#F2E9E2] font-medium hover:bg-[#350E15] disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
                  {busy ? <Loader2 size={19} className="animate-spin" aria-hidden="true" /> : <ArrowLeft size={19} aria-hidden="true" />}
                  {checking ? 'جارٍ التحقق…' : submitting ? 'جارٍ الدخول…' : 'الدخول إلى مساحة الفريق'}
                </button>
              </form>
            </section>
            <div className="text-center mt-6">
              <Link to="/" className="tap-target inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#7F373B]">
                العودة لموقع صحوة <ArrowLeft size={16} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
