import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Hero from '../components/Hero';

const MembershipCardPage: React.FC = () => {
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
                            {/* Card Visual */}
                            <div className="flex justify-center">
                                <div className="w-96 h-60 bg-gradient-to-br from-[#7c393e] via-[#8b4346] to-[#7c393e] rounded-2xl shadow-2xl p-6 relative overflow-hidden transform hover:scale-105 transition-all duration-500">
                                    {/* Background Pattern */}
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-5 rounded-full -mr-12 -mt-12"></div>
                                    <div className="absolute bottom-0 left-0 w-20 h-20 bg-white opacity-5 rounded-full -ml-10 -mb-10"></div>
                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full"></div>

                                    {/* Card Header */}
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h3 className="text-white font-bold text-xl">كرت منتسب</h3>
                                            <p className="text-[#c68f4f] text-sm font-medium">مبادرة صحوة</p>
                                        </div>
                                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <rect x="3" y="4" width="18" height="13" rx="2" fill="currentColor" opacity="0.9" />
                                                <circle cx="8" cy="8" r="1" fill="white" />
                                                <path d="M6 12h4" stroke="white" strokeWidth="0.6" strokeLinecap="round" />
                                                <path d="M6 14h6" stroke="white" strokeWidth="0.6" strokeLinecap="round" />
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Member Info */}
                                    <div className="flex items-center">
                                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full border-2 border-white/30"></div>
                                        <div className="mr-4">
                                            <p className="text-white font-bold text-lg">اسم المنتسب</p>
                                            <p className="text-[#c68f4f] text-sm">رقم العضوية: SAH-2025-001</p>
                                        </div>
                                    </div>

                                    {/* Card Footer */}
                                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                                        <div>
                                            <p className="text-white/80 text-xs">تاريخ الإصدار</p>
                                            <p className="text-white text-sm font-medium">أغسطس ٢٠٢٥</p>
                                        </div>
                                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                            <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center">
                                                <span className="text-[#7c393e] text-xs font-bold">QR</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Card Info */}
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-2xl font-bold text-[#7c393e] mb-4">مزايا كرت المنتسب</h3>
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
                            <h3 className="text-3xl font-bold text-[#7c393e] mb-4">كيفية الحصول على كرت المنتسب</h3>
                            <p className="text-lg text-gray-600">خطوات بسيطة للحصول على بطاقة الانتساب الرسمية</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                            <div className="group">
                                <div className="bg-gradient-to-br from-[#7c393e]/5 to-[#7c393e]/10 p-8 rounded-2xl border border-[#7c393e]/10 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                                    <div className="w-16 h-16 bg-[#7c393e] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                                        <span className="text-white font-bold text-2xl">١</span>
                                    </div>
                                    <h4 className="text-xl font-bold text-[#7c393e] mb-4 text-center">التطوع والمشاركة</h4>
                                    <p className="text-gray-600 text-center leading-relaxed">المشاركة الفعالة في أنشطة المبادرة وإظهار الالتزام المستمر في جميع البرامج والفعاليات</p>
                                </div>
                            </div>

                            <div className="group">
                                <div className="bg-gradient-to-br from-[#7c393e]/5 to-[#7c393e]/10 p-8 rounded-2xl border border-[#7c393e]/10 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                                    <div className="w-16 h-16 bg-[#7c393e] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                                        <span className="text-white font-bold text-2xl">٢</span>
                                    </div>
                                    <h4 className="text-xl font-bold text-[#7c393e] mb-4 text-center">تقييم المشارك</h4>
                                    <p className="text-gray-600 text-center leading-relaxed">يتم تقييم مستوى التفاعل والاستمرارية وإثبات مستوى عالي من المسؤولية والالتزام</p>
                                </div>
                            </div>

                            <div className="group">
                                <div className="bg-gradient-to-br from-[#7c393e]/5 to-[#7c393e]/10 p-8 rounded-2xl border border-[#7c393e]/10 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                                    <div className="w-16 h-16 bg-[#7c393e] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                                        <span className="text-white font-bold text-2xl">٣</span>
                                    </div>
                                    <h4 className="text-xl font-bold text-[#7c393e] mb-4 text-center">إصدار الكرت</h4>
                                    <p className="text-gray-600 text-center leading-relaxed">بعد فترة من شهر إلى أربعة أشهر، يتم إصدار الكرت وتسليمه خلال احتفالية خاصة</p>
                                </div>
                            </div>
                        </div>

                        {/* Requirements Highlight */}
                        <div className="bg-gradient-to-r from-[#7c393e]/5 via-white to-[#7c393e]/5 p-8 rounded-2xl border border-[#7c393e]/20 mb-12">
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#7c393e] rounded-full mb-4">
                                    <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                                    </svg>
                                </div>
                                <h4 className="text-2xl font-bold text-[#7c393e] mb-3">فترة الحصول على الكرت</h4>
                                <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                                    <span className="font-semibold text-[#7c393e]">من شهر إلى أربعة أشهر</span> من التطوع المستمر والمشاركة الفعالة،
                                    مع إثبات مستوى عالي من المسؤولية والالتزام في جميع الأنشطة والبرامج.
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
