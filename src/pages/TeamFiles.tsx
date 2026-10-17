import { ArrowUpLeft, Camera, FileText, FolderOpen, Image } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import PageHeading from '../components/shared/PageIdentity';
import { TEAM_FOLDERS } from '../data/teamFiles';

const icons = [Image, FileText, Camera];

export default function TeamFiles() {
  return <>
    <Helmet><title>ملفات الفريق | صحوة</title></Helmet>
    <PageHeading title="ملفات صحوة" description="افتح المجلد المناسب، وتابع العمل وارفع ملفاتك داخل Google Drive." />
    <section className="team-portal-grid team-portal-grid-two" aria-label="مجلدات ملفات صحوة">
      {TEAM_FOLDERS.map((folder, index) => {
        const Icon = icons[index] || FolderOpen;
        return <a className="team-portal-card" key={folder.id} href={folder.url} target="_blank" rel="noopener noreferrer">
          <div className="team-portal-top"><span className="team-icon"><Icon size={29} strokeWidth={1.5} aria-hidden="true" /></span><span className="team-drive-label">Google Drive</span></div>
          <h2 className="font-heading">{folder.title}</h2><p>{folder.description}</p>
          <span className="team-card-action">فتح المجلد<span className="sr-only"> في نافذة جديدة</span><ArrowUpLeft size={18} aria-hidden="true" /></span>
        </a>;
      })}
    </section>
  </>;
}
