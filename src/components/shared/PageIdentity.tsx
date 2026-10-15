import type { ReactNode } from 'react';

interface PageHeadingProps {
  title: string;
  description?: ReactNode;
  id?: string;
  variant?: 'page' | 'home';
  className?: string;
}

export function PageEmblem() {
  return (
    <div className="sahwa-page-emblem" aria-hidden="true">
      <img src="/sahwa-icon.png" alt="" width="320" height="320" />
    </div>
  );
}

export default function PageHeading({ title, description, id, variant = 'page', className = '' }: PageHeadingProps) {
  const home = variant === 'home';
  return (
    <div className={`sahwa-page-heading text-center ${home ? 'sahwa-page-heading-home' : 'mb-10 sm:mb-16'} ${className}`}>
      <img src="/sahwa-icon.png" alt="" width={home ? 112 : 44} height={home ? 112 : 44} className="sahwa-page-heading-icon" />
      <span className="sahwa-page-heading-rule" aria-hidden="true" />
      <h1 id={id} className="font-heading font-bold text-brand-primary">{title}</h1>
      {description ? <p className="sahwa-page-heading-description">{description}</p> : null}
    </div>
  );
}
