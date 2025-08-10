import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Programs: React.FC = () => {
    // State to track which program's gallery is expanded
    const [expandedGallery, setExpandedGallery] = useState<number | null>(null);

    // Program data
    const programs = [
        {
            id: 1,
            name: "الديوانيه",
            description: "جلسات حوارية أسبوعية للطلاب لمناقشة القضايا المختلفة والتواصل الاجتماعي، مع استضافة شخصيات من مجالات مختلفة للحديث عن تجاربهم وتقديم النصائح",
            images: [
                "/images/programs/diwaniya-1.jpg",
                "/images/programs/diwaniya-2.jpg",
                "/images/programs/diwaniya-3.jpg",
            ]
        },
        {
            id: 2,
            name: "حفظ القرآن",
            description: "برنامج منظم لحفظ القرآن الكريم، يشمل حلقات أسبوعية للتلاوة والمراجعة بإشراف مدرسين مؤهلين، مع مسابقات دورية لتشجيع الحفظ",
            images: [
                "/images/programs/quran-1.jpg",
                "/images/programs/quran-2.jpg",
            ]
        },
        {
            id: 3,
            name: "أحكام التجويد",
            description: "دورات متخصصة في أحكام تجويد القرآن الكريم لتحسين التلاوة وتطبيق أحكام التجويد بشكل صحيح، مع شهادات للمتميزين",
            images: [
                "/images/programs/tajweed-1.jpg",
                "/images/programs/tajweed-2.jpg",
            ]
        },
        {
            id: 4,
            name: "الدروس الشهريه",
            description: "محاضرات ودروس شهرية في مواضيع متنوعة تهم الطلاب، تشمل جوانب علمية وثقافية وتوعوية وإيمانية، يقدمها مختصون في المجالات المختلفة",
            images: [
                "/images/programs/monthly-1.jpg",
                "/images/programs/monthly-2.jpg",
                "/images/programs/monthly-3.jpg",
            ]
        },
        {
            id: 5,
            name: "الأنشطة",
            description: "مجموعة متنوعة من الأنشطة الرياضية والثقافية والترفيهية والرحلات، تهدف إلى تعزيز الروابط بين الطلاب وتنمية مهاراتهم في مختلف المجالات",
            images: [
                "/images/programs/activities-1.jpg",
                "/images/programs/activities-2.jpg",
                "/images/programs/activities-3.jpg",
                "/images/programs/activities-4.jpg",
            ]
        },
    ];

    // Toggle gallery expansion
    const toggleGallery = (id: number) => {
        if (expandedGallery === id) {
            setExpandedGallery(null);
        } else {
            setExpandedGallery(id);
        }
    };

    return (
        <div className="min-h-screen bg-white" dir="rtl">
            <Header />
            
            {/* Hero Section */}
            <div className="pt-32 pb-16 bg-gradient-to-b from-[#7c393e]/90 to-[#7c393e]/70">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center text-white">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">صفحة البرامج</h1>
                        <p className="text-xl max-w-3xl mx-auto">
                            تقدم مبادرة صحوة مجموعة متنوعة من البرامج والأنشطة لخدمة الطلبة وتنمية مهاراتهم
                        </p>
                    </div>
                </div>
            </div>
            
            {/* Programs Section */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-[#7c393e]">برامجنا</h2>
                        <p className="mt-4 text-lg text-gray-600">
                            تعرف على البرامج التي نقدمها للطلبة
                        </p>
                    </div>
                    
                    <div className="space-y-12">
                        {programs.map((program) => (
                            <div key={program.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
                                <div className="p-6 md:p-8">
                                    <h3 className="text-2xl font-bold text-[#7c393e] mb-4">{program.name}</h3>
                                    <p className="text-gray-700 mb-6">{program.description}</p>
                                    
                                    {program.images && program.images.length > 0 && (
                                        <div>
                                            <button 
                                                onClick={() => toggleGallery(program.id)}
                                                className="flex items-center text-[#c68f4f] font-semibold hover:text-[#c68f4f]/80 transition-colors"
                                            >
                                                {expandedGallery === program.id ? (
                                                    <>
                                                        <span>إخفاء الصور</span>
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                                                        </svg>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span>عرض الصور</span>
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                        </svg>
                                                    </>
                                                )}
                                            </button>
                                            
                                            {expandedGallery === program.id && (
                                                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                                    {program.images.map((_, index) => (
                                                        <div key={index} className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg overflow-hidden">
                                                            <div className="h-48 bg-gray-200 rounded flex items-center justify-center">
                                                                {/* Use a placeholder with the program name since we don't have actual images */}
                                                                <div className="text-center p-4">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                    </svg>
                                                                    <p className="mt-2 text-sm text-gray-600">صورة {program.name} {index + 1}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            
            {/* Join Program Section */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                        <div className="p-8 md:p-12">
                            <div className="text-center">
                                <h2 className="text-3xl font-bold text-[#7c393e] mb-4">انضم لبرامجنا</h2>
                                <p className="text-lg text-gray-600 mb-8">
                                    يمكنك الانضمام للبرامج التي تناسب اهتماماتك والاستفادة من الفرص المتاحة
                                </p>
                                <button className="px-8 py-3 bg-[#7c393e] text-white font-bold rounded-md hover:bg-[#7c393e]/90 transition-colors">
                                    سجل الآن
                                </button>
                            </div>
                        </div>
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
                        {/* Upcoming Program 1 */}
                        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
                            <div className="h-48 bg-gray-100 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div className="p-6">
                                <div className="text-[#c68f4f] font-semibold text-sm mb-2">15 سبتمبر 2025</div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">ملتقى الخريجين السنوي</h3>
                                <p className="text-gray-600 mb-4">
                                    لقاء سنوي يجمع خريجي المبادرة لتبادل الخبرات والتجارب ومناقشة فرص التعاون المستقبلية
                                </p>
                                <button className="text-[#7c393e] font-semibold hover:text-[#7c393e]/80 transition-colors">
                                    التفاصيل والتسجيل &larr;
                                </button>
                            </div>
                        </div>
                        
                        {/* Upcoming Program 2 */}
                        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
                            <div className="h-48 bg-gray-100 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <div className="p-6">
                                <div className="text-[#c68f4f] font-semibold text-sm mb-2">1 أكتوبر 2025</div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">مسابقة حفظ القرآن</h3>
                                <p className="text-gray-600 mb-4">
                                    مسابقة سنوية لحفظ القرآن الكريم بجوائز قيمة للفائزين، تحفيزا للطلاب على الاهتمام بحفظ القرآن
                                </p>
                                <button className="text-[#7c393e] font-semibold hover:text-[#7c393e]/80 transition-colors">
                                    التفاصيل والتسجيل &larr;
                                </button>
                            </div>
                        </div>
                        
                        {/* Upcoming Program 3 */}
                        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
                            <div className="h-48 bg-gray-100 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <div className="p-6">
                                <div className="text-[#c68f4f] font-semibold text-sm mb-2">20 نوفمبر 2025</div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">المخيم الشتوي</h3>
                                <p className="text-gray-600 mb-4">
                                    مخيم ترفيهي تعليمي يجمع الطلاب في أجواء شتوية مميزة، مع برنامج متكامل من الأنشطة والفعاليات
                                </p>
                                <button className="text-[#7c393e] font-semibold hover:text-[#7c393e]/80 transition-colors">
                                    التفاصيل والتسجيل &larr;
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            
            <Footer />
        </div>
    );
};

export default Programs;
