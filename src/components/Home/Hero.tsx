import React from 'react';

const Hero: React.FC = () => {
  return (
    <section 
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      aria-labelledby="hero-title"
    >
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#7c393e] via-[#8b4651] to-[#c68f4f]" aria-hidden="true"></div>
      
      {/* Overlay Pattern */}
      <div className="absolute inset-0 opacity-10" aria-hidden="true">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <h1 
          id="hero-title"
          className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 animate-fade-in-up"
        >
          صحوة - Sahwa
        </h1>
        <p className="text-xl sm:text-2xl text-white/90 mb-8 leading-relaxed animate-fade-in-up animation-delay-200">
          صحوة لشباب أمتنا - مبادرة طلابية لإحياء الهوية الإسلامية في الجامعات التركية
        </p>
        <button 
          onClick={() => document.getElementById('vision')?.scrollIntoView({ behavior: 'smooth' })}
          className="bg-white text-[#7c393e] px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 animate-fade-in-up animation-delay-400"
          aria-label="اكتشف رؤية مبادرة صحوة"
        >
          اكتشف رؤيتنا
        </button>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce" aria-hidden="true">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;