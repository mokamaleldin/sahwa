import { ArrowUpLeft, FolderOpen, Palette, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import PageHeading from '../components/shared/PageIdentity';
import { SITE_FEATURES } from '../config/features';

const cards = [
  { title: 'معلومات المتطوعين', description: 'أهل صحوة، أدوارهم، ومجالات عملهم. ابحث عن شخص أو حدّث بيانات الفريق.', to: '/team/volunteers', icon: UsersRound, action: 'فتح دليل المتطوعين' },
  { title: 'الملفات', description: 'مجلدات اللجنة الإعلامية، الاجتماعات، وتوثيق فعاليات صحوة في مكان واحد.', to: '/team/files', icon: FolderOpen, action: 'الوصول إلى الملفات' },
  { title: 'استوديو صحوة', description: 'القوالب وأدوات التصميم التي تعرفها. جهّز منشوراتك بهوية صحوة.', to: '/studio', icon: Palette, action: 'الدخول إلى الاستوديو' },
];

export default function Team() {
  const visibleCards = cards.filter(card => card.to !== '/team/volunteers' || SITE_FEATURES.volunteers);
  return <>
    <Helmet><title>مساحة الفريق | صحوة</title></Helmet>
    <PageHeading title="مساحة فريق صحوة" description="فريقنا، ملفاتنا، وأدواتنا… كلها قريبة منك." />
    <section className={`team-portal-grid${visibleCards.length === 2 ? ' team-portal-grid-two' : ''}`} aria-label="أقسام مساحة الفريق">
      {visibleCards.map(({ title, description, to, icon: Icon, action }, index) => {
        const content = <><div className="team-portal-top"><span className="team-icon"><Icon size={29} strokeWidth={1.5} aria-hidden="true" /></span><span className="team-card-number">0{index + 1}</span></div><h2 className="font-heading">{title}</h2><p>{description}</p><span className="team-card-action">{action}<ArrowUpLeft size={18} aria-hidden="true" /></span></>;
        return to === '/studio' ? <a className="team-portal-card" href={to} key={to}>{content}</a> : <Link className="team-portal-card" to={to} key={to}>{content}</Link>;
      })}
    </section>
  </>;
}
