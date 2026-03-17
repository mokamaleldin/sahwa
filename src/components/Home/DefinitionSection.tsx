import React from 'react';

const DefinitionSection: React.FC = () => {
  const visionPoints = [
    {
      title: 'مساحة طلابية شبابية ممتعة',
      description: 'نبني مساحة حية بأفكار شبابية قريبة من واقع الطالب الجامعي واهتماماته.',
    },
    {
      title: 'هوية الأمة الواحدة',
      description: 'نرسّخ معنى أننا أمة واحدة لا تعترف بحدود سايكس بيكو، وأن رابطتنا الإسلام.',
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
    <section id="definition" className="py-24 sm:py-32 bg-[#FFFEFD]">
      <div className="max-w-4xl mx-auto px-6 sm:px-8">
        <div className="text-center">
          <span className="inline-block w-12 h-0.5 bg-[#C79250] mb-8"></span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#7F373B] mb-10">
            رؤية صحوة
          </h2>

          <p className="text-lg sm:text-xl leading-[2] text-gray-700 font-light mb-10">
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

          <div className="text-right space-y-5">
            {visionPoints.map((point, index) => (
              <div key={point.title} className="bg-white border border-[#7F373B]/10 rounded-2xl p-5 sm:p-6">
                <p className="text-[#7F373B] font-bold text-base sm:text-lg mb-2">
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
