import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Hero from '../components/Hero';
import SEO from '../components/SEO';

const ContactAndGroups: React.FC = () => {
    // Structured data for contact page
    const contactStructuredData = {
        "@context": "https://schema.org",
        "@type": "ContactPage",
        "name": "تواصل معنا - صحوة",
        "description": "تواصل مع مبادرة صحوة وانضم لجروبات الواتساب",
        "mainEntity": {
            "@type": "Organization",
            "name": "صحوة",
            "contactPoint": [
                {
                    "@type": "ContactPoint",
                    "telephone": "+905345195501",
                    "email": "sahwa.org.tr@gmail.com",
                    "contactType": "customer service",
                    "availableLanguage": ["Arabic", "Turkish"]
                }
            ],
            "sameAs": [
                "https://www.instagram.com/sahwa.tr/"
            ]
        }
    };

    return (
        <div className="min-h-screen bg-white" dir="rtl">
            <SEO
                title="تواصل معنا وانضم لجروباتنا"
                description="انضم إلى جروبات واتساب مبادرة صحوة في جامعة استنيا وجامعة بلجي. تابعنا على انستجرام وتيك توك. تواصل معنا مباشرة."
                keywords="تواصل صحوة, واتساب صحوة, انستجرام صحوة, جروب استنيا, جروب بلجي"
                canonicalUrl="/contact"
                structuredData={contactStructuredData}
            />
            <Header />
            
            <Hero
                title="صفحة التواصل والجروبات"
                description="                            انضم إلى مجموعات مبادرة صحوة وتابعنا على منصات التواصل الاجتماعي
"

            />
            
            {/* WhatsApp Groups Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-[#7c393e]">جروبات واتساب</h2>
                        <p className="mt-4 text-lg text-gray-600">
                            انضم إلى جروبات واتساب حسب جامعتك للتواصل مع أعضاء المبادرة ومتابعة الأنشطة والفعاليات
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Istinye University Group */}
                        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
                            <div className="p-8">
                                <div className="flex justify-center mb-6">
                                    <div className="w-20 h-20 rounded-full bg-[#25D366] flex items-center justify-center text-white">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                        </svg>
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold text-center text-gray-900 mb-4">جروب صحوة استينيا</h3>
                                <p className="text-gray-600 text-center mb-6">
                                    مجموعة واتساب خاصة بطلاب جامعة استينيا المهتمين بأنشطة مبادرة صحوة
                                </p>
                                <div className="flex justify-center">
                                    <a 
                                        href="https://chat.whatsapp.com/K3j6B1lcA42B80O1KpTLFO" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="px-6 py-3 bg-[#25D366] text-white rounded-md font-semibold hover:bg-[#128C7E] transition-colors flex items-center"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 ml-2" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                        </svg>
                                        انضم للجروب
                                    </a>
                                </div>
                                <div className="mt-6 text-center">
                                    <p className="text-sm text-gray-500">رابط مباشر:</p>
                                    <p className="text-sm text-[#7c393e] break-all">https://chat.whatsapp.com/K3j6B1lcA42B80O1KpTLFO</p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Bilgi University Group */}
                        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
                            <div className="p-8">
                                <div className="flex justify-center mb-6">
                                    <div className="w-20 h-20 rounded-full bg-[#25D366] flex items-center justify-center text-white">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                        </svg>
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold text-center text-gray-900 mb-4">جروب صحوة بلجي</h3>
                                <p className="text-gray-600 text-center mb-6">
                                    مجموعة واتساب خاصة بطلاب جامعة بلجي المهتمين بأنشطة مبادرة صحوة
                                </p>
                                <div className="flex justify-center">
                                    <a 
                                        href="https://chat.whatsapp.com/BrHWBBCth9nCyxDw4a8pdH" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="px-6 py-3 bg-[#25D366] text-white rounded-md font-semibold hover:bg-[#128C7E] transition-colors flex items-center"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 ml-2" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                        </svg>
                                        انضم للجروب
                                    </a>
                                </div>
                                <div className="mt-6 text-center">
                                    <p className="text-sm text-gray-500">رابط مباشر:</p>
                                    <p className="text-sm text-[#7c393e] break-all">chat.whatsapp.com/BrHWBBCth9nCyxDw4a8pdH</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* Social Media Section */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-[#7c393e]">تابعنا على منصات التواصل الاجتماعي</h2>
                        <p className="mt-4 text-lg text-gray-600">
                            تابع أخبار وأنشطة مبادرة صحوة على مختلف منصات التواصل الاجتماعي
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 ">
                        {/* Instagram */}
                        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow ">
                            <div className="p-8">
                                <div className="flex justify-center mb-6">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] flex items-center justify-center text-white">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                        </svg>
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold text-center text-gray-900 mb-4">Instagram</h3>
                                <p className="text-gray-600 text-center mb-6">
                                    تابعنا على انستجرام لمشاهدة صور وفيديوهات من فعاليات وأنشطة مبادرة صحوة
                                </p>
                                <div className="flex justify-center">
                                    <a 
                                        href="https://www.instagram.com/sahwa.tr/" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="px-6 py-3 bg-gradient-to-r from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white rounded-md font-semibold hover:opacity-90 transition-opacity flex items-center"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 ml-2" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                        </svg>
                                        متابعة
                                    </a>
                                </div>
                                <div className="mt-6 text-center">
                                    <p className="text-sm text-gray-500">حساب انستجرام:</p>
                                    <p className="text-sm text-[#7c393e]">@sahwa.tr</p>
                                </div>
                            </div>
                        </div>
                        
                        {/* TikTok */}
                        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
                            <div className="p-8">
                                <div className="flex justify-center mb-6">
                                    <div className="w-20 h-20 rounded-full bg-black flex items-center justify-center text-white">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                                        </svg>
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold text-center text-gray-900 mb-4">TikTok</h3>
                                <p className="text-gray-600 text-center mb-6">
                                    تابعنا على تيك توك لمشاهدة أحدث الفيديوهات القصيرة من فعاليات مبادرة صحوة
                                </p>
                                <div className="flex justify-center">
                                    <a 
                                        href="https://www.tiktok.com/@sahwa.tr?lang=ar" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="px-6 py-3 bg-black text-white rounded-md font-semibold hover:bg-gray-800 transition-colors flex items-center"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 ml-2" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                                        </svg>
                                        متابعة
                                    </a>
                                </div>
                                <div className="mt-6 text-center">
                                    <p className="text-sm text-gray-500">حساب تيك توك:</p>
                                    <p className="text-sm text-[#7c393e]">@sahwa.tr</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            

            
            {/* FAQ Section */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-[#7c393e]">أسئلة شائعة</h2>
                        <p className="mt-4 text-lg text-gray-600">
                            إجابات على الأسئلة الأكثر شيوعًا حول التواصل ومجموعات مبادرة صحوة
                        </p>
                    </div>
                    
                    <div className="max-w-3xl mx-auto space-y-6">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="font-bold text-lg text-[#7c393e] mb-2">كيف يمكنني الانضمام لجروبات الواتساب؟</h3>
                            <p className="text-gray-600">
                                يمكنك الانضمام مباشرة من خلال النقر على روابط الجروبات الموجودة في هذه الصفحة، أو نسخ الرابط والانضمام من خلال تطبيق واتساب
                            </p>
                        </div>
                        
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="font-bold text-lg text-[#7c393e] mb-2">ما هي أنواع المحتوى التي تنشرونها على منصات التواصل الاجتماعي؟</h3>
                            <p className="text-gray-600">
                                ننشر أخبار الفعاليات والأنشطة القادمة، صور ومقاطع فيديو من الأنشطة السابقة، نصائح تعليمية وتثقيفية، وإعلانات هامة للطلاب
                            </p>
                        </div>
                        
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="font-bold text-lg text-[#7c393e] mb-2">كيف يمكنني التواصل مع إدارة المبادرة؟</h3>
                            <p className="text-gray-600">
                                يمكنك التواصل معنا من خلال البريد الإلكتروني، أو الاتصال بنا مباشرة، أو إرسال رسالة عبر أي من منصات التواصل الاجتماعي
                            </p>
                        </div>
                        
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="font-bold text-lg text-[#7c393e] mb-2">هل مجموعات الواتساب مفتوحة للجميع؟</h3>
                            <p className="text-gray-600">
                                نعم، مجموعات الواتساب مفتوحة لجميع الطلاب المهتمين بأنشطة مبادرة صحوة، لكن يرجى الالتزام بقواعد وآداب المجموعة
                            </p>
                        </div>
                    </div>
                </div>
            </section>
            
            <Footer />
        </div>
    );
};

export default ContactAndGroups;
