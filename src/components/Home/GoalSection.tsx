import React from 'react';

const GoalSection: React.FC = () => {
  const strategicGoals = [
    {
      title: 'نواة في كل جامعة',
      description:
        'بناء مجتمع حقيقي داخل كل جامعة — خمسة أشخاص يحملون الفكرة ويعملون عليها، ثم تنمو الدائرة شيئاً فشيئاً.',
    },
    {
      title: 'نشر فكرة الأمة الواحدة',
      description:
        'تعزيز الهوية الإسلامية المشتركة وتذكير الشباب بأنهم جزء من أمة واحدة لا تفرقها الحدود.',
    },
    {
      title: 'بيئة إيمانية داخل الجامعات',
      description:
        'توفير صحبة صالحة وبيئة تدعم الشاب المسلم وتمنعه من السير وحيداً في مرحلة تحتاج فيها إلى الأخوة.',
    },
    {
      title: 'رفع الوعي الطلابي',
      description:
        'تمكين الشاب من فهم دينه وواقع أمته والقضايا التي تمسّه — حتى يكون موقفه عن بيّنة.',
    },
    {
      title: 'الاستمرارية والتوسع',
      description:
        'تجديد الطاقات باستمرار — كل دفعة تُخرّج الدفعة التالية. وتوسيع العمل ليصل لكل الفئات والجامعات.',
    },
  ];

  return (
    <section className="py-16 sm:py-24 lg:py-28 bg-[#7F373B]/[0.03]">
      <div className="page-container max-w-5xl">
        <div className="text-center">
          <span className="section-divider"></span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#7F373B] mb-8 sm:mb-10">
            كيف تتحقق الرؤية؟
          </h2>

          <ol className="text-right grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {strategicGoals.map((goal, index) => (
              <li
                key={goal}
                className="section-card p-5 sm:p-6 text-gray-700 leading-[1.9]"
              >
                <span className="text-[#7F373B] font-bold ml-2">{index + 1}-</span>{' '}
                <span className="font-bold text-[#7F373B]">{goal.title}</span>
                <span className="block text-gray-700 mt-1 text-sm sm:text-base">
                  {goal.description}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
};

export default GoalSection;
