import { Link } from "../../lib/navigation";

export default function StudentActivitiesSection() {
  return (
    <section className="py-12 sm:py-20 bg-transparent" aria-labelledby="student-activities-heading">
      <div className="page-container max-w-4xl">
        <div className="section-card p-7 sm:p-12 text-right">
          <h2 id="student-activities-heading" className="font-heading text-3xl sm:text-4xl font-bold text-[#752026] mb-5">
            أنشطة طلابية ومجتمع شبابي في إسطنبول
          </h2>
          <p className="leading-loose text-[#350E15]/90 mb-5">
            صحوة مساحة للطلاب والشباب في الجامعات التركية، تجمعنا حول القرآن والصحبة الصالحة
            والوعي والعمل النافع. إذا كنت تبحث عن مجتمع طلابي في إسطنبول أو مبادرات طلابية
            تعينك على التعارف وبناء صحبة جيدة، فتعرّف على صحوة وجامعاتها.
          </p>
          <p className="leading-loose text-[#350E15]/90 mb-7">
            توجد مجموعات صحوة الطلابية في جامعة استينيا (İstinye University)، وجامعة بيلجي
            (Istanbul Bilgi University)، وجامعة جيليشيم (Istanbul Gelişim University).
            تعرف على مجتمع جامعتك وكيف تنضم إليه.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/universities" className="tap-target inline-flex rounded-xl bg-[#752026] text-[#F2E9E2] px-6 py-3">
              اكتشف مجتمعات الجامعات
            </Link>
            <Link to="/social" className="tap-target inline-flex rounded-xl border border-[#752026] text-[#752026] px-6 py-3">
              تابع صحوة وتواصل معنا
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
