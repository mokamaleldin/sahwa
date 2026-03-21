import React from 'react';

const DefinitionSection: React.FC = () => {
  return (
    <section id="definition" className="py-16 sm:py-24 lg:py-28">
      <div className="page-container max-w-5xl">
        <div className="text-center mb-8 sm:mb-10">
          <span className="section-divider"></span>
          <p className="text-xs tracking-[0.25em] uppercase text-[#C79250] mb-3">
            كيف بدأت صحوة؟
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#7F373B]">
            من لاحظوا ولم يسكتوا
          </h2>
        </div>

        <div className="section-card p-5 sm:p-8 text-right">
          <div className="space-y-4 text-sm sm:text-base text-[#3a2e25] leading-[2.1]">
            <p>
              في السنة الأولى من الجامعة، بدأنا نلاحظ شيئاً يصعب تجاهله.
              أصدقاء كنا نعرفهم — أصدقاء قريبون — بدأوا يتغيرون بهدوء.
              واحد انجرف مع بيئة ما فيها خير. وثاني بدأ يبتعد عن دينه شيئاً فشيئاً. وثالث غرق في الفراغ — لا هدف، لا رفقة، لا معنى.
            </p>
            <p>
              الجامعة مكان مفتوح ومليء بالاتجاهات — وبدون صحبة صالحة تحمل الإنسان، كثير من الشباب يضيع فيها بدون ما يدري.
              لم يكن ذلك قضاء لا يُرد — كان واقعاً يمكن تغييره.
            </p>
            <p>
              في السنة الثانية قررنا أن نبدأ.
              لا انتظار لمؤسسة تحل المشكلة، ولا كلام بدون عمل.
              جلسنا مع بعض وقلنا: نبني صحبة صالحة حقيقية.
              بدأنا بشيء بسيط — درس قرآني أسبوعي، ولقاء منتظم، وأناس نثق بهم.
            </p>
            <p>
              ثم علمنا أن شباباً في جامعة بلجي كانوا يفعلون نفس الشيء تماماً — يقيمون درساً في القرآن، يبنون دائرة من الأخوة.
              تواصلنا معهم وكان السؤال واحداً:
              <span className="font-bold text-[#7F373B]"> طالما الفكرة واحدة، لماذا لا نعمل معاً؟</span>
            </p>
            <p>
              من هنا بدأت صحوة.
              كنا نريد أن نُصلح بعضنا ونُصلح من حولنا — فكان الاسم: <span className="font-bold text-[#7F373B]">صحوة</span>.
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
