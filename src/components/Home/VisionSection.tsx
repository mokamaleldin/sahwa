import React from 'react';

const VisionSection: React.FC = () => {
  return (
    <section id="destination" className="py-20 sm:py-32 lg:py-36 relative overflow-hidden bg-transparent">
      <div className="page-container max-w-4xl text-center relative z-10">
        <span className="section-divider mb-6"></span>
        
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-[#752026] mb-8 sm:mb-12">
          إلى أين نريد أن نصل؟
        </h2>

        <p className="font-heading font-medium text-xl sm:text-2xl lg:text-3xl text-[#350E15] leading-[2] sm:leading-[2.3] max-w-3xl mx-auto">
          نطمح إلى جيل قريب من القرآن، يستمد منه هدايته ونظرته للحياة، ثابت في هويته، تحيطه صحبة صالحة وعلاقات تعينه، واعٍ بسبب وجوده ومسؤولياته، قوي في علمه وتخصصه، وقادر على أن ينفع ويبني ويترك أثرًا حيثما كان.
        </p>
      </div>
    </section>
  );
};

export default VisionSection;
