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
    <section className="py-24 sm:py-32 bg-[#7F373B]/[0.02]">
      <div className="max-w-4xl mx-auto px-6 sm:px-8">
        <div className="text-center">
          <span className="inline-block w-12 h-0.5 bg-[#C79250] mb-8"></span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#7F373B] mb-10">
            كيف تتحقق هذه الرؤية؟
          </h2>

          <p className="text-base sm:text-lg text-gray-700 mb-8">
            الأهداف الاستراتيجية
          </p>

          <ol className="text-right space-y-4">
            {strategicGoals.map((goal, index) => (
              <li
                key={goal}
                className="bg-[#FFFEFD] border border-[#7F373B]/10 rounded-2xl p-5 sm:p-6 text-gray-700 leading-[1.9]"
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
