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
    <section id="vision" className="py-14 sm:py-20 bg-transparent relative">
      <div className="page-container max-w-4xl">
        <div className="text-center mb-10 sm:mb-12">
          <span className="section-divider"></span>
          <h2 className="text-2xl sm:text-4xl font-heading font-bold text-[#752026] mb-4">
            الرؤية
          </h2>
          <p className="text-base sm:text-lg text-[#350E15]/90 max-w-2xl mx-auto leading-relaxed">
            صحوة هي مساحة طلابية تنطلق من هوية الأمة الواحدة، تجمع الطلاب حول الصحبة الصالحة وتجعلهم نافعين لمجتمعهم وأمتهم، ويكونوا عنصراً فعالاً في نهضة أمتهم.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 text-right">
          {visionPillars.map((pillar, index) => (
            <div
              key={pillar.title}
              className={`section-card p-5 sm:p-6 hover:border-[#752026]/25 transition-all duration-200 ${
                index === visionPillars.length - 1 ? 'md:col-span-2 md:max-w-md md:mx-auto md:w-full' : ''
              }`}
            >
              <div className="flex items-start gap-3 mb-1.5">
                <span className="text-[#D6AD63] font-bold text-lg">
                  {arabicNumerals[index]}
                </span>
                <h3 className="text-[#752026] font-bold text-base sm:text-lg">
                  {pillar.title}
                </h3>
              </div>
              <p className="text-[#350E15]/80 text-sm sm:text-base leading-[1.9]">
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

