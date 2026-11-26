import { useEffect, useId, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

export default function TeamDialog({ title, headerExtra, onClose, busy = false, children }: { title: string; headerExtra?: ReactNode; onClose: () => void; busy?: boolean; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const onCloseRef = useRef(onClose);
  const busyRef = useRef(busy);
  onCloseRef.current = onClose;
  busyRef.current = busy;

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    dialog.showModal();

    // Progressive enhancement fallback for browsers without native <dialog closedby="any"> (e.g. Safari).
    const supportsClosedBy = typeof HTMLDialogElement !== 'undefined' && 'closedBy' in HTMLDialogElement.prototype;
    let pressedOutside = false;
    const isOutside = (e: PointerEvent) => {
      const r = dialog.getBoundingClientRect();
      return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
    };
    const onPointerDown = (e: PointerEvent) => {
      pressedOutside = !busyRef.current && isOutside(e);
    };
    const onPointerUp = (e: PointerEvent) => {
      if (pressedOutside && !busyRef.current && isOutside(e)) onCloseRef.current();
      pressedOutside = false;
    };
    if (!supportsClosedBy) {
      dialog.addEventListener('pointerdown', onPointerDown);
      dialog.addEventListener('pointerup', onPointerUp);
    }
    return () => {
      if (!supportsClosedBy) {
        dialog.removeEventListener('pointerdown', onPointerDown);
        dialog.removeEventListener('pointerup', onPointerUp);
      }
      if (dialog.open) dialog.close();
    };
  }, []);

  return (
    <dialog
      ref={ref}
      className="team-dialog"
      aria-labelledby={titleId}
      {...({ closedby: busy ? 'none' : 'any' } as Record<string, string>)}
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onClose();
      }}
    >
      <div className="team-dialog-header">
        <div className="team-dialog-heading">
          <h2 id={titleId} className="font-heading">{title}</h2>
          <button type="button" className="team-icon-button" onClick={onClose} disabled={busy} aria-label="إغلاق">
            <X size={21} aria-hidden="true" />
          </button>
        </div>
        {headerExtra}
      </div>
      {children}
    </dialog>
  );
}
