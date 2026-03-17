import React from 'react';

const GoalSection: React.FC = () => {
  const strategicGoals = [
    'بناء نواة ومجتمع داخل كل جامعة.',
    'نشر فكرة الأمة الواحدة وأن كلنا مسلمون.',
    'توفير بيئة إيمانية وصحبة صالحة داخل الجامعات.',
    'رفع الوعي الطلابي بدينهم وواقعهم.',
    'تكوين نواة مستمرة وطاقات شبابية جديدة، وتوسيع العمل ليشمل كل الفئات واستمرار الأفراد فيه.',
  ];

  return (
    <section className="py-16 sm:py-24 lg:py-28 bg-[#7F373B]/[0.03]">
      <div className="page-container max-w-5xl">
        <div className="text-center">
          <span className="section-divider"></span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#7F373B] mb-8 sm:mb-10">
            كيف تتحقق هذه الرؤية؟
          </h2>

          <ol className="text-right grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {strategicGoals.map((goal, index) => (
              <li
                key={goal}
                className="section-card p-5 sm:p-6 text-gray-700 leading-[1.9]"
              >
                <span className="text-[#7F373B] font-bold ml-2">{index + 1}-</span>
                {goal}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
};

export default GoalSection;
