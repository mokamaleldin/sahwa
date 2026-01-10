import Header from './components/Header';
import Hero from './components/Home/Hero';
import Section from './components/Home/Section';
import Card from './components/Home/Card';
import Footer from './components/Footer';
import SEO from './components/SEO';

function App() {
  // Structured data for the homepage
  const homepageStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "الصفحة الرئيسية - صحوة",
    "description": "مبادرة صحوة - حركة شبابية طلابية في تركيا تهدف لتكوين جيل واعٍ يحمل هم الأمة",
    "url": "https://sahwa.space/",
    "mainEntity": {
      "@type": "Organization",
      "name": "صحوة",
      "description": "مبادرة شبابية لإحياء الهوية الإسلامية في الجامعات التركية"
    }
  };

  return (
    <>
      <SEO
        title="الرئيسية - مبادرة شبابية لإحياء الهوية الإسلامية"
        description="مبادرة صحوة - حركة شبابية طلابية في تركيا تهدف لتكوين جيل واعٍ يحمل هم الأمة. انضم لبرامجنا: حفظ القرآن، الدروس الشهرية، الديوانية والأنشطة المتنوعة."
        keywords="صحوة, مبادرة صحوة, طلاب مسلمين تركيا, جامعة استنيا, جامعة بلجي, أنشطة إسلامية, شباب مسلم"
        canonicalUrl="/"
        structuredData={homepageStructuredData}
      />
      <Header />
      <main className="min-h-screen">
        <Hero />
      
        {/* Vision Section */}
        <Section id="vision" title="الرؤية" className="bg-gray-50">
          <article>
            <Card className="max-w-4xl mx-auto text-center">
              <div className="text-lg sm:text-xl leading-relaxed text-gray-700 space-y-4">
                <p>
                  نطمح إلى تكوين الطالب الجامعي السليم، الذي يحمل في قلبه نور الإيمان، وفي عقله وعيًا وفهمًا، وفي سلوكه أخلاقًا ومسؤولية.
                </p>
                <p>
                  رؤيتنا تقوم على بناء بيئة آمنة داخل الجامعات، تكون ملاذًا من الفتن، وميدانًا للتزكية، والتفكير، والتعلم، والعمل.
                </p>
                <p>
                  نؤمن أن نهضة الأمة تبدأ من إصلاح النفس، بتخليتها من العيوب وتحليتها بالفضائل.
                </p>
                <p>
                  ونؤمن أن على كل فرد أن يحمل قضية الأمة الإسلامية، ويساهم في نهضتها من موقعه، لأن بناء الأمة يبدأ من بناء الفرد.
                </p>
                <p className="font-semibold text-[#7c393e]">
                  نعمل على تكوين جيل قيادي يحمل هم الأمة، ويدرك أن إصلاح المجتمع لا ينفصل عن تزكية النفس، وتكوين الوعي، وبناء الصحبة الصالحة.
                </p>
              </div>
            </Card>
          </article>
        </Section>

        {/* Mission Section */}
        <Section id="mission" title="الرسالة">
          <article>
            <Card className="max-w-4xl mx-auto text-center">
              <div className="text-lg sm:text-xl leading-relaxed text-gray-700 space-y-4">
                <p>
                  نحن شباب في الجامعات، نقود حركتنا بأنفسنا، وهذه المبادرة تقوم على روح الشباب وهمّ مشترك يجمعنا:
                </p>
                <p className="font-semibold text-[#7c393e]">
                  أن نُعيد الروح للإسلام في قلوبنا، وأن نُحيي الهوية الإسلامية في عقول طلاب الجامعات.
                </p>
                <p>
                  نحن صحوة قلب، صحوة وعي، وجيل يحمل هم أمته.
                </p>
                <p>
                  صحوة تبدأ من داخلنا، بإذن الله تمتد إلى شباب أمتنا.
                </p>
                <p>
                  نؤمن أن الصحبة الصالحة هي أعظم معين في الطريق، وأن البيئة الحاضنة هي مفتاح التغيير.
                </p>
                <p className="font-semibold text-[#c68f4f]">
                  نربي أنفسنا، نذكر قلوبنا، ونعمل لله خالصًا، طالبين منه القبول والسداد.
                </p>
              </div>
            </Card>
          </article>
        </Section>

        {/* Goals Section */}
      <Section id="goals" title="أهدافنا" className="bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {[
            'تعميق الفهم الصحيح للدين وربطه بالحياة اليومية.',
            'إحياء الهوية الإسلامية في قلوب وعقول طلاب الجامعة.',
            'تكوين الصحبة الصالحة التي تعين على الثبات والخير.',
            'صناعة جيل قيادي واعٍ يحمل هم الأمة ويسعى لنهضتها.',
            'تمكين الطالب فكريًا وروحيًا في مختلف جوانب حياته.',
            'خلق بيئة آمنة داخل الجامعات تحمي من الفتن وتغذي النفس والعقل.',
            'تمكين الطالب في جميع جوانب حياته الأكاديمية، النفسية، والاجتماعية.'
          ].map((goal, index) => (
            <Card key={index} delay={index * 100}>
              <div className="flex items-start space-x-reverse space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-[#7c393e] text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </div>
                <p className="text-gray-700 leading-relaxed">{goal}</p>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      {/* Values Section */}
      <Section id="values" title="قيمنا ومبادئنا">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {[
            'الفهم الصحيح للدين',
            'الإخلاص والعمل لله',
            'التضحية: نسعى بكل ما نملك لنهضة أمتنا',
            'الصحبة الصالحة',
            'العمل الجماعي المنظم',
            'الإتقان والمسؤولية',
            'بث روح الأمة الواحدة',
            'شمولية الإسلام: نؤمن بأن الإسلام منهج حياة كامل'
          ].map((value, index) => (
            <Card key={index} delay={index * 100}>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[#7c393e] to-[#c68f4f] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">{index + 1}</span>
                </div>
                <h3 className="text-[#7c393e] font-semibold text-lg mb-2">
                  {value.split(':')[0]}
                </h3>
                {value.includes(':') && (
                  <p className="text-gray-600 text-sm">
                    {value.split(':')[1].trim()}
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>
      </Section>
      </main>

      <Footer />
    </>
  );
}

export default App;