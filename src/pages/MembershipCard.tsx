import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Hero from '../components/Hero';

const MembershipCardPage: React.FC = () => {
    const [isFlipped, setIsFlipped] = useState(false);

    const handleCardClick = () => {
        setIsFlipped(!isFlipped);
    };

    return (
        <div className="min-h-screen bg-white" dir="rtl">
            <Header />

            <Hero
                title="بطاقة انتساب صحوة"
                description="احصل على بطاقة الانتساب الرسمية لمبادرة صحوة واستمتع بالمزايا الحصرية"

            />

            {/* Main Content */}
            <section className="py-16 md:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Card Introduction */}
                    <div className="max-w-4xl mx-auto text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-[#7c393e] mb-6">كرت منتسب صحوة</h2>
                        <p className="text-lg text-gray-700 leading-relaxed">
                            بطاقة الانتساب الرسمية لمبادرة صحوة تُمنح للمتطوعين المتميزين الذين أثبتوا التزامهم ومسؤوليتهم العالية.
                            هذه البطاقة هي رمز تقدير واعتراف بجهودكم المستمرة في خدمة المجتمع.
                        </p>
                    </div>

                    {/* Card Visual Display */}
                    <div className="max-w-6xl mx-auto mb-20">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            {/* Card Visual with Flip Effect */}
                            <div className="flex justify-center">
                                <div className="relative w-96 h-60 perspective-1000">
                                    {/* Card Container with Flip */}
                                    <div
                                        className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d group cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}
                                        onClick={handleCardClick}
                                    >
                                        {/* Front Side */}
                                        <div className="absolute inset-0 backface-hidden">
                                            <div className="w-full h-full bg-gradient-to-br from-[#7c393e] via-[#8b4346] to-[#7c393e] rounded-2xl shadow-2xl p-6 relative overflow-hidden">
                                                {/* Background Pattern */}
                                                <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-5 rounded-full -mr-12 -mt-12"></div>
                                                <div className="absolute bottom-0 left-0 w-20 h-20 bg-white opacity-5 rounded-full -ml-10 -mb-10"></div>
                                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full"></div>

                                                {/* Card Header with Logo */}
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h3 className="text-white font-bold text-xl">كرت منتسب</h3>
                                                        <p className="text-[#c68f4f] text-sm font-medium">مبادرة صحوة</p>
                                                    </div>
                                                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                                        {/* Sahwa Logo Placeholder */}
                                                        <div className="w-8 h-8 bg-white/80 rounded-lg flex items-center justify-center">
                                                            <span className="text-[#7c393e] text-xs font-bold">صحوة</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Member Info */}
                                                <div className="flex items-center mb-3">
                                                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full border-2 border-white/30 overflow-hidden">
                                                        {/* Profile Photo Placeholder */}
                                                        <div className="w-full h-full bg-gradient-to-br from-white/30 to-white/10 flex items-center justify-center">
                                                            <svg className="w-6 h-6 text-white/70" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.5" />
                                                                <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                    <div className="mr-3">
                                                        <p className="text-white font-bold text-base">منتسب صحوة</p>
                                                        <p className="text-white/80 text-xs">Sahwa Member</p>
                                                        <p className="text-[#c68f4f] text-xs">رقم العضوية: SAH-2025-001</p>
                                                    </div>
                                                </div>

                                                {/* Card Footer with QR */}
                                                <div className="absolute bottom-4 left-4 right-4 flex justify-end items-end">
                                                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                                                        <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center">
                                                            <div className="w-6 h-6 grid grid-cols-3 gap-0.5">
                                                                {[...Array(9)].map((_, i) => (
                                                                    <div key={i} className={`w-full h-full ${Math.random() > 0.5 ? 'bg-[#7c393e]' : 'bg-gray-300'} rounded-sm`}></div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Click Indicator */}
                                                <div className="absolute top-2 left-2 opacity-70 transition-opacity duration-300">
                                                    <div className="bg-white/20 backdrop-blur-sm rounded-full px-2 py-1">
                                                        <span className="text-white text-xs">اضغط للخلف</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Back Side */}
                                        <div className="absolute inset-0 rotate-y-180 backface-hidden">
                                            <div className="w-full h-full bg-gradient-to-br from-[#7c393e] via-[#8b4346] to-[#7c393e] rounded-2xl shadow-2xl p-6 relative overflow-hidden">
                                                {/* Background Pattern */}
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16"></div>
                                                <div className="absolute bottom-0 left-0 w-28 h-28 bg-white opacity-5 rounded-full -ml-14 -mb-14"></div>
                                                <div className="absolute top-1/3 left-1/3 w-20 h-20 bg-gradient-to-br from-white/5 to-transparent rounded-full"></div>

                                                {/* Header */}
                                                <div className="text-center mb-3">
                                                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mx-auto mb-3 flex items-center justify-center">
                                                        <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" fill="currentColor" />
                                                        </svg>
                                                    </div>
                                                    <h3 className="text-white font-bold text-lg mb-2">شكراً لك</h3>
                                                </div>

                                                {/* Thank You Message */}
                                                <div className="text-center space-y-1">
                                                    <p className="text-white text-sm leading-relaxed font-medium">
                                                        نشكركم من أعماق قلوبنا على تطوعكم الرائع معنا
                                                    </p>
                                                    <p className="text-[#c68f4f] text-xs leading-relaxed">
                                                        جهودكم المخلصة تضيء طريق الخير وتنشر الأمل في مجتمعنا
                                                    </p>
                                                    <p className="text-center text-white/70 text-xs italic">
                                                        "وَمَن تَطَوَّعَ خَيْراً فَإِنَّ اللَّهَ شَاكِرٌ عَلِيمٌ"
                                                    </p>
                                                    <p className="text-white/80 text-xs leading-relaxed">
                                                        بارك الله فيكم وجزاكم خير الجزاء
                                                    </p>
                                                </div>

                                                {/* Click Indicator */}
                                                <div className="absolute top-2 left-2 opacity-70 transition-opacity duration-300">
                                                    <div className="bg-white/20 backdrop-blur-sm rounded-full px-2 py-1">
                                                        <span className="text-white text-xs">اضغط للأمام</span>
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Card Info */}
                            <div className="space-y-6">
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-2xl font-bold text-[#7c393e]">مزايا كرت المنتسب</h3>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-start group">
                                            <div className="w-10 h-10 bg-[#7c393e] rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                                                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 mb-1">خصومات حصرية</h4>
                                                <p className="text-gray-600 text-sm">خصومات مميزة من مطاعم ومتاجر معينة متعاونة مع المبادرة</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start group">
                                            <div className="w-10 h-10 bg-[#7c393e] rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                                                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 mb-1">حضور مجاني للفعاليات</h4>
                                                <p className="text-gray-600 text-sm">دخول مجاني لجميع فعاليات وبرامج مبادرة صحوة</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start group">
                                            <div className="w-10 h-10 bg-[#7c393e] rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                                                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 mb-1">ملف شخصي رقمي</h4>
                                                <p className="text-gray-600 text-sm">رمز QR يعرض الاسم والصورة والمشاركات والتفاعلات وكل ما يخصك</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* How to Get the Card */}
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-12">
                            <h3 className="text-3xl font-bold text-[#7c393e] mb-4">شروط وآلية الحصول على كرت الانتساب</h3>
                            <p className="text-lg text-gray-600">المتطلبات الأساسية للحصول على بطاقة العضوية المتميزة</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                            <div className="group">
                                <div className="bg-gradient-to-br from-[#7c393e]/5 to-[#7c393e]/10 p-6 rounded-2xl border border-[#7c393e]/10 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 h-full">
                                    <div className="w-14 h-14 bg-[#7c393e] rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                                        <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                                        </svg>
                                    </div>
                                    <h4 className="text-lg font-bold text-[#7c393e] mb-3 text-center">الالتزام والمواظبة</h4>
                                    <p className="text-gray-600 text-center text-sm leading-relaxed">المواظبة على الحضور والمشاركة في فعاليات وأنشطة صحوة بشكل مستمر</p>
                                </div>
                            </div>

                            <div className="group">
                                <div className="bg-gradient-to-br from-[#7c393e]/5 to-[#7c393e]/10 p-6 rounded-2xl border border-[#7c393e]/10 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 h-full">
                                    <div className="w-14 h-14 bg-[#7c393e] rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                                        <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" stroke="currentColor" strokeWidth="2" fill="currentColor" />
                                        </svg>
                                    </div>
                                    <h4 className="text-lg font-bold text-[#7c393e] mb-3 text-center">التميز في الأداء</h4>
                                    <p className="text-gray-600 text-center text-sm leading-relaxed">إظهار مبادرة وإبداع في العمل والتميز في تنفيذ المهام والأنشطة</p>
                                </div>
                            </div>

                            <div className="group">
                                <div className="bg-gradient-to-br from-[#7c393e]/5 to-[#7c393e]/10 p-6 rounded-2xl border border-[#7c393e]/10 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 h-full">
                                    <div className="w-14 h-14 bg-[#7c393e] rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                                        <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" />
                                            <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
                                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="2" />
                                            <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" />
                                        </svg>
                                    </div>
                                    <h4 className="text-lg font-bold text-[#7c393e] mb-3 text-center">الروح التطوعية</h4>
                                    <p className="text-gray-600 text-center text-sm leading-relaxed">التعاون مع الفريق والعمل بروح إيجابية ونشر قيم التطوع</p>
                                </div>
                            </div>

                            <div className="group">
                                <div className="bg-gradient-to-br from-[#7c393e]/5 to-[#7c393e]/10 p-6 rounded-2xl border border-[#7c393e]/10 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 h-full">
                                    <div className="w-14 h-14 bg-[#7c393e] rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                                        <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" />
                                            <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" />
                                            <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" />
                                            <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2" />
                                        </svg>
                                    </div>
                                    <h4 className="text-lg font-bold text-[#7c393e] mb-3 text-center">الاستمرارية</h4>
                                    <p className="text-gray-600 text-center text-sm leading-relaxed">إكمال فترة زمنية لا تقل عن 3 شهور من التطوع المستمر والفعال</p>
                                </div>
                            </div>

                            <div className="group md:col-span-2 lg:col-span-1">
                                <div className="bg-gradient-to-br from-[#7c393e]/5 to-[#7c393e]/10 p-6 rounded-2xl border border-[#7c393e]/10 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 h-full md:mx-auto md:max-w-sm lg:mx-0 lg:max-w-none">
                                    <div className="w-14 h-14 bg-[#7c393e] rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                                        <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" stroke="currentColor" strokeWidth="2" />
                                        </svg>
                                    </div>
                                    <h4 className="text-lg font-bold text-[#7c393e] mb-3 text-center">الانضباط والالتزام</h4>
                                    <p className="text-gray-600 text-center text-sm leading-relaxed">الالتزام بالقواعد الداخلية لصحوة واحترام الوقت والتعليمات</p>
                                </div>
                            </div>
                        </div>



                        {/* Requirements Highlight */}
                        <div className="bg-gradient-to-r from-[#7c393e]/5 via-white to-[#7c393e]/5 p-8 rounded-2xl border border-[#7c393e]/20 mb-12">
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#7c393e] rounded-full mb-4">
                                    <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" fill="currentColor" />
                                    </svg>
                                </div>
                                <h4 className="text-2xl font-bold text-[#7c393e] mb-3">رسالة شكر وتقدير</h4>
                                <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                                    إلى أحبائنا المتطوعين الكرام لكم
                                    هذا الكرت رمز بسيط لمحبتنا وامتناننا، وندعو الله أن يجزيكم خير الجزاء في الدنيا والآخرة
                                    فالأجر الحقيقي عند الله تعالى في ميزان حسناتنا جميعاً.
                                </p>
                            </div>
                        </div>


                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default MembershipCardPage;
