import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const MembersPage: React.FC = () => {
    // Leadership team data
    const leadershipTeam = [
        {
            id: 1,
            name: "البراء معمر",
            position: "المسؤول العام",
            photo: true,
            university: "جامعة بلجي",
            description: "يشرف على جميع أنشطة المبادرة والتخطيط الاستراتيجي"
        },
        {
            id: 2,
            name: "محمد كمال الدين",
            position: "مسؤول شؤون الطلاب",
            photo: true,
            university: "جامعة استنيا",
            description: "يتولى متابعة احتياجات الطلاب وتنسيق البرامج الطلابية"
        },
        {
            id: 3,
            name: "أنس محمد",
            position: "المسؤول المالي",
            photo: true,
            university: "صباح الدين",
            description: "يدير الموارد المالية للمبادرة وإعداد التقارير المالية"
        },
        {
            id: 4,
            name: "عمرو السيد",
            position: "المسؤول الإعلامي",
            photo: true,
            university: "جامعة استنيا",
            description: "يشرف على المحتوى الإعلامي ومنصات التواصل الاجتماعي"
        },
        {
            id: 5,
            name: "عبدالله جامع",
            position: "مسؤول العلاقات العامة",
            photo: true,
            university: "جامعة بلجي",
            description: "يتولى التواصل مع الجهات الخارجية وبناء الشراكات"
        },
        {
            id: 6,
            name: "كاميليا اليوسف",
            position: "مسؤولة شؤون الطالبات",
            photo: true,
            university: "جامعة استنيا",
            description: "تنسق الأنشطة الخاصة بالطالبات والتواصل مع الطالبات"
        },
        {
            id: 7,
            name: "يقين تامر",
            position: "مسؤولة شؤون المتطوعين",
            photo: true,
            university: "جامعة استنيا",
            description: "تدير برامج التطوع واستقطاب وتنظيم المتطوعين"
        },
        {
            id: 8,
            name: "حسن طه",
            position: "مسؤول الأنشطة واللوجستيات",
            photo: true,
            university: "جامعة استنيا",
            description: "يخطط وينظم الفعاليات ويؤمن الاحتياجات اللوجستية"
        },
    ];

    // Team members grouped by departments
    const teams = [
        {
            id: 1,
            name: "فريق شؤون الطلاب",
            members: [
                { id: 101, name: "عمر الجمل", photo: true, university: "جامعة استنيا" },
                { id: 102, name: "أسامه أبوشويشه", photo: true, university: "جامعة بلجي" },
                { id: 103, name: "رشا مجبور", photo: true, university: "جامعة استنيا" },
                { id: 104, name: "خالد مسلم", photo: true, university: "جامعة بلجي" },
            ]
        },
        {
            id: 2,
            name: "الفريق المالي",
            members: [
                { id: 201, name: "سارة محمود", photo: true, university: "جامعة استنيا" },
                { id: 202, name: "ريان", photo: true, university: "جامعة بلجي" },
            ]
        },
        {
            id: 3,
            name: "اللجنة الإعلامية",
            members: [
                { id: 301, name: "حماس تامر", photo: true, university: "جامعة استنيا" },
                { id: 302, name: "جنة عبدربه", photo: true, university: "جامعة استنيا" },
                { id: 303, name: "عنان عفيفي", photo: true, university: "جامعة استنيا" },
                { id: 304, name: "آية رجوب", photo: true, university: "جامعة استنيا" },
                { id: 305, name: "عفيف", photo: true, university: "جامعة بلجي" },
                { id: 306, name: "فرحان", photo: true, university: "جامعة بلجي" },
                { id: 307, name: "ماريا عقاد", photo: true, university: "جامعة بلجي" },

            ]
        },
        {
            id: 4,
            name: "فريق العلاقات العامة",
            members: [
                { id: 401, name: "عامر", photo: true, university: "جامعة استنيا" },
            ]
        },
        {
            id: 5,
            name: "فريق شؤون الطالبات",
            members: [
                { id: 501, name: "ساره عقاد", photo: true, university: "جامعة بلجي" },
                { id: 502, name: "خلود كردي", photo: true, university: "جامعة استنيا" },
            ]
        },
        {
            id: 6,
            name: "فريق شؤون المتطوعين",
            members: [
                { id: 603, name: "أسامه خضر", photo: true, university: "جامعة بلجي" },
                { id: 604, name: "خديجه محمود", photo: true, university: "جامعة استنيا" },
            ]
        },
        {
            id: 7,
            name: "فريق الأنشطة واللوجستيات",
            members: [
                { id: 701, name: "وئام الغرباني", photo: true, university: "جامعة استنيا" },
                { id: 702, name: "زياد خفاجي", photo: true, university: "جامعة بلجي" },
                { id: 703, name: "غني محمد", photo: true, university: "جامعة استنيا" },
                { id: 704, name: "فلك الحُميدان", photo: true, university: "جامعة استنيا" },
                { id: 705, name: "حمدي النقيب", photo: true, university: "جامعة استنيا" },
                { id: 706, name: "عدنان النبري", photo: true, university: "جامعة بلجي" },
                { id: 707, name: "جوان سليمان", photo: true, university: "جامعة بلجي" },
                { id: 708, name: "ايمن سليمان", photo: true, university: "جامعة استنيا" },
                { id: 308, name: "فاطمة الزهراء", photo: true, university: "جامعة استنيا" },
                { id: 309, name: "جمانه أحمد", photo: true, university: "جامعة بلجي" },
                { id: 310, name: "عبدالرحمن اكساكالي", photo: true, university: "جامعة بلجي" },
                { id: 311, name: "عزة الموصلي", photo: true, university: "جامعة استنيا" },
            ]
        },
    ];

    // Filter by university
    const [universityFilter, setUniversityFilter] = useState('all');

    const filteredLeadership = universityFilter === 'all'
        ? leadershipTeam
        : leadershipTeam.filter(member => member.university === universityFilter);

    const filteredTeams = teams.map(team => ({
        ...team,
        members: universityFilter === 'all'
            ? team.members
            : team.members.filter(member => member.university === universityFilter)
    }));

    return (
        <div className="min-h-screen bg-white" dir="rtl">
            <Header />

            {/* Hero Section */}
            <div className="pt-32 pb-16 bg-gradient-to-b from-[#7c393e]/90 to-[#7c393e]/70">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center text-white">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">صفحة الأعضاء</h1>
                        <div className="w-24 h-1 bg-[#c68f4f] mx-auto mb-6"></div>
                        <p className="text-xl max-w-3xl mx-auto">
                            تعرّف على أعضاء مبادرة صحوة من قادة ومسؤولين ومتطوعين
                        </p>
                    </div>
                </div>
            </div>

            {/* Filter Controls */}
            <div className="bg-gray-50 py-6 border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-4">
                        <span className="text-gray-700 font-medium">عرض حسب:</span>
                        <div className="flex">
                            <button
                                className={`px-4 py-2 rounded-r-md ${universityFilter === 'all' ? 'bg-[#7c393e] text-white' : 'bg-white text-gray-700 border border-gray-300'}`}
                                onClick={() => setUniversityFilter('all')}
                            >
                                الجميع
                            </button>
                            <button
                                className={`px-4 py-2 ${universityFilter === 'جامعة استنيا' ? 'bg-[#7c393e] text-white' : 'bg-white text-gray-700 border-y border-gray-300'}`}
                                onClick={() => setUniversityFilter('جامعة استنيا')}
                            >
                                جامعة استنيا
                            </button>
                            <button
                                className={`px-4 py-2 ${universityFilter === 'جامعة بلجي' ? 'bg-[#7c393e] text-white' : 'bg-white text-gray-700 border-y border-gray-300'}`}
                                onClick={() => setUniversityFilter('جامعة بلجي')}
                            >
                                جامعة بلجي
                            </button>
                            <button
                                className={`px-4 py-2 rounded-l-md ${universityFilter === 'صباح الدين' ? 'bg-[#7c393e] text-white' : 'bg-white text-gray-700 border border-gray-300'}`}
                                onClick={() => setUniversityFilter('صباح الدين')}
                            >
                                صباح الدين
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Leadership Team */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-[#7c393e] mb-8 text-center">مجلس الإدارة</h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredLeadership.map(leader => (
                            <div key={leader.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
                                <div className="p-6">
                                    <div className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden bg-[#7c393e]">
                                        <div className="w-full h-full flex items-center justify-center">
                                            <svg viewBox="0 0 24 24" className="w-14 h-14 text-white" fill="currentColor">
                                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-xl text-center mb-1">{leader.name}</h3>
                                    <p className="text-[#c68f4f] text-center mb-3">{leader.position}</p>
                                    <p className="text-gray-600 text-sm text-center">{leader.university}</p>
                                    <p className="mt-4 text-gray-700 text-center text-sm">{leader.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Teams */}
            <section className="py-8 pb-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-[#7c393e] mb-12 text-center">فرق العمل</h2>

                    <div className="space-y-16">
                        {filteredTeams.map(team => team.members.length > 0 && (
                            <div key={team.id} className="bg-white rounded-lg shadow-md p-6">
                                <h3 className="text-xl font-bold text-[#7c393e] mb-6 pb-3 border-b border-gray-200">
                                    {team.name}
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {team.members.map(member => (
                                        <div key={member.id} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                                            <div className="flex items-center space-x-reverse space-x-4">
                                                <div className="w-16 h-16 rounded-full bg-[#7c393e] flex items-center justify-center overflow-hidden">
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <svg viewBox="0 0 24 24" className="w-10 h-10 text-white" fill="currentColor">
                                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                                                        </svg>
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold">{member.name}</h4>
                                                    <p className="text-gray-500 text-xs mt-1">{member.university}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Join Us Section */}
            <section className="py-16 bg-[#7c393e]/10">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-2xl font-bold text-[#7c393e] mb-4">انضم إلينا</h2>
                    <p className="text-gray-700 mb-8">
                        نرحب بانضمامك إلى مبادرة صحوة للمساهمة معنا في تحقيق أهدافنا وخدمة مجتمعنا الطلابي
                    </p>
                    <button className="bg-[#7c393e] text-white font-semibold px-8 py-3 rounded-md hover:bg-[#7c393e]/90 transition-colors">
                        سجل للتطوع معنا
                    </button>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default MembersPage;
