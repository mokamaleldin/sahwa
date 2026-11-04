"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  Compass,
  GraduationCap,
  Heart,
  Handshake,
  Globe2,
  Leaf,
  Lightbulb,
  Sparkles,
} from "lucide-react";

const milestones = [
  {
    when: "2025",
    title: "بذرة الفكرة",
    detail:
      "بدأ التفكير في تكوين مجتمع طلابي يجمع بين الصحبة الصالحة والقرآن والأخوة والعمل النافع، ويتجاوز حدود اللقاءات العابرة إلى علاقة مستمرة بين الطلاب.",
  },
  {
    when: "9 ديسمبر 2025",
    title: "بداية التأسيس",
    detail:
      "أُنشئت أول مجموعة لصحوة، وبدأ التواصل بين الشباب وتشكيل النواة الأولى للفريق.",
  },
  {
    when: "12 ديسمبر 2025",
    title: "الإعلان الرسمي الأول",
    detail:
      "ظهر أول إعلان رسمي عن صحوة، لتبدأ رحلتها من فكرة بين مجموعة من الطلاب إلى مبادرة تسعى للوصول إلى عدد أكبر من الشباب.",
  },
  {
    when: "2026",
    title: "من الفكرة إلى العمل",
    detail:
      "بدأت صحوة تتوسع في أنشطتها وفعالياتها، وتبني فرقها داخل الجامعات، وتجمع متطوعين ومتطوعات يعملون في مجالات مختلفة.",
    extra:
      "تنوعت الأعمال بين اللقاءات والندوات والأنشطة الطلابية والرحلات والمبادرات التعليمية والاجتماعية، مع بناء علاقات وتعاون مع جهات طلابية أخرى.",
  },
  {
    when: "2026",
    title: "نمو صحوة وتطورها",
    detail:
      "امتد حضور صحوة إلى ثلاث جامعات رئيسية، وتطورت فرق الشباب والطالبات، وأعمال الإعلام والعلاقات العامة، وبدأ العمل على تطوير المنصة الإلكترونية والأدوات التي تخدم الطلاب والمتطوعين.",
    extra:
      "ومع هذا النمو، أصبحت صحوة أكثر من مجموعة تنظم فعاليات؛ أصبحت مجتمعًا طلابيًا يجمع أشخاصًا من جامعات وخلفيات مختلفة، يعملون معًا على رسالة واحدة.",
  },
];

const pillars = [
  {
    number: "01",
    title: "القرآن مرجعنا",
    icon: BookOpen,
    intro:
      "نسعى إلى أن يكون القرآن حاضرًا في تفكيرنا وقراراتنا ونظرتنا إلى الحياة، لا أن يقتصر حضوره على الدروس واللقاءات.",
    detail:
      "نتعلم كيف نفهمه ونتدبره بصورة صحيحة، ونرجع إلى أهل العلم فيما لا نعرف، ونستصحب هدايته في أخلاقنا وعلاقاتنا ودراستنا وعملنا ومسؤولياتنا.",
    clarification:
      "ولا يعني ذلك أن نستخرج كل العلوم والتخصصات من القرآن؛ بل أن نتعلم العلوم من مصادرها الصحيحة، ونستفيد من خبرات البشر وتجاربهم، مع المحافظة على مرجعيتنا وقيمنا.",
    closing:
      "فالغاية أن يسهم القرآن في بناء الإنسان الذي يعرف لماذا يعمل، وكيف يعمل، وما مسؤوليته تجاه الله والناس.",
  },
  {
    number: "02",
    title: "الصحبة الصالحة بيئتنا",
    icon: Heart,
    intro:
      "نسعى إلى بناء علاقات أخوية حقيقية بين الشباب، يجد فيها كل شخص من يعينه ويسانده ويشاركه الخير.",
    detail:
      "نريد صحبة لا تنتهي بانتهاء الفعالية أو الاجتماع، ولا تقوم فقط على التكليفات والمسؤوليات، بل تمتد إلى حياتنا وعلاقاتنا واهتماماتنا.",
    closing:
      "نريد أن يشعر كل فرد أنه جزء من عائلة، لا مجرد اسم في قائمة المتطوعين.",
  },
  {
    number: "03",
    title: "الأمة الواحدة هويتنا",
    icon: Globe2,
    intro:
      "نؤمن أن ما يجمعنا أكبر من اختلاف جنسياتنا ولغاتنا وخلفياتنا.",
    detail:
      "نسعى إلى تعزيز انتماء الشباب لأمتهم، وفهم قضاياها وتحدياتها، وبناء علاقات قائمة على الأخوة والتعاون والتكامل.",
    closing:
      "ونطمح إلى شباب يدركون أنهم جزء من أمة واحدة، وأن لكل منهم مسؤولية يستطيع القيام بها في موقعه ومجاله.",
  },
  {
    number: "04",
    title: "النفع والأثر غايتنا العملية",
    icon: Compass,
    intro:
      "لا نريد أن تبقى القيم والأفكار مجرد كلام، بل أن تتحول إلى أعمال ومشروعات ومبادرات تنفع الناس.",
    detail:
      "نسعى إلى مساعدة الشباب على اكتشاف قدراتهم، والتقدم في تخصصاتهم، واختيار مجالات يستطيعون من خلالها خدمة مجتمعاتهم وأمتهم.",
    clarification:
      "قد يكون أثر أحدهم في التعليم، وآخر في الطب، أو التقنية، أو الاقتصاد، أو الإعلام، أو غيرها من المجالات.",
    closing:
      "لا نريد أن نصنع نسخة واحدة من الشباب، بل أشخاصًا مختلفين تجمعهم المبادئ ويكمل بعضهم بعضًا.",
  },
];

const principles = [
  {
    name: "الإخلاص",
    icon: Sparkles,
    detail: "نعمل ابتغاء مرضاة الله، ونحرص على أن يكون نفع الناس أهم من الظهور والألقاب.",
  },
  {
    name: "الأخوة",
    icon: Heart,
    detail: "نتعامل باعتبارنا عائلة تجمعها رسالة واحدة، ونحافظ على علاقاتنا حتى خارج العمل والأنشطة.",
  },
  {
    name: "التعاون",
    icon: Handshake,
    detail: "نعمل معًا، ونتبادل الخبرات، ونساعد بعضنا على النجاح دون منافسة شخصية أو احتكار.",
  },
  {
    name: "المبادرة",
    icon: Lightbulb,
    detail: "لكل فرد فرصة أن يقدم فكرة ويبدأ مشروعًا ويشارك في صنع القرار المناسب لمسؤوليته.",
  },
  {
    name: "التعلم والتطور",
    icon: GraduationCap,
    detail: "نتعلم من تجاربنا وأخطائنا، ونستفيد من المعرفة والخبرات النافعة أينما وجدناها.",
  },
  {
    name: "الاستمرارية",
    icon: Leaf,
    detail: "نبني أعمالًا وعلاقات ومشروعات تستطيع الاستمرار بعد تخرجنا أو انتقال مسؤولياتنا.",
  },
];

const numbers = [
  { value: "61", label: "فعالية ونشاطًا" },
  { value: "نحو 90", label: "فردًا في عائلة صحوة" },
  { value: "3", label: "جامعات رئيسية تتمتع صحوة فيها باعتماد رسمي" },
  { value: "800+", label: "طالب في مجموعات صحوة الطلابية" },
  { value: "2025", label: "سنة تأسيس صحوة" },
];

const identityTabs = [
  { key: "about", label: "من نحن؟" },
  { key: "story", label: "قصتنا" },
  { key: "vision", label: "الرؤية والرسالة" },
  { key: "goals", label: "أهدافنا الأربعة" },
  { key: "principles", label: "مبادئنا" },
  { key: "community", label: "عائلة صحوة" },
  { key: "numbers", label: "صحوة بالأرقام" },
];

export default function GuideIdentity() {
  const [activeSection, setActiveSection] = useState("about");

  useEffect(() => {
    const syncSectionFromHash = () => {
      const hash = window.location.hash;
      if (hash === "#guide-identity") {
        setActiveSection("about");
        return;
      }
      const tab = identityTabs.find((item) => hash === `#guide-identity-${item.key}`);
      if (tab) setActiveSection(tab.key);
    };
    syncSectionFromHash();
    window.addEventListener("hashchange", syncSectionFromHash);
    return () => window.removeEventListener("hashchange", syncSectionFromHash);
  }, []);

  const changeSection = (key: string) => {
    setActiveSection(key);
    const hash = key === "about" ? "#guide-identity" : `#guide-identity-${key}`;
    window.history.replaceState(null, "", window.location.pathname + window.location.search + hash);
  };

  return (
    <section
      id="guide-identity"
      className="guide-identity"
      aria-labelledby="guide-identity-title"
    >
      <header className="guide-identity-chapter-heading">
        <span className="guide-identity-eyebrow">01 / هوية صحوة</span>
        <h2 id="guide-identity-title">تعرف على صحوة</h2>
        <p>اختر القسم الذي تريد قراءته، وسيظهر محتواه هنا دون عرض بقية الأقسام في نفس الصفحة.</p>
      </header>
      <div
        className="guide-identity-nav"
        role="tablist"
        aria-label="أقسام هوية صحوة"
        onKeyDown={(event) => {
          if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
          event.preventDefault();
          const currentIndex = identityTabs.findIndex((tab) => tab.key === activeSection);
          const nextIndex = event.key === "Home" ? 0
            : event.key === "End" ? identityTabs.length - 1
            : (currentIndex + (event.key === "ArrowLeft" ? 1 : -1) + identityTabs.length) % identityTabs.length;
          const next = identityTabs[nextIndex].key;
          changeSection(next);
          document.getElementById(`guide-identity-tab-${next}`)?.focus();
        }}
      >
        {identityTabs.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            id={`guide-identity-tab-${key}`}
            role="tab"
            aria-selected={activeSection === key}
            tabIndex={activeSection === key ? 0 : -1}
            aria-controls="guide-identity-tab-panel"
            className={`guide-identity-tab${activeSection === key ? " guide-identity-tab-selected" : ""}`}
            onClick={() => changeSection(key)}
          >
            {label}
          </button>
        ))}
      </div>
      <div
        id="guide-identity-tab-panel"
        role="tabpanel"
        tabIndex={0}
        aria-labelledby={`guide-identity-tab-${activeSection}`}
        className="guide-identity-tab-panel"
      >
        {activeSection === "about" && (
      <header className="guide-identity-hero">
        <div className="guide-identity-hero-decoration" aria-hidden="true">
          <span /><span /><span />
        </div>
        <div className="guide-identity-hero-content">
          <span className="guide-identity-eyebrow">من نحن؟</span>
          <h3 id="guide-identity-about-title">صحوة <em>من نحن؟</em></h3>
          <p className="guide-identity-hero-meta">
            مبادرة طلابية إسلامية تأسست عام 2025 في تركيا
          </p>
          <p>
            صحوة مبادرة يقودها طلاب وطالبات جمعهم هدف واحد:
            <strong> بناء بيئة متكاملة للشباب، داخل الجامعات وخارجها، تجمع بين القرآن والصحبة الصالحة والوعي والعمل النافع.</strong>
          </p>
          <p>
            نؤمن أن مرحلة الشباب ليست مجرد سنوات للدراسة والحصول على شهادة، بل مرحلة لبناء الإنسان وتشكيل وعيه وشخصيته وعلاقته بدينه وأمته ومجتمعه.
          </p>
          <p>
            ولهذا نسعى إلى بناء مجتمع يجد فيه الشاب الصحبة التي تعينه، والبيئة التي ينمو فيها، والفرص التي يكتشف من خلالها قدراته، ويتعلم كيف يكون نافعًا في المجال الذي يختاره.
          </p>
        </div>
      </header>
        )}



      {activeSection === "story" && (
      <section
        id="guide-identity-story"
        className="guide-identity-section"
        aria-labelledby="guide-identity-story-title"
      >
        <div className="guide-identity-heading">
          <span>البداية والمسار</span>
          <h3 id="guide-identity-story-title">قصتنا <i>كيف بدأت صحوة؟</i></h3>
        </div>
        <div className="guide-identity-story-intro">
          <p>
            بدأت صحوة من حاجة شعر بها مجموعة من الطلاب: الحاجة إلى بيئة تجمع الشباب على الخير، وتعينهم على الثبات والنمو، وتربطهم بالقرآن وببعضهم وبقضايا أمتهم.
          </p>
          <p>
            لم تبدأ صحوة بمؤسسة كبيرة أو إمكانات واسعة، وإنما بفكرة آمن بها طلاب أرادوا أن يصنعوا لأنفسهم ولغيرهم بيئة أفضل.
          </p>
        </div>
        <h4 className="guide-identity-timeline-label">محطات من تاريخ صحوة</h4>
        <ol className="guide-identity-timeline">
          {milestones.map((milestone, index) => (
            <li key={index}>
              <span className="guide-identity-timeline-point" aria-hidden="true" />
              <article>
                <time>{milestone.when}</time>
                <h5>{milestone.title}</h5>
                <p>{milestone.detail}</p>
                {milestone.extra && <p>{milestone.extra}</p>}
              </article>
            </li>
          ))}
        </ol>
      </section>
      )}

      {activeSection === "vision" && (
      <section
        id="guide-identity-vision"
        className="guide-identity-section"
        aria-labelledby="guide-identity-vision-title"
      >
        <div className="guide-identity-heading">
          <span>إلى أين نمضي؟</span>
          <h3 id="guide-identity-vision-title">رؤيتنا ورسالتنا</h3>
        </div>
        <div className="guide-identity-vision-grid">
          <article className="guide-identity-vision-card guide-identity-vision-card-primary">
            <span className="guide-identity-card-index">01 / الرؤية</span>
            <h4>رؤيتنا</h4>
            <p className="guide-identity-vision-lead">
              أن نبني بيئة شبابية إسلامية متكاملة، تنطلق من الجامعات وتمتد إلى خارجها، تسهم في إعداد شباب أقوياء في دينهم ووعيهم وتخصصاتهم، قادرين على تحمل مسؤولياتهم وصناعة أثر نافع في مجتمعاتهم وأمتهم.
            </p>
            <p>
              ولا يقتصر طموحنا على ما يُنجز داخل صحوة نفسها، بل نطمح أن يخرج من هذه البيئة طلاب وأصحاب تخصصات ومبادرات ومشروعات وقيادات نافعة في مجالات مختلفة.
            </p>
          </article>
          <article className="guide-identity-vision-card">
            <span className="guide-identity-card-index">02 / الرسالة</span>
            <h4>رسالتنا</h4>
            <p className="guide-identity-vision-lead">
              بناء مجتمع شبابي يجمع بين القرآن والصحبة الصالحة ومعنى الأمة الواحدة، من خلال البرامج والأنشطة والمبادرات والعلاقات التي تساعد الشباب على النمو علميًا وإيمانيًا واجتماعيًا، واكتشاف قدراتهم، وتحويل ما يتعلمونه إلى نفع وأثر حقيقي.
            </p>
          </article>
        </div>
      </section>
      )}

      {activeSection === "goals" && (
      <section
        id="guide-identity-goals"
        className="guide-identity-section"
        aria-labelledby="guide-identity-goals-title"
      >
        <div className="guide-identity-heading">
          <span>ما الذي يجمعنا؟</span>
          <h3 id="guide-identity-goals-title">أهدافنا الأربعة</h3>
          <p>أربعة معانٍ تشكّل مرجعيتنا وبيئتنا وهويتنا وغايتنا العملية.</p>
        </div>
        <div className="guide-identity-goal-grid">
          {pillars.map(({ number, title, icon: Icon, intro, detail, clarification, closing }) => (
            <article className="guide-identity-goal" key={number}>
              <div className="guide-identity-goal-top">
                <span className="guide-identity-goal-icon"><Icon size={25} strokeWidth={1.7} aria-hidden="true" /></span>
                <span className="guide-identity-goal-number">{number}</span>
              </div>
              <h4>{title}</h4>
              <p>{intro}</p>
              <p>{detail}</p>
              {clarification && <p>{clarification}</p>}
              <div className="guide-identity-goal-closing">{closing}</div>
            </article>
          ))}
        </div>
      </section>
      )}

      {activeSection === "principles" && (
      <section
        id="guide-identity-principles"
        className="guide-identity-section"
        aria-labelledby="guide-identity-principles-title"
      >
        <div className="guide-identity-heading">
          <span>كيف نعمل ونتعامل؟</span>
          <h3 id="guide-identity-principles-title">مبادئنا العامة</h3>
        </div>
        <div className="guide-identity-principles">
          {principles.map(({ name, icon: Icon, detail }) => (
            <article key={name} className="guide-identity-principle">
              <span className="guide-identity-principle-icon"><Icon size={20} strokeWidth={1.8} aria-hidden="true" /></span>
              <div>
                <h4>{name}</h4>
                <p>{detail}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
      )}

      {activeSection === "community" && (
      <section
        id="guide-identity-community"
        className="guide-identity-section guide-identity-community"
        aria-labelledby="guide-identity-community-title"
      >
        <div className="guide-identity-community-body">
          <span className="guide-identity-eyebrow">لك مكان بيننا</span>
          <h3 id="guide-identity-community-title">ماذا يعني أن تكون جزءًا من صحوة؟</h3>
          <strong>بانضمامك إلى صحوة، تصبح جزءًا من عائلتنا.</strong>
          <p>
            هنا تجد طلابًا يشبهونك في طموحاتهم وتحدياتهم، يتعلمون ويخطئون ويتطورون، ويعين بعضهم بعضًا على الخير، ويكونون لك عونًا وصحبةً وأخوة.
          </p>
          <p>
            يمكنك أن تشارك في نشاط، أو تقترح فكرة، أو تتعلم مهارة، أو تنضم إلى فريق، أو تقود مشروعًا يناسب اهتماماتك وقدراتك.
          </p>
          <p>
            ونريد أن تبقى علاقتك بصحوة ممتدة؛ لأن ما يجمعنا أكبر من مجرد العمل، فنحن عائلة.
          </p>
          <div className="guide-identity-community-last">
            نحن لا نبني فريق عمل فقط، بل نبني بيئة نتعلم وننمو فيها معًا، وننطلق منها لنصنع أثرًا سويًا في كل مكان تصل إليه أيدينا.
          </div>
        </div>
      </section>
      )}

      {activeSection === "numbers" && (
      <section
        id="guide-identity-numbers"
        className="guide-identity-section guide-identity-statistics"
        aria-labelledby="guide-identity-numbers-title"
      >
        <div className="guide-identity-heading guide-identity-heading-center">
          <span>أثر يتسع</span>
          <h3 id="guide-identity-numbers-title">صحوة بالأرقام</h3>
          <p>حصيلة المبادرة حتى إعداد هذا التعريف.</p>
        </div>
        <div className="guide-identity-stats-grid">
          {numbers.map(({ value, label }) => (
            <div className="guide-identity-stat" key={label}>
              <strong dir="auto">{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>
      )}

      {activeSection === "numbers" && (
      <footer className="guide-identity-closing">
        <span>صحوة في كلمات</span>
        <div className="guide-identity-motto">
          <strong>القرآن مرجعنا.</strong>
          <strong>الصحبة الصالحة بيئتنا.</strong>
          <strong>الأمة الواحدة هويتنا.</strong>
          <strong>والنفع والأثر غايتنا العملية.</strong>
        </div>
        <p>
          نبني الإنسان بالقرآن والصحبة ومعنى الأمة، ثم نساعده أن يعرف مسؤوليته ومجاله ويصنع أثره.
        </p>
      </footer>
      )}
      </div>
    </section>
  );
}
