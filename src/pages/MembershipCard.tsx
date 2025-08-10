import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const MembershipCardPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-white" dir="rtl">
            <Header />

            {/* Hero Section */}
            <div className="pt-32 pb-16 bg-gradient-to-b from-[#7c393e]/90 to-[#7c393e]/70">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center text-white">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">صفحة بطاقة الانتساب</h1>
                        <div className="w-24 h-1 bg-[#c68f4f] mx-auto mb-6"></div>
                        <p className="text-xl max-w-3xl mx-auto">
                            تعرّف على نظام بطاقات العضوية في مبادرة صحوة ومميزاتها
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <section className="py-16 md:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-16">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#7c393e]/10 text-[#7c393e] mb-6">
                                <span className="text-3xl">🪪</span>
                            </div>
                            <h2 className="text-3xl font-bold text-[#7c393e]">نظام الكروت في مبادرة صحوة</h2>
                        </div>

                        {/* Card System Explanation */}
                        <div className="mb-16">
                            <p className="text-lg text-gray-700 mb-8 text-center">
                                نظام بطاقات العضوية هو نظام تقديري للمتطوعين النشطين في مبادرة صحوة، ويمنح حامليه العديد من المزايا والتسهيلات.
                            </p>

                            {/* Card Types */}
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse bg-white shadow-md rounded-lg overflow-hidden">
                                    <thead className="bg-[#7c393e] text-white">
                                        <tr>
                                            <th className="py-4 px-4 text-right border-b">اسم الكرت</th>
                                            <th className="py-4 px-4 text-right border-b">اللون</th>
                                            <th className="py-4 px-4 text-right border-b">الفئة المستهدفة</th>
                                            <th className="py-4 px-4 text-right border-b">المميزات</th>
                                            <th className="py-4 px-4 text-right border-b">آلية الإصدار</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* Volunteer Card */}
                                        <tr className="hover:bg-gray-50">
                                            <td className="py-4 px-4 border-b font-semibold">كرت متطوع</td>
                                            <td className="py-4 px-4 border-b">
                                                <span className="inline-block w-6 h-6 rounded-full bg-green-500 align-middle ml-2"></span>
                                                أخضر
                                            </td>
                                            <td className="py-4 px-4 border-b">المتطوعون النشطون في المبادرة</td>
                                            <td className="py-4 px-4 border-b">
                                                <ul className="list-disc list-inside">
                                                    <li>خصومات من مطاعم ومتاجر معينة</li>
                                                    <li>حضور فعاليات صحوة مجانًا</li>
                                                    <li>رمز QR يعرض: الاسم، الصورة، المشاركات، التفاعل</li>
                                                </ul>
                                            </td>
                                            <td className="py-4 px-4 border-b">يُمنح بعد مدة (من شهر إلى 3 أشهر) بناءً على مستوى التفاعل والاستمرارية</td>
                                        </tr>

                                        {/* Administrative Card */}
                                        <tr className="hover:bg-gray-50">
                                            <td className="py-4 px-4 border-b font-semibold">كرت إداري / قيادي</td>
                                            <td className="py-4 px-4 border-b">
                                                <span className="inline-block w-6 h-6 rounded-full bg-green-700 align-middle ml-2"></span>
                                                أخضر داكن
                                            </td>
                                            <td className="py-4 px-4 border-b">الأعضاء الإداريون أو أصحاب التفاعل العالي جدًا</td>
                                            <td className="py-4 px-4 border-b">
                                                <ul className="list-disc list-inside">
                                                    <li>جميع مزايا كرت المتطوع</li>
                                                    <li>كتب مجانية</li>
                                                    <li>حضور جلسات أو برامج خاصة (مغلقة)</li>
                                                </ul>
                                            </td>
                                            <td className="py-4 px-4 border-b">يُمنح بعد إثبات مستوى عالٍ من المسؤولية والالتزام الإداري</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-6 p-4 bg-yellow-50 border-r-4 border-[#c68f4f] rounded-md">
                                <p className="font-semibold text-[#7c393e]">ملاحظة:</p>
                                <p className="text-gray-700">حالياً سيتم استخدام نوع واحد فقط من الكروت، لذا التركيز يكون على كرت المتطوعين النشطين.</p>
                            </div>
                        </div>

                        {/* Card Description */}
                        <div className="bg-gray-50 p-8 rounded-lg shadow-sm mb-16">
                            <h3 className="text-2xl font-bold text-[#7c393e] mb-6">وصف الكرت</h3>
                            <div className="space-y-4 text-gray-700">
                                <p>
                                    بطاقة العضوية تُمنح للمتطوعين الذين استمروا في العمل والمشاركة لمدة تتراوح بين 3 إلى 6 أشهر، وهي تقدير لدورهم والتزامهم.
                                </p>
                                <p>
                                    البطاقة تمنح حاملها مزايا عديدة منها تسهيلات وحضور فعاليات خاصة، بالإضافة إلى كونها رمز تقدير رسمي داخل المبادرة.
                                </p>
                            </div>
                        </div>

                        {/* Card Visual */}
                        <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
                            <div className="w-full md:w-1/2 flex justify-center">
                                <div className="w-80 h-48 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-4 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
                                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-white opacity-10 rounded-full -ml-8 -mb-8"></div>

                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="text-white font-bold text-lg">بطاقة متطوع</h4>
                                            <p className="text-green-100 text-sm">مبادرة صحوة</p>
                                        </div>
                                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                            <span className="text-xl">🪪</span>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex">
                                        <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                                        <div className="mr-3 mt-2">
                                            <p className="text-white font-bold">اسم المتطوع</p>
                                            <p className="text-green-100 text-xs">رقم العضوية: 2025001</p>
                                        </div>
                                    </div>

                                    <div className="absolute bottom-3 left-3">
                                        <p className="text-green-100 text-xs">تاريخ الإصدار: ١٠ أغسطس ٢٠٢٥</p>
                                    </div>

                                    <div className="absolute bottom-2 right-3 w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                                        <span className="text-xs text-gray-500">QR</span>
                                    </div>
                                </div>
                            </div>

                            <div className="w-full md:w-1/2">
                                <h3 className="text-xl font-bold text-[#7c393e] mb-4">مميزات البطاقة</h3>
                                <ul className="space-y-3">
                                    <li className="flex items-start">
                                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#7c393e] text-white ml-3 mt-1 text-sm">✓</span>
                                        <div>
                                            <p className="font-semibold">إثبات العضوية الرسمية</p>
                                            <p className="text-sm text-gray-600">بطاقة رسمية معترف بها داخل جميع أنشطة وفعاليات المبادرة</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#7c393e] text-white ml-3 mt-1 text-sm">✓</span>
                                        <div>
                                            <p className="font-semibold">خصومات حصرية</p>
                                            <p className="text-sm text-gray-600">خصومات لدى مجموعة من المطاعم والمتاجر المتعاونة مع المبادرة</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#7c393e] text-white ml-3 mt-1 text-sm">✓</span>
                                        <div>
                                            <p className="font-semibold">حضور فعاليات مجانية</p>
                                            <p className="text-sm text-gray-600">الدخول المجاني لفعاليات المبادرة المدفوعة وأولوية الحضور</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start">
                                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#7c393e] text-white ml-3 mt-1 text-sm">✓</span>
                                        <div>
                                            <p className="font-semibold">تتبع المشاركات والتفاعل</p>
                                            <p className="text-sm text-gray-600">من خلال رمز QR يمكن تتبع مشاركات العضو وتفاعله في أنشطة المبادرة</p>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* How to Apply */}
                        <div className="mt-16">
                            <h3 className="text-2xl font-bold text-[#7c393e] mb-8 text-center">كيفية الحصول على البطاقة</h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 text-center">
                                    <div className="w-14 h-14 bg-[#7c393e]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <span className="text-[#7c393e] font-bold text-xl">١</span>
                                    </div>
                                    <h4 className="font-semibold text-lg mb-2">التطوع والمشاركة</h4>
                                    <p className="text-gray-600">المشاركة الفعالة في أنشطة المبادرة لمدة تتراوح بين شهر إلى 3 أشهر</p>
                                </div>

                                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 text-center">
                                    <div className="w-14 h-14 bg-[#7c393e]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <span className="text-[#7c393e] font-bold text-xl">٢</span>
                                    </div>
                                    <h4 className="font-semibold text-lg mb-2">تقييم المشاركة</h4>
                                    <p className="text-gray-600">تقييم مستوى التفاعل والالتزام من قبل المشرفين على المبادرة</p>
                                </div>

                                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 text-center">
                                    <div className="w-14 h-14 bg-[#7c393e]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <span className="text-[#7c393e] font-bold text-xl">٣</span>
                                    </div>
                                    <h4 className="font-semibold text-lg mb-2">إصدار البطاقة</h4>
                                    <p className="text-gray-600">عند استيفاء الشروط، يتم إصدار البطاقة وتسليمها خلال أحد فعاليات المبادرة</p>
                                </div>
                            </div>
                        </div>

                        {/* Call to Action */}
                        <div className="mt-16 text-center">
                            <button className="bg-[#7c393e] hover:bg-[#7c393e]/90 text-white font-semibold py-3 px-8 rounded-md transition-colors duration-300">
                                سجل الآن للتطوع
                            </button>
                            <p className="mt-4 text-gray-600">ابدأ رحلتك التطوعية معنا واحصل على بطاقة العضوية</p>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default MembershipCardPage;
