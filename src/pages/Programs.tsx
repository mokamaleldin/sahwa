import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Hero from '../components/Hero';

const Programs: React.FC = () => {
    // Program data
    const programs = [
        {
            id: 1,
            name: "الديوانيه",
            description: "جلسات حوارية أسبوعية للطلاب لمناقشة القضايا المختلفة والتواصل الاجتماعي، مع استضافة شخصيات من مجالات مختلفة للحديث عن تجاربهم وتقديم النصائح"
        },
        {
            id: 2,
            name: "حفظ القرآن",
            description: "برنامج منظم لحفظ القرآن الكريم، يشمل حلقات أسبوعية للتلاوة والمراجعة بإشراف مدرسين مؤهلين، مع مسابقات دورية لتشجيع الحفظ"
        },
        {
            id: 3,
            name: "أحكام التجويد",
            description: "دورات متخصصة في أحكام تجويد القرآن الكريم لتحسين التلاوة وتطبيق أحكام التجويد بشكل صحيح، مع شهادات للمتميزين"
        },
        {
            id: 4,
            name: "الدروس الشهريه",
            description: "محاضرات ودروس شهرية في مواضيع متنوعة تهم الطلاب، تشمل جوانب علمية وثقافية وتوعوية وإيمانية، يقدمها مختصون في المجالات المختلفة"
        },
        {
            id: 5,
            name: "الأنشطة",
            description: "مجموعة متنوعة من الأنشطة الرياضية والثقافية والترفيهية والرحلات، تهدف إلى تعزيز الروابط بين الطلاب وتنمية مهاراتهم في مختلف المجالات"
        },
    ];

    // Upcoming programs data (rendered like programs)
    const upcomingPrograms = [
        {
            id: 6,
            name: "برنامج الخريجين",
            subtitle: "قريباً",
            description: "تنظيم جديد يهدف إلى ربط خريجي المبادرة وتبادل الخبرات والتجارب المهنية والأكاديمية، وإقامة شبكة دعم قوية بين الخريجين"
        },
        {
            id: 7,
            name: "صحوة الطلاب الثانوية",
            subtitle: "قريباً",
            description: "برنامج مخصص لطلاب المدارس الثانوية الذين لم يدخلوا الجامعة بعد، يهدف إلى تهيئتهم للحياة الجامعية وتنمية مهاراتهم القيادية والفكرية"
        },

    ];

    return (
        <div className="min-h-screen bg-white" dir="rtl">
            <Header />

            <Hero
                title="البرامج"
                description="تقدم مبادرة صحوة مجموعة متنوعة من البرامج والأنشطة لخدمة الطلبة وتنمية مهاراتهم
"
            />

            
            {/* Programs Section */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-[#7c393e]">برامجنا</h2>
                        <p className="mt-4 text-lg text-gray-600">
                            تعرف على البرامج التي نقدمها للطلبة
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {programs.map((program) => (
                            <div
                                key={program.id}
                                className="group bg-white rounded-2xl shadow-lg p-6 border border-gray-100 transform-gpu hover:scale-[1.03] hover:shadow-2xl transition-all duration-300 ease-out"
                            >
                                <div className="text-center">
                                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#7c393e] to-[#c68f4f] rounded-full flex items-center justify-center ring-1 ring-[#7c393e]/10 transition-transform duration-500 group-hover:scale-105">
                                        <svg className="w-8 h-8 text-white transform transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <rect x="3" y="6" width="18" height="12" rx="2" fill="currentColor" opacity="0.95" />
                                            <path d="M7 9h10" stroke="rgba(255,255,255,0.85)" strokeWidth="1.6" strokeLinecap="round" />
                                            <path d="M7 13h8" stroke="rgba(255,255,255,0.85)" strokeWidth="1.6" strokeLinecap="round" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl md:text-2xl font-extrabold text-[#7c393e] mb-3">{program.name}</h3>
                                    <p className="text-gray-700 leading-relaxed text-sm md:text-base">{program.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            

            
            {/* Upcoming Programs Section */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-[#7c393e]">البرامج القادمة</h2>
                        <p className="mt-4 text-lg text-gray-600">
                            تعرف على أحدث البرامج والفعاليات المخطط لها في الفترة القادمة
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {upcomingPrograms.map((p) => (
                            <div key={p.id} className="group bg-white rounded-2xl shadow-lg p-6 border border-gray-100 transform-gpu hover:scale-[1.03] hover:shadow-2xl transition-all duration-300 ease-out">
                                <div className="text-center">
                                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#7c393e] to-[#c68f4f] rounded-full flex items-center justify-center ring-1 ring-[#7c393e]/10 transition-transform duration-500 group-hover:scale-105">
                                        <svg className="w-8 h-8 text-white transform transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <rect x="3" y="6" width="18" height="12" rx="2" fill="currentColor" opacity="0.95" />
                                            <path d="M7 9h10" stroke="rgba(255,255,255,0.85)" strokeWidth="1.6" strokeLinecap="round" />
                                            <path d="M7 13h8" stroke="rgba(255,255,255,0.85)" strokeWidth="1.6" strokeLinecap="round" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl md:text-2xl font-extrabold text-[#7c393e] mb-3">{p.name}</h3>
                                    <p className="text-gray-700 leading-relaxed text-sm md:text-base">{p.description}</p>
                                </div>
                                <div className="mt-4 flex items-center justify-between">
                                    <div className="text-[#7c393e] font-semibold text-sm">{p.subtitle === 'قريباً' ? 'سيتم الإعلان عن التفاصيل قريباً' : p.subtitle}</div>
                                    <span className="text-xs bg-[#c68f4f]/10 text-[#c68f4f] px-3 py-1 rounded-full font-semibold">{p.subtitle}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            
            <Footer />
        </div>
    );
};

export default Programs;
