import { useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { LibraryBook } from '../../data/library';

interface Props {
  book: LibraryBook;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
}

export default function BookPreview({ book, onClose, onPrevious, onNext }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    element.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      element.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, []);

  return (
    <dialog
      ref={dialog}
      className="library-book-dialog"
      aria-label={`صورة كتاب ${book.title} — ${book.author}`}
      onCancel={onClose}
      onKeyDown={event => {
        if (event.key === 'ArrowLeft') onNext?.();
        if (event.key === 'ArrowRight') onPrevious?.();
      }}
      onClick={event => {
        if (event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose();
      }}
    >
      <div className="flex items-center justify-between gap-4 pb-3">
        <span className="text-sm text-brand-muted">صورة الكتاب</span>
        <button type="button" onClick={onClose} autoFocus className="tap-target inline-flex items-center justify-center rounded-full hover:bg-brand-primary/10" aria-label="إغلاق صورة الكتاب"><X size={22} /></button>
      </div>
      <img key={book.id} src={book.image} alt={`${book.title} — ${book.author}`} className="library-book-full-image" />
      {onNext || onPrevious ? (
        <div className="flex justify-between gap-4 pt-3">
          <button type="button" onClick={onPrevious} disabled={!onPrevious} className="tap-target inline-flex items-center gap-2 px-3 rounded-full hover:bg-brand-primary/10 disabled:opacity-35"><ChevronRight size={18} /> السابق</button>
          <button type="button" onClick={onNext} disabled={!onNext} className="tap-target inline-flex items-center gap-2 px-3 rounded-full hover:bg-brand-primary/10 disabled:opacity-35">التالي <ChevronLeft size={18} /></button>
        </div>
      ) : null}
    </dialog>
  );
}
