import React from 'react';

const DefinitionSection: React.FC = () => {
  return (
    <section id="definition" className="py-24 sm:py-32 bg-[#FFFEFD]">
      <div className="max-w-3xl mx-auto px-6 sm:px-8">
        <div className="text-center">
          <span className="inline-block w-12 h-0.5 bg-[#C79250] mb-8"></span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#7F373B] mb-10">
            ما هي صحوة؟
          </h2>
          
          <p className="text-lg sm:text-xl leading-[2] text-gray-600 font-light">
            صحوة مساحة شبابية تنطلق من هوية هذه الأمة،
            <br />
            تجمع الطلاب حول الصحبة الصالحة والوعي والعمل،
            <br />
            لنعيش الإسلام بإخلاص في حياتنا الجامعية اليومية،
            <br />
            ونُعِد أنفسنا لنكون مساهمين حقيقيين في نهضة الأمة.
          </p>
        </div>
      </div>
    </section>
  );
};

export default DefinitionSection;
