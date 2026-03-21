import React from 'react';

const CTASection: React.FC = () => {
  const programs = [
    {
      icon: '📖',
      title: 'البرنامج التربوي',
      description:
        'لقاءات دورية مستمدة من القرآن الكريم والسيرة النبوية. بسيطة، عملية، وتُبنى في قلب الديوانية.',
      tags: ['قرآن', 'سيرة', 'سنة'],
    },
    {
      icon: '🤝',
      title: 'الديوانية',
      description:
        'لقاء منتظم يجمع الشباب على الصحبة والتعارف. داخل الجامعة أو خارجها، فردية أو مشتركة بين جامعتين.',
      tags: ['أسبوعي', 'صحبة'],
    },
    {
      icon: '⚽',
      title: 'الأنشطة الطلابية',
      description:
        'نشاط مفتوح شهري على الأقل: دوري كرة قدم، رحلات، مسابقات، ألعاب. الباب مفتوح لكل طالب.',
      tags: ['شهري', 'مفتوح للجميع'],
    },
    {
      icon: '🌍',
      title: 'حملات توعوية',
      description:
        'حملتان على الأقل في السنة عن قضايا الأمة — فكرة الوحدة الإسلامية وقضايا المسلمين في العالم.',
      tags: ['سنوي', 'توعية'],
    },
    {
      icon: '🎓',
      title: 'دورات تدريبية',
      description:
        'ثلاث دورات على الأقل في السنة: إعلام وصناعة محتوى، خطابة وتواصل، قيادة وإدارة الذات.',
      tags: ['إعلام', 'خطابة', 'قيادة'],
    },
    {
      icon: '🎉',
      title: 'اللقاء العام',
      description:
        'مرتان في السنة يلتقي فيها أعضاء صحوة كلهم — الحاليون والجدد والمتخرجون. رحلة، غداء، أو يوم مفتوح.',
      tags: ['نصف سنوي', 'كل الجامعات'],
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-[#7F373B]/[0.03]">
      <div className="page-container max-w-4xl text-center">
        <div className="section-card p-6 sm:p-10 text-right">
          <div className="text-center mb-6 sm:mb-8">
            <span className="section-divider"></span>
            <p className="text-xs tracking-[0.25em] uppercase text-[#C79250] mb-3">
              برامجنا
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#7F373B]">
              ماذا نفعل في صحوة؟
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {programs.map((program) => (
              <div key={program.title} className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100">
                <div className="text-2xl mb-2" aria-hidden="true">
                  {program.icon}
                </div>
                <h3 className="text-sm sm:text-base font-bold text-[#7F373B] mb-1">
                  {program.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-2">
                  {program.description}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {program.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[0.65rem] sm:text-[0.7rem] font-semibold text-[#C79250] bg-[#C79250]/10 px-2 py-0.5 rounded-full tracking-wide"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
