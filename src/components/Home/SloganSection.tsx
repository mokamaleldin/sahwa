import React from 'react';

const SloganSection: React.FC = () => {
  const visionPillars = [
    {
      title: 'مساحة شبابية',
      description: 'مكان ممتع وحقيقي يعيش فيه الشاب أفكاره وطاقته.',
    },
    {
      title: 'أمة واحدة',
      description: 'المسلمون أمة واحدة، وهوية مشتركة لا تفرقها الحدود.',
    },
    {
      title: 'صحبة وإخوة وسند',
      description: 'رفقة تحملك وتبقى معك في كل طريق.',
    },
    {
      title: 'تعلّم وعلّم',
      description: 'تتعلم من الدروس ومن إخوانك، وتنقل العلم لغيرك.',
    },
    {
      title: 'هدف يستحق',
      description: 'أن تكون نافعاً وعنصراً فعالاً في نهضة أمتك.',
    },
  ];

  const arabicNumerals = ['١', '٢', '٣', '٤', '٥'];

  return (
    <section className="py-20 sm:py-28 bg-[#FFFEFD] relative overflow-hidden">
      <div className="absolute inset-0 hidden sm:flex items-center justify-center opacity-5">
        <span className="text-[210px] lg:text-[300px] font-bold text-[#7F373B] select-none">صحوة</span>
      </div>
      
      <div className="relative z-10 page-container max-w-5xl">
        <div className="text-center mb-8 sm:mb-10">
          <span className="section-divider"></span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#7F373B] mb-4">
            الرؤية
          </h2>
          <p className="text-base sm:text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
            صحوة هي مساحة طلابية تنطلق من هوية الأمة الواحدة، تجمع الطلاب حول الصحبة الصالحة وتجعلهم نافعين لمجتمعهم وأمتهم، ويكونوا عنصراً فعالاً في نهضة أمتهم.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 text-right">
          {visionPillars.map((pillar, index) => (
            <div key={pillar.title} className="section-card p-5 sm:p-6">
              <div className="flex items-start gap-3 mb-1.5">
                <span className="text-[#C79250] font-bold text-xl">
                  {arabicNumerals[index]}
                </span>
                <p className="text-[#7F373B] font-bold text-base sm:text-lg">
                  {pillar.title}
                </p>
              </div>
              <p className="text-gray-600 text-sm sm:text-base leading-[1.9]">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SloganSection;
