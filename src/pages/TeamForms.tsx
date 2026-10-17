import { ArrowUpLeft, ClipboardList, Lightbulb, MessageSquare } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import PageHeading from '../components/shared/PageIdentity';
import { TEAM_FORMS } from '../data/teamForms';

const icons = [MessageSquare, Lightbulb];

export default function TeamForms() {
  return <>
    <Helmet><title>النماذج المهمة | صحوة</title></Helmet>
    <PageHeading title="النماذج المهمة" description="صوتك وأفكارك يساهمان في تطوير صحوة. اختر النموذج المناسب وشاركنا." />
    <section className="team-portal-grid team-portal-grid-two" aria-label="نماذج صحوة المهمة">
      {TEAM_FORMS.map((form, index) => {
        const Icon = icons[index] || ClipboardList;
        return <a className="team-portal-card" key={form.id} href={form.url} target="_blank" rel="noopener noreferrer">
          <div className="team-portal-top"><span className="team-icon"><Icon size={29} strokeWidth={1.5} aria-hidden="true" /></span><span className="team-card-number">0{index + 1}</span></div>
          <h2 className="font-heading">{form.title}</h2><p>{form.description}</p>
          <span className="team-card-action">فتح النموذج<span className="sr-only"> في نافذة جديدة</span><ArrowUpLeft size={18} aria-hidden="true" /></span>
        </a>;
      })}
    </section>
  </>;
}
