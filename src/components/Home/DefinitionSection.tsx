import React from 'react';

const DefinitionSection: React.FC = () => {
  const visionPoints = [
    {
      title: 'مساحة طلابية شبابية ممتعة',
      description: 'نبني مساحة حية بأفكار شبابية قريبة من واقع الطالب الجامعي واهتماماته.',
    },
    {
      title: 'هوية الأمة الواحدة',
      description: 'نرسّخ معنى أننا أمة واحدة تجمعنا رابطة الإسلام والقيم المشتركة.',
    },
    {
      title: 'صحبة وأخوّة وسند',
      description: 'نجمع الطلاب على الصحبة الصالحة والأخوة الصادقة ليكونوا سندًا لبعضهم في طريق الثبات.',
    },
    {
      title: 'نتعلم ونُعلّم',
      description: 'نتعلم من الدروس ومن تجارب الإخوة، ثم ننقل العلم والخير لغيرنا داخل الجامعة وخارجها.',
    },
    {
      title: 'عنصر فعّال في نهضة الأمة',
      description: 'غايتنا أن يكون الطالب نافعًا لمجتمعه وأمته، منجزًا ومؤثرًا في صحوة الأمة على المدى البعيد.',
    },
  ];

  return (
    <section id="definition" className="py-16 sm:py-24 lg:py-28">
      <div className="page-container max-w-5xl">
        <div className="text-center">
          <span className="section-divider"></span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#7F373B] mb-8 sm:mb-10">
            رؤية صحوة
          </h2>

          <p className="section-card text-base sm:text-xl leading-[2] text-gray-700 font-light mb-8 sm:mb-10 p-5 sm:p-8">
            صحوة هي مساحة طلابية
            <br />
            تنطلق من هوية الأمة الواحدة
            <br />
            تجمع الطلاب حول الصحبة الصالحة
            <br />
            وتجعلهم نافعين لمجتمعهم وأمتهم
            <br />
            ويكونوا عنصرًا فعالًا في نهضة أمتهم
          </p>

          <div className="text-right grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {visionPoints.map((point, index) => (
              <div key={point.title} className="section-card p-5 sm:p-6">
                <p className="text-[#7F373B] font-bold text-base sm:text-lg mb-2 leading-relaxed">
                  {index + 1}. {point.title}
                </p>
                <p className="text-gray-600 leading-[1.9] text-sm sm:text-base font-light">
                  {point.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DefinitionSection;
