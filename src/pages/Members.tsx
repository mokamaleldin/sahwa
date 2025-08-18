import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Hero from '../components/Hero';

const MembersPage: React.FC = () => {
    // General Board of Directors
    const generalBoard = [
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

    // General Media Team (under General Board)
    const generalMediaTeam = [
        { id: 301, name: "حماس تامر", photo: true, university: "جامعة استنيا" },
        { id: 302, name: "جنة عبدربه", photo: true, university: "جامعة استنيا" },
        { id: 303, name: "عنان عفيفي", photo: true, university: "جامعة استنيا" },
        { id: 304, name: "آية رجوب", photo: true, university: "جامعة استنيا" },
        { id: 305, name: "عفيف", photo: true, university: "جامعة بلجي" },
        { id: 306, name: "فرحان", photo: true, university: "جامعة بلجي" },
        { id: 307, name: "ماريا عقاد", photo: true, university: "جامعة بلجي" },
    ];

    // Istanbul University Structure
    const istanbulUniversity = {
        board: [
            {
                id: 101,
                name: "محمد كمال الدين",
                position: "مسؤول الجامعة",
                photo: true,
                description: "إدارة جامعة استنيا"
            },
            {
                id: 102,
                name: "عامر",
                position: "مسؤول شؤون الطلاب",
                photo: true,
                description: "إدارة شؤون الطلاب والطالبات"
            },
            {
                id: 103,
                name: "يقين تامر",
                position: "مسؤولة شؤون المتطوعين",
                photo: true,
                description: "إدارة شؤون المتطوعين"
            },
            {
                id: 104,
                name: "كاميليا اليوسف",
                position: "مسؤولة الطالبات",
                photo: true,
                description: "إدارة شؤون الطالبات"
            },
            {
                id: 104,
                name: "حسن طه",
                position: "مسؤول الأنشطة - شباب",
                photo: true,
                description: "إدارة أنشطة الشباب"
            },
            {
                id: 105,
                name: "عمرو السيد",
                position: "المسؤول الإعلامي",
                photo: true,
                description: "إدارة الإعلام"
            },
            {
                id: 106,
                name: "فاطمة الزهراء",
                position: "مسؤولة الأنشطة - بنات",
                photo: true,
                description: "إدارة أنشطة البنات"
            }
        ],
        teams: [
            {
                id: 1,
                name: "فريق شؤون الطلاب",
                manager: "عامر",
                members: [
                    { id: 1001, name: "عامر", photo: true, isManager: true },
                    { id: 1002, name: "عمر الجمل", photo: true },
                    { id: 1003, name: "رشا مجبور", photo: true },
                ]
            },
            {
                id: 2,
                name: "فريق الأنشطة - شباب",
                manager: "حسن طه",
                members: [
                    { id: 1004, name: "حسن طه", photo: true, isManager: true },
                    { id: 1005, name: "وئام الغرباني", photo: true },
                    { id: 1006, name: "غني محمد", photo: true },
                    { id: 1007, name: "فلك الحُميدان", photo: true },
                    { id: 1008, name: "ايمن سليمان", photo: true },
                    { id: 1009, name: "حمدي النقيب", photo: true },
                ]
            },
            {
                id: 3,
                name: "فريق الأنشطة - بنات",
                manager: "فاطمة الزهراء",
                members: [
                    { id: 1010, name: "فاطمة الزهراء", photo: true, isManager: true },
                    { id: 1011, name: "عزة الموصلي", photo: true },
                    { id: 1012, name: "خلود كردي", photo: true },
                    { id: 1013, name: "سارة محمود", photo: true },
                    { id: 1014, name: "خديجه محمود", photo: true },
                ]
            },
        ],
        affiliates: [
            { id: 1016, name: "جنة عبدربه", photo: true },
        ]
    };

    // Bilgi University Structure
    const bilgiUniversity = {
        board: [
            {
                id: 201,
                name: "البراء معمر",
                position: "مسؤول الجامعة",
                photo: true,
                description: "إدارة جامعة بلجي"
            },
            {
                id: 202,
                name: "ساره عقاد",
                position: "مسؤولة شؤون الطلاب",
                photo: true,
                description: "إدارة شؤون الطلاب والطالبات"
            },
            {
                id: 203,
                name: "عبدالله جامع",
                position: "مسؤول العلاقات العامة",
                photo: true,
                description: "إدارة العلاقات العامة"
            }
        ],
        teams: [
            {
                id: 1,
                name: "فريق شؤون الطلاب",
                manager: "ساره عقاد",
                members: [
                    { id: 2001, name: "ساره عقاد", photo: true, isManager: true },
                    { id: 2002, name: "أسامه أبوشويشه", photo: true },
                    { id: 2003, name: "خالد مسلم", photo: true },
                ]
            },
            {
                id: 2,
                name: "فريق الأنشطة",
                manager: "البراء معمر",
                members: [
                    { id: 2004, name: "البراء معمر", photo: true, isManager: true },
                    { id: 2005, name: "زياد خفاجي", photo: true },
                    { id: 2006, name: "عدنان النبري", photo: true },
                    { id: 2007, name: "جوان سليمان", photo: true },
                    { id: 2008, name: "جمانه أحمد", photo: true },
                    { id: 2009, name: "عبدالرحمن اكساكالي", photo: true },
                    { id: 2010, name: "ريان", photo: true },
                    { id: 2011, name: "أسامه خضر", photo: true },
                    { id: 2012, name: "عمرو ماهر", photo: true },
                ]
            }
        ],
        affiliates: [
            { id: 2013, name: "ماريا عقاد", photo: true },
            { id: 2014, name: "عفيف", photo: true },
        ]
    };

    // Filter by section
    const [sectionFilter, setSectionFilter] = useState('istanbul');

    return (
        <div className="min-h-screen bg-white" dir="rtl">
            <Header />

            <Hero
                title="الأعضاء"
                description="تعرّف على أعضاء مبادرة صحوة "

            />

            {/* Filter Controls */}
            <div className="bg-gray-50 py-6 border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-4">
                        <span className="text-gray-700 font-medium">عرض حسب:</span>
                        <div className="flex">
                            <button
                                className={`px-4 py-2 rounded-r-md ${sectionFilter === 'istanbul' ? 'bg-[#7c393e] text-white' : 'bg-white text-gray-700 border border-gray-300'}`}
                                onClick={() => setSectionFilter('istanbul')}
                            >
                                جامعة استنيا
                            </button>
                            <button
                                className={`px-4 py-2 ${sectionFilter === 'bilgi' ? 'bg-[#7c393e] text-white' : 'bg-white text-gray-700 border-y border-gray-300'}`}
                                onClick={() => setSectionFilter('bilgi')}
                            >
                                جامعة بلجي
                            </button>
                            <button
                                className={`px-4 py-2 rounded-l-md ${sectionFilter === 'general' ? 'bg-[#7c393e] text-white' : 'bg-white text-gray-700 border border-gray-300'}`}
                                onClick={() => setSectionFilter('general')}
                            >
                                مجلس الإدارة العام
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* General Board of Directors */}
            {sectionFilter === 'general' && (
                <section className="py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl font-bold text-[#7c393e] mb-4 text-center">مجلس الإدارة العام</h2>
                        <p className="text-gray-600 text-center mb-8 max-w-3xl mx-auto">
                            مجلس الإدارة العام مسؤول عن إدارة الفعاليات الخارجية خارج الجامعات والترابط بين الجامعات
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {generalBoard.map(leader => (
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

                        {/* General Media Team */}
                        <div className="mt-12">
                            <h3 className="text-xl font-bold text-[#7c393e] mb-6 text-center">اللجنة الإعلامية العامة</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {generalMediaTeam.map(member => (
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
                    </div>
                </section>
            )}

            {/* Istanbul University */}
            {sectionFilter === 'istanbul' && (
                <section className="py-16 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl font-bold text-[#7c393e] mb-8 text-center">جامعة استنيا</h2>

                        {/* Istanbul Board */}
                        <div className="mb-12">
                            <h3 className="text-xl font-bold text-[#7c393e] mb-6 text-center">مجلس الإدارة</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {istanbulUniversity.board.map(member => (
                                    <div key={member.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
                                        <div className="p-6">
                                            <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden bg-[#7c393e]">
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <svg viewBox="0 0 24 24" className="w-12 h-12 text-white" fill="currentColor">
                                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                                                    </svg>
                                                </div>
                                            </div>
                                            <h4 className="font-bold text-lg text-center mb-1">{member.name}</h4>
                                            <p className="text-[#c68f4f] text-center mb-3 text-sm">{member.position}</p>
                                            <p className="text-gray-700 text-center text-sm">{member.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Istanbul Teams */}
                        <div className="space-y-8">
                            {istanbulUniversity.teams.map(team => (
                                <div key={team.id} className="bg-white rounded-lg shadow-md p-6">
                                    <h4 className="text-lg font-bold text-[#7c393e] mb-4 pb-3 border-b border-gray-200">
                                        {team.name}
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {team.members.map(member => (
                                            <div key={member.id} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                                                <div className="flex items-center space-x-reverse space-x-4">
                                                    <div className="w-14 h-14 rounded-full bg-[#7c393e] flex items-center justify-center overflow-hidden">
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <svg viewBox="0 0 24 24" className="w-8 h-8 text-white" fill="currentColor">
                                                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h5 className="font-semibold text-sm">{member.name}</h5>
                                                        {member.isManager && (
                                                            <p className="text-[#c68f4f] text-xs mt-1">مسؤول</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            {/* Istanbul Affiliates */}
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h4 className="text-lg font-bold text-[#7c393e] mb-4 pb-3 border-b border-gray-200">
                                    متطوعين
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {istanbulUniversity.affiliates.map(member => (
                                        <div key={member.id} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                                            <div className="flex items-center space-x-reverse space-x-4">
                                                <div className="w-14 h-14 rounded-full bg-[#7c393e] flex items-center justify-center overflow-hidden">
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <svg viewBox="0 0 24 24" className="w-8 h-8 text-white" fill="currentColor">
                                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                                                        </svg>
                                                    </div>
                                                </div>
                                                <div>
                                                    <h5 className="font-semibold text-sm">{member.name}</h5>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
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

                        {/* Bilgi Board */}
                        <div className="mb-12">
                            <h3 className="text-xl font-bold text-[#7c393e] mb-6 text-center">مجلس الإدارة</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {bilgiUniversity.board.map(member => (
                                    <div key={member.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
                                        <div className="p-6">
                                            <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden bg-[#7c393e]">
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <svg viewBox="0 0 24 24" className="w-12 h-12 text-white" fill="currentColor">
                                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                                                    </svg>
                                                </div>
                                            </div>
                                            <h4 className="font-bold text-lg text-center mb-1">{member.name}</h4>
                                            <p className="text-[#c68f4f] text-center mb-3 text-sm">{member.position}</p>
                                            <p className="text-gray-700 text-center text-sm">{member.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Bilgi Teams */}
                        <div className="space-y-8">
                            {bilgiUniversity.teams.map(team => (
                                <div key={team.id} className="bg-white rounded-lg shadow-md p-6">
                                    <h4 className="text-lg font-bold text-[#7c393e] mb-4 pb-3 border-b border-gray-200">
                                        {team.name}
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {team.members.map(member => (
                                            <div key={member.id} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                                                <div className="flex items-center space-x-reverse space-x-4">
                                                    <div className="w-14 h-14 rounded-full bg-[#7c393e] flex items-center justify-center overflow-hidden">
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <svg viewBox="0 0 24 24" className="w-8 h-8 text-white" fill="currentColor">
                                                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h5 className="font-semibold text-sm">{member.name}</h5>
                                                        {member.isManager && (
                                                            <p className="text-[#c68f4f] text-xs mt-1">مسؤول</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            {/* Bilgi Affiliates */}
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h4 className="text-lg font-bold text-[#7c393e] mb-4 pb-3 border-b border-gray-200">
                                    متطوعين
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {bilgiUniversity.affiliates.map(member => (
                                        <div key={member.id} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                                            <div className="flex items-center space-x-reverse space-x-4">
                                                <div className="w-14 h-14 rounded-full bg-[#7c393e] flex items-center justify-center overflow-hidden">
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <svg viewBox="0 0 24 24" className="w-8 h-8 text-white" fill="currentColor">
                                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                                                        </svg>
                                                    </div>
                                                </div>
                                                <div>
                                                    <h5 className="font-semibold text-sm">{member.name}</h5>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Join Us Section */}

            <div className="text-center bg-gradient-to-br from-[#7c393e] to-[#8b4346] p-12 rounded-2xl text-white max-w-6xl mx-auto mb-12">
                <h3 className="text-3xl font-bold mb-4">انضم إلينا</h3>
                <p className="text-xl mb-8 text-white/90">نرحب بانضمامك إلى مبادرة صحوة للمساهمة معنا في تحقيق أهدافنا وخدمة مجتمعنا الطلابي</p>
                <a href='https://forms.gle/xaLReRNajenPYHkB6'  className="bg-white text-[#7c393e] font-bold py-4 px-8 rounded-xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg">
                        سجل للتطوع معنا
                </a>
                </div>

            {/* Call to Action */}


            <Footer />
        </div>
    );
};

export default MembersPage;
