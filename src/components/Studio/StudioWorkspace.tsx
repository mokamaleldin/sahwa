import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import TeamNavigation from '../Team/TeamNavigation';

export default function StudioWorkspace({ active }: { active: boolean }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(1200);
  const [ready, setReady] = useState(false);
  const [modal, setModal] = useState(false);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== frame.current?.contentWindow) return;
      if (event.data?.type === 'sahwa:studio:expired') window.dispatchEvent(new Event('sahwa:unauthorized'));
      if (event.data?.type === 'sahwa:studio:size' && Number.isFinite(event.data.height) && event.data.height > 0) {
        setModal(event.data.modal === true);
        if (!event.data.modal) setHeight(Math.max(320, Math.min(50_000, Math.ceil(event.data.height))));
        setReady(true);
        setFailed(false);
      }
    };
    window.addEventListener('message', receive);
    return () => window.removeEventListener('message', receive);
  }, []);
  useEffect(() => {
    if (!active || ready) return;
    const timer = setTimeout(() => setFailed(true), 20_000);
    return () => clearTimeout(timer);
  }, [active, ready, attempt]);
  useEffect(() => {
    if (active) frame.current?.contentWindow?.postMessage({ type: 'sahwa:studio:measure' }, window.location.origin);
  }, [active]);
  useEffect(() => {
    if (!active || !modal) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [active, modal]);
  useEffect(() => {
    if (!active || !ready) return;
    let scheduled = 0;
    const send = () => {
      scheduled = 0;
      const element = frame.current;
      if (!element) return;
      const header = document.querySelector('header[role="banner"]');
      const rect = element.getBoundingClientRect();
      element.contentWindow?.postMessage({ type: 'sahwa:studio:viewport', top: Math.max(0, -rect.top + (header?.getBoundingClientRect().height || 96) + 16), bottom: Math.max(25, rect.bottom - window.innerHeight + 25) }, window.location.origin);
    };
    const schedule = () => { if (!scheduled) scheduled = requestAnimationFrame(send); };
    send();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => { cancelAnimationFrame(scheduled); window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule); };
  }, [active, ready, modal]);
  return <main className="app-shell pt-24 sm:pt-28 pb-10" hidden={!active} style={active ? undefined : { display: 'none' }} aria-label="استوديو صحوة">
    <div className="page-container">
      <TeamNavigation />
      {!ready && <div className="team-loading" role="status">{failed ? <><p role="alert">تعذر فتح المحرر. أعد المحاولة.</p><button className="team-button" onClick={() => { setFailed(false); setAttempt(value => value + 1); }}>إعادة المحاولة</button></> : <><Loader2 className="animate-spin" size={23} aria-hidden="true" /><p>جارٍ فتح الاستوديو…</p></>}</div>}
      <div style={!ready ? { height: 0, overflow: 'hidden' } : active && modal ? { minHeight: height } : undefined}>
      <iframe key={attempt} ref={frame} title="محرر قوالب استوديو صحوة" src="/api/studio?embed=1" allow="clipboard-write"
        className={`studio-workspace-frame${active && modal ? ' studio-workspace-modal' : ''}`} style={{ height, visibility: ready ? 'visible' : 'hidden' }}
        onLoad={() => {
          if (!frame.current?.contentDocument?.body?.classList.contains('is-embedded')) { setFailed(true); return; }
          frame.current.contentWindow?.postMessage({ type: 'sahwa:studio:measure' }, window.location.origin);
        }} />
      </div>
    </div>
  </main>;
}
