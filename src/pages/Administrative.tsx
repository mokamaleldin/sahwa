import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const AdministrativePage: React.FC = () => {
    return (
        <div className="min-h-screen bg-white" dir="rtl">
            <Header />

            {/* Hero Section */}
            <div className="pt-32 pb-16 bg-gradient-to-b from-[#7c393e]/90 to-[#7c393e]/70">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center text-white">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">الصفحة الإدارية</h1>
                        <div className="w-24 h-1 bg-[#c68f4f] mx-auto mb-6"></div>
                        <p className="text-xl max-w-3xl mx-auto">
                            تعرّف على الهيكل الإداري لمبادرة صحوة ومجلس الإدارة
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <section className="py-16 md:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="prose prose-lg max-w-none text-right">
                            <h2 className="text-3xl font-bold text-[#7c393e] mb-6">مجلس الإدارة الضيّق – الهيكل الإداري الأساسي للمبادرة</h2>

                            <p className="text-lg mb-6">
                                يتكون مجلس الإدارة الضيّق من ثمانية أعضاء، يشكّلون النواة الأساسية لإدارة المبادرة.
                                كل عضو منهم مسؤول عن تكوين فريق داخل كل من الجامعتين (جامعة إستينيا، وجامعة بلجي)، ويشرف على تنفيذ المهام في كل جامعة.
                            </p>

                            <h3 className="text-2xl font-bold text-[#7c393e] mt-12 mb-8">تشكيل المجلس</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                            {/* Board Member 1 */}
                            <div className="bg-white border border-gray-100 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
                                <div className="flex items-center mb-4">
                                    <div className="w-16 h-16 rounded-full bg-[#7c393e]/20 flex items-center justify-center mr-4">
                                        <span className="text-[#7c393e] font-bold text-xl">١</span>
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold text-[#7c393e]">المسؤول العام</h4>
                                        <p className="text-gray-600 mt-1">القيادة الإدارية العامة للمبادرة</p>
                                    </div>
                                </div>
                                <p className="text-gray-700">
                                    يتولى التخطيط الاستراتيجي والإشراف العام على سير العمل في كافة اللجان والأقسام.
                                </p>
                            </div>

                            {/* Board Member 2 */}
                            <div className="bg-white border border-gray-100 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
                                <div className="flex items-center mb-4">
                                    <div className="w-16 h-16 rounded-full bg-[#7c393e]/20 flex items-center justify-center mr-4">
                                        <span className="text-[#7c393e] font-bold text-xl">٢</span>
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold text-[#7c393e]">اللجنة المالية وأمين السر</h4>
                                        <p className="text-gray-600 mt-1">إدارة الموارد المالية والتوثيق</p>
                                    </div>
                                </div>
                                <p className="text-gray-700">
                                    مسؤول عن إدارة الموارد المالية للمبادرة، وتوثيق الاجتماعات والقرارات الإدارية.
                                </p>
                            </div>

                            {/* Board Member 3 */}
                            <div className="bg-white border border-gray-100 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
                                <div className="flex items-center mb-4">
                                    <div className="w-16 h-16 rounded-full bg-[#7c393e]/20 flex items-center justify-center mr-4">
                                        <span className="text-[#7c393e] font-bold text-xl">٣</span>
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold text-[#7c393e]">ممثلة الطالبات</h4>
                                        <p className="text-gray-600 mt-1">تنسيق شؤون الطالبات</p>
                                    </div>
                                </div>
                                <p className="text-gray-700">
                                    تتولى تنسيق الأنشطة الخاصة بالطالبات والتواصل مع الطالبات المشاركات في المبادرة.
                                </p>
                            </div>

                            {/* Board Member 4 */}
                            <div className="bg-white border border-gray-100 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
                                <div className="flex items-center mb-4">
                                    <div className="w-16 h-16 rounded-full bg-[#7c393e]/20 flex items-center justify-center mr-4">
                                        <span className="text-[#7c393e] font-bold text-xl">٤</span>
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold text-[#7c393e]">لجنة الأنشطة واللوجستيات</h4>
                                        <p className="text-gray-600 mt-1">تنظيم الفعاليات والدعم اللوجستي</p>
                                    </div>
                                </div>
                                <p className="text-gray-700">
                                    تخطيط وتنظيم الفعاليات والأنشطة وتأمين الاحتياجات اللوجستية للمبادرة.
                                </p>
                            </div>

                            {/* Board Member 5 */}
                            <div className="bg-white border border-gray-100 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
                                <div className="flex items-center mb-4">
                                    <div className="w-16 h-16 rounded-full bg-[#7c393e]/20 flex items-center justify-center mr-4">
                                        <span className="text-[#7c393e] font-bold text-xl">٥</span>
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold text-[#7c393e]">لجنة شؤون الطلاب</h4>
                                        <p className="text-gray-600 mt-1">رعاية وخدمات الطلاب</p>
                                    </div>
                                </div>
                                <p className="text-gray-700">
                                    متابعة احتياجات الطلاب وتقديم الدعم والخدمات المختلفة لهم وتنسيق البرامج الطلابية.
                                </p>
                            </div>

                            {/* Board Member 6 */}
                            <div className="bg-white border border-gray-100 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
                                <div className="flex items-center mb-4">
                                    <div className="w-16 h-16 rounded-full bg-[#7c393e]/20 flex items-center justify-center mr-4">
                                        <span className="text-[#7c393e] font-bold text-xl">٦</span>
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold text-[#7c393e]">لجنة الإعلام</h4>
                                        <p className="text-gray-600 mt-1">التواصل والإعلام</p>
                                    </div>
                                </div>
                                <p className="text-gray-700">
                                    إدارة منصات التواصل الاجتماعي والمحتوى الإعلامي للمبادرة وتوثيق الأنشطة إعلامياً.
                                </p>
                            </div>

                            {/* Board Member 7 */}
                            <div className="bg-white border border-gray-100 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
                                <div className="flex items-center mb-4">
                                    <div className="w-16 h-16 rounded-full bg-[#7c393e]/20 flex items-center justify-center mr-4">
                                        <span className="text-[#7c393e] font-bold text-xl">٧</span>
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold text-[#7c393e]">لجنة العلاقات العامة</h4>
                                        <p className="text-gray-600 mt-1">التنسيق الخارجي والشراكات</p>
                                    </div>
                                </div>
                                <p className="text-gray-700">
                                    التواصل مع الجهات الخارجية وبناء العلاقات والشراكات مع المؤسسات والمبادرات الأخرى.
                                </p>
                            </div>

                            {/* Board Member 8 */}
                            <div className="bg-white border border-gray-100 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
                                <div className="flex items-center mb-4">
                                    <div className="w-16 h-16 rounded-full bg-[#7c393e]/20 flex items-center justify-center mr-4">
                                        <span className="text-[#7c393e] font-bold text-xl">٨</span>
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold text-[#7c393e]">لجنة التطوع وشؤون المتطوعين</h4>
                                        <p className="text-gray-600 mt-1">إدارة المتطوعين</p>
                                    </div>
                                </div>
                                <p className="text-gray-700">
                                    استقطاب وإدارة المتطوعين وتنظيم البرامج التطوعية وتنسيق جهود المتطوعين.
                                </p>
                            </div>
                        </div>

                        <div className="mt-16 text-center">
                            <h3 className="text-2xl font-bold text-[#7c393e] mb-6">الهيكل التنظيمي</h3>
                            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                                <div className="w-full h-64 md:h-96 bg-white rounded border border-gray-200 flex items-center justify-center">
                                    <p className="text-gray-500">رسم توضيحي للهيكل التنظيمي</p>
                                </div>
                                <p className="mt-4 text-gray-600">
                                    يعمل مجلس الإدارة بشكل تكاملي لتحقيق أهداف المبادرة، ويتم التنسيق بين اللجان لضمان تنفيذ الخطط بكفاءة.
                                </p>
                            </div>
                        </div>

                        <div className="mt-16">
                            <div className="bg-[#7c393e]/5 border-r-4 border-[#7c393e] p-6 rounded">
                                <h4 className="text-xl font-bold text-[#7c393e] mb-3">آلية العمل</h4>
                                <ul className="list-disc list-inside space-y-2 text-gray-700">
                                    <li>اجتماع أسبوعي لمجلس الإدارة الضيّق لمتابعة سير العمل</li>
                                    <li>اجتماعات دورية لكل لجنة مع فريقها في الجامعتين</li>
                                    <li>تقارير شهرية عن أداء كل لجنة ترفع للمسؤول العام</li>
                                    <li>خطة فصلية لكل لجنة تتوافق مع الخطة الاستراتيجية للمبادرة</li>
                                    <li>تقييم دوري للأداء وتطوير آليات العمل</li>
                                </ul>
                            </div>
                        </div>

                        <div className="mt-16 text-center">
                            <a
                                href="#contact"
                                className="inline-block bg-[#7c393e] text-white px-8 py-3 rounded-md hover:bg-[#7c393e]/90 transition-colors duration-300"
                            >
                                تواصل مع مجلس الإدارة
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default AdministrativePage;
