import React from 'react';

const DefinitionSection: React.FC = () => {
  return (
    <section id="story" className="py-16 sm:py-24 relative overflow-hidden bg-transparent">
      <div className="page-container max-w-4xl relative z-10">
        <div className="text-center mb-10 sm:mb-14">
          <span className="section-divider mb-4"></span>
          <p className="text-xs sm:text-sm tracking-[0.25em] uppercase text-[#D6AD63] font-bold mb-3">
            كيف بدأت صحوة؟
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-[#752026]">
            من لاحظوا ولم يسكتوا
          </h2>
        </div>

        <div className="section-card p-7 sm:p-12 text-right">
          <div className="space-y-6 text-base sm:text-lg text-[#350E15]/90 leading-[2.2] font-normal">
            <p>
              في أول سنة لنا في الجامعة، بدأنا نلاحظ شيئًا يتكرر حولنا. شباب يدخلون بيئات جديدة، ولا يجدون الصحبة التي تعينهم، فيبتعد بعضهم بهدوء عن مبادئ كانوا يتمسكون بها، ويعيش آخرون بلا معنى واضح ولا اتجاه.
            </p>
            <p>
              لم نرد أن نكتفي بالملاحظة، فبدأنا بأنفسنا:{' '}
              <span className="font-bold text-[#752026]">
                صحبة صالحة وقراءة للقرآن
              </span>
              . كان هدفنا في البداية أن نحافظ على أنفسنا ونصنع خيرًا بسيطًا حولنا.
            </p>
            <p>
              ثم عرفنا شبابًا آخرين لديهم التوجه نفسه، فاجتمعنا وتشاركنا الأفكار، وانضم إلينا شباب من جامعات أخرى. ومع كل خطوة كانت الفكرة تكبر معنا.
            </p>
            <p>
              لم نعد نريد مجرد نشاط داخل الجامعة، بل أن نبني بيئة يتقوّى فيها الشباب بعضهم ببعض، و
              <span className="font-bold text-[#752026]">
                تتجاوز اختلاف البلدان والجنسيات إلى معنى الأمة الواحدة
              </span>
              .
            </p>
            <p>
              ومع الوقت اتضح لنا أكثر ما نريد؛ فقد اجتمعنا في البداية على القرآن،{' '}
              <span className="font-bold text-[#752026]">
                فجعلنا القرآن مرجعنا، والصحبة الصالحة سندنا، والأمة الواحدة تجمعنا، والنفع والأثر غايتنا
              </span>
              .
            </p>
            <p>
              ومن هنا أخذت صحوة شكلها الذي نعرفه اليوم؛{' '}
              <span className="font-bold text-[#752026]">
                لتكون فعلًا صحوة لهذا الجيل، وبذرة خير وإصلاح في هذه الأمة
              </span>
              .
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DefinitionSection;
