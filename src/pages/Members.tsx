import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Hero from '../components/Hero';

const MembersPage: React.FC = () => {
    // Sahwa volunteers (including those with responsibilities)
    const sahwaVolunteers = [
        { id: 2, name: "كاميليا اليوسف", photo: true },
        { id: 1, name: "يقين تامر", photo: true },
        { id: 5, name: "فاطمة الزهراء", photo: true },
        { id: 6, name: "حسن طه", photo: true },
        { id: 4, name: "عمرو السيد", photo: true },
        { id: 7, name: "عمر الجمل", photo: true },
        { id: 3, name: "محمد كمال الدين", photo: true },
        { id: 8, name: "خلود الكردي", photo: true },
        { id: 101, name: "البراء معمر", photo: true },
        { id: 102, name: "أنس محمد", photo: true },
        { id: 103, name: "عبدالله جامع", photo: true },
        { id: 104, name: "حماس تامر", photo: true },
        { id: 105, name: "جنة عبدربه", photo: true },
        { id: 106, name: "عنان عفيفي", photo: true },
        { id: 107, name: "آية رجوب", photo: true },
        { id: 108, name: "عفيف", photo: true },
        { id: 109, name: "فرحان", photo: true },
        { id: 110, name: "ماريا عقاد", photo: true },
        { id: 111, name: "عامر", photo: true },
        { id: 112, name: "رشا مجبور", photo: true },
        { id: 113, name: "وئام الغرباني", photo: true },
        { id: 114, name: "غني محمد", photo: true },
        { id: 115, name: "فلك الحُميدان", photo: true },
        { id: 116, name: "ايمن سليمان", photo: true },
        { id: 117, name: "حمدي النقيب", photo: true },
        { id: 118, name: "عزة الموصلي", photo: true },
        { id: 119, name: "سارة محمود", photo: true },
        { id: 120, name: "خديجه محمود", photo: true },
        { id: 121, name: "ساره عقاد", photo: true },
        { id: 122, name: "أسامه أبوشويشه", photo: true },
        { id: 123, name: "خالد مسلم", photo: true },
        { id: 124, name: "زياد خفاجي", photo: true },
        { id: 125, name: "عدنان النبري", photo: true },
        { id: 126, name: "جوان سليمان", photo: true },
        { id: 127, name: "جمانه أحمد", photo: true },
        { id: 128, name: "عبدالرحمن اكساكالي", photo: true },
        { id: 129, name: "ريان", photo: true },
        { id: 130, name: "أسامه خضر", photo: true },
        { id: 131, name: "عمرو ماهر", photo: true }
    ];

    // Istanbul University students
    const istanbulStudents = [
        { id: 302, name: "كاميليا اليوسف", photo: true, position: "مسؤولة الطالبات" },
        { id: 301, name: "يقين تامر", photo: true, position: "مسؤولة شؤون المتطوعين بنات" },
        { id: 303, name: "محمد كمال الدين", photo: true, position: "مسؤول الجامعة" },
        { id: 304, name: "عمرو السيد", photo: true, position: "مسؤول شؤون الطلاب" },
        { id: 305, name: "فاطمة الزهراء", photo: true, position: "مسؤولة الأنشطة بنات" },
        { id: 306, name: "حسن طه", photo: true, position: "مسؤول العلاقات العامة" },
        { id: 307, name: "عمر الجمل", photo: true, position: "مسؤول المتطوعين شباب" },
        { id: 308, name: "خلود الكردي", photo: true, position: "نائبة مسؤولة الأنشطة بنات" },
        { id: 309, name: "حماس تامر", photo: true },
        { id: 310, name: "جنة عبدربه", photo: true },
        { id: 311, name: "عنان عفيفي", photo: true },
        { id: 312, name: "آية رجوب", photo: true },
        { id: 313, name: "عامر", photo: true },
        { id: 314, name: "رشا مجبور", photo: true },
        { id: 315, name: "وئام الغرباني", photo: true },
        { id: 316, name: "غني محمد", photo: true },
        { id: 317, name: "فلك الحُميدان", photo: true },
        { id: 318, name: "ايمن سليمان", photo: true },
        { id: 319, name: "حمدي النقيب", photo: true },
        { id: 320, name: "عزة الموصلي", photo: true },
        { id: 321, name: "سارة محمود", photo: true },
        { id: 322, name: "خديجه محمود", photo: true }
    ];

    // Bilgi University students
    const bilgiStudents = [
        { id: 201, name: "البراء معمر", photo: true },
        { id: 202, name: "ساره عقاد", photo: true },
        { id: 203, name: "عبدالله جامع", photo: true },
        { id: 204, name: "أسامه أبوشويشه", photo: true },
        { id: 205, name: "خالد مسلم", photo: true },
        { id: 206, name: "زياد خفاجي", photo: true },
        { id: 207, name: "عدنان النبري", photo: true },
        { id: 208, name: "جوان سليمان", photo: true },
        { id: 209, name: "جمانه أحمد", photo: true },
        { id: 210, name: "عبدالرحمن اكساكالي", photo: true },
        { id: 211, name: "ريان", photo: true },
        { id: 212, name: "أسامه خضر", photo: true },
        { id: 213, name: "عمرو ماهر", photo: true },
        { id: 214, name: "ماريا عقاد", photo: true },
        { id: 215, name: "عفيف", photo: true }
    ];

    // Filter by section
    const [sectionFilter, setSectionFilter] = useState('sahwa');

    // Animation state
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Trigger animation after component mounts
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 300);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="min-h-screen bg-white" dir="rtl">
            <Header />

            <Hero
                title="الأعضاء"
                description="تعرّف على أعضاء مبادرة صحوة"
            />

            {/* Filter Controls */}
            <div className="bg-gray-50 py-6 border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-4">
                        <span className="text-gray-700 font-medium">عرض حسب:</span>
                        <div className="flex">
                            <button
                                className={`px-4 py-2 rounded-r-md ${sectionFilter === 'sahwa' ? 'bg-[#7c393e] text-white' : 'bg-white text-gray-700 border border-gray-300'}`}
                                onClick={() => setSectionFilter('sahwa')}
                            >
                                جميع المتطوعين
                            </button>
                            <button
                                className={`px-4 py-2 ${sectionFilter === 'istanbul' ? 'bg-[#7c393e] text-white' : 'bg-white text-gray-700 border-y border-gray-300'}`}
                                onClick={() => setSectionFilter('istanbul')}
                            >
                                جامعة استنيا
                            </button>
                            <button
                                className={`px-4 py-2 rounded-l-md ${sectionFilter === 'bilgi' ? 'bg-[#7c393e] text-white' : 'bg-white text-gray-700 border border-gray-300'}`}
                                onClick={() => setSectionFilter('bilgi')}
                            >
                                جامعة بلجي
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sahwa Volunteers */}
            {sectionFilter === 'sahwa' && (
                <section className="py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl font-bold text-[#7c393e] mb-8 text-center">جميع المتطوعين</h2>

                        <div className={`bg-white rounded-lg shadow-md p-6 transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                            }`}>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {sahwaVolunteers.map((member, index) => (
                                    <div
                                        key={member.id}
                                        className={`bg-gray-50 rounded-lg p-3 hover:shadow-lg hover:-translate-y-1 transition-all duration-500 ease-in-out text-center transform ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-95'
                                            }`}
                                        style={{
                                            transitionDelay: `${index * 50}ms`
                                        }}
                                    >
                                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#7c393e] to-[#8b4346] flex items-center justify-center overflow-hidden mx-auto mb-2 shadow-md hover:shadow-lg transition-shadow duration-300">
                                            <div className="w-full h-full flex items-center justify-center animate-pulse hover:animate-none">
                                                <svg viewBox="0 0 24 24" className="w-8 h-8 text-white transition-transform duration-300 hover:scale-110" fill="currentColor">
                                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <h5 className="font-semibold text-sm transition-colors duration-300 hover:text-[#7c393e]">{member.name}</h5>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Istanbul University */}
            {sectionFilter === 'istanbul' && (
                <section className="py-16 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl font-bold text-[#7c393e] mb-8 text-center">جامعة استنيا</h2>

                        <div className={`bg-white rounded-lg shadow-md p-6 transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                            }`}>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {istanbulStudents.map((member, index) => (
                                    <div
                                        key={member.id}
                                        className={`bg-gray-50 rounded-lg p-3 hover:shadow-lg hover:-translate-y-1 transition-all duration-500 ease-in-out text-center transform ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-95'
                                            }`}
                                        style={{
                                            transitionDelay: `${index * 50}ms`
                                        }}
                                    >
                                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#7c393e] to-[#8b4346] flex items-center justify-center overflow-hidden mx-auto mb-2 shadow-md hover:shadow-lg transition-shadow duration-300">
                                            <div className="w-full h-full flex items-center justify-center animate-pulse hover:animate-none">
                                                <svg viewBox="0 0 24 24" className="w-8 h-8 text-white transition-transform duration-300 hover:scale-110" fill="currentColor">
                                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <h5 className="font-semibold text-sm transition-colors duration-300 hover:text-[#7c393e]">{member.name}</h5>
                                        {member.position && (
                                            <p className="text-[#c68f4f] text-xs mt-1 transition-colors duration-300 hover:text-[#d49c5c]">{member.position}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Bilgi University */}
            {sectionFilter === 'bilgi' && (
                <section className="py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl font-bold text-[#7c393e] mb-8 text-center">جامعة بلجي</h2>

                        <div className={`bg-white rounded-lg shadow-md p-6 transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                            }`}>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {bilgiStudents.map((member, index) => (
                                    <div
                                        key={member.id}
                                        className={`bg-gray-50 rounded-lg p-3 hover:shadow-lg hover:-translate-y-1 transition-all duration-500 ease-in-out text-center transform ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-95'
                                            }`}
                                        style={{
                                            transitionDelay: `${index * 50}ms`
                                        }}
                                    >
                                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#7c393e] to-[#8b4346] flex items-center justify-center overflow-hidden mx-auto mb-2 shadow-md hover:shadow-lg transition-shadow duration-300">
                                            <div className="w-full h-full flex items-center justify-center animate-pulse hover:animate-none">
                                                <svg viewBox="0 0 24 24" className="w-8 h-8 text-white transition-transform duration-300 hover:scale-110" fill="currentColor">
                                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <h5 className="font-semibold text-sm transition-colors duration-300 hover:text-[#7c393e]">{member.name}</h5>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Join Us Section */}
            <div className={`text-center bg-gradient-to-br from-[#7c393e] to-[#8b4346] p-12 rounded-2xl text-white max-w-6xl mx-auto mb-12 transition-all duration-1200 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                }`}>
                <h3 className="text-3xl font-bold mb-4 animate-pulse">انضم إلينا</h3>
                <p className="text-xl mb-8 text-white/90">نرحب بانضمامك إلى مبادرة صحوة للمساهمة معنا في تحقيق أهدافنا وخدمة مجتمعنا الطلابي</p>
                <a href='https://forms.gle/xaLReRNajenPYHkB6' className="bg-white text-[#7c393e] font-bold py-4 px-8 rounded-xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-lg inline-block animate-bounce">
                    سجل للتطوع معنا
                </a>
            </div>

            <Footer />
        </div>
    );
};

export default MembersPage;
