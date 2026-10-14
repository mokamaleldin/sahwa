import React from 'react';

const DefinitionSection: React.FC = () => {
  return (
    <section id="story" className="py-14 sm:py-20 lg:py-24 relative overflow-hidden">
      <div className="page-container max-w-4xl relative z-10">
        <div className="text-center mb-8 sm:mb-12">
          <span className="section-divider"></span>
          <p className="text-xs tracking-[0.25em] uppercase text-[#D6AD63] font-bold mb-3">
            كيف بدأت صحوة؟
          </p>
          <h2 className="text-2xl sm:text-4xl font-heading font-bold text-[#752026]">
            من لاحظوا ولم يسكتوا
          </h2>
        </div>

        <div className="section-card p-6 sm:p-10 text-right">
          <div className="space-y-5 text-base sm:text-lg text-[#350E15]/90 leading-[2.2]">
            <p>
              في السنة الأولى من الجامعة، بدأنا نلاحظ شيئاً يصعب تجاهله.
              أصدقاء كنا نعرفهم — أصدقاء قريبون — بدأوا يتغيرون بهدوء.
              واحد انجرف مع بيئة ما فيها خير، وثانٍ بدأ يبتعد عن دينه شيئاً فشيئاً، وثالث غرق في الفراغ — لا هدف، لا رفقة، ولا معنى.
            </p>
            <p>
              الجامعة مكان مفتوح ومليء بالاتجاهات — وبدون صحبة صالحة تحمل الإنسان، كثير من الشباب يضيع فيها بدون ما يدري.
              لم يكن ذلك قضاءً لا يُرد — كان واقعاً يمكن تغييره.
            </p>
            <p>
              في السنة الثانية قررنا أن نبدأ.
              لا انتظار لمؤسسة تحل المشكلة، ولا كلام بدون عمل.
              جلسنا مع بعض وقلنا: نبني صحبة صالحة حقيقية.
              بدأنا بشيء بسيط — درس قرآني أسبوعي، ولقاء منتظم، وأناس نثق بهم.
            </p>
            <p>
              ثم علمنا أن شباباً في جامعة بلجي كانوا يفعلون نفس الشيء تماماً — يقيمون درساً في القرآن، ويبنون دائرة من الأخوة.
              تواصلنا معهم وكان السؤال واحداً:{' '}
              <span className="font-bold text-[#752026]">
                طالما الفكرة واحدة، لماذا لا نعمل معاً؟
              </span>
            </p>
            <p>
              من هنا بدأت صحوة.
              كنا نريد أن نُصلح بعضنا ونُصلح من حولنا — فكان الاسم:{' '}
              <span className="font-bold text-[#752026]">صحوة</span>.
              واخترنا شعار «شباب أمتنا» لأننا نتكلم مع شباب المسلمين كلهم —
              لا حدود ولا جنسيات تفصلنا.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DefinitionSection;

