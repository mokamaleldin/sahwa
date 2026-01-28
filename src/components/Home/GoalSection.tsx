import React from 'react';

const GoalSection: React.FC = () => {
  return (
    <section className="py-24 sm:py-32 bg-[#7F373B]/[0.02]">
      <div className="max-w-3xl mx-auto px-6 sm:px-8">
        <div className="text-center">
          <span className="inline-block w-12 h-0.5 bg-[#C79250] mb-8"></span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#7F373B] mb-10">
            هدفنا
          </h2>
          
          <p className="text-lg sm:text-xl leading-[2] text-gray-600 font-light">
            بناء نوى طلابية داخل الجامعات توفر بيئة إيمانية آمنة وصحبة واعية،
            <br />
            تُعين الطلاب على عيش دينهم بثبات ووعي في الحياة الجامعية،
            <br />
            وتُعِدهم فكريًا وسلوكيًا ليكونوا نافعين لمجتمعهم وأمتهم.
          </p>
        </div>
      </div>
    </section>
  );
};

export default GoalSection;
