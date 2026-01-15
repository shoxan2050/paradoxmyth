import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Landing: React.FC = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="bg-gray-50 text-gray-900">
            {/* Navigation */}
            <nav className="fixed w-full z-50 glass border-b border-gray-200/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20 items-center">
                        <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-indigo-600 hover:text-indigo-700 transition">
                            <span className="text-3xl">🎯</span> EduPlatform
                        </Link>

                        {/* Desktop Menu */}
                        <div className="hidden md:flex items-center gap-6">
                            <a href="#how-it-works" className="font-medium text-gray-600 hover:text-indigo-600 transition">Qanday ishlaydi?</a>
                            <a href="#features" className="font-medium text-gray-600 hover:text-indigo-600 transition">Imkoniyatlar</a>
                            <a href="#testimonials" className="font-medium text-gray-600 hover:text-indigo-600 transition">Fikrlar</a>
                            <div className="flex items-center gap-3 ml-4">
                                <Link to="/login" className="px-5 py-2.5 text-indigo-600 font-semibold hover:bg-indigo-50 rounded-xl transition">Kirish</Link>
                                <Link to="/register" className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200/50">Ro'yxatdan o'tish</Link>
                            </div>
                        </div>

                        {/* Mobile Menu Button */}
                        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-gray-600 hover:text-indigo-600 transition">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-white/95 backdrop-blur-lg border-b border-gray-100 p-6 flex flex-col gap-4">
                        <a href="#how-it-works" className="py-3 text-lg font-medium text-gray-600 border-b border-gray-100 hover:text-indigo-600 transition">Qanday ishlaydi?</a>
                        <a href="#features" className="py-3 text-lg font-medium text-gray-600 border-b border-gray-100 hover:text-indigo-600 transition">Imkoniyatlar</a>
                        <a href="#testimonials" className="py-3 text-lg font-medium text-gray-600 border-b border-gray-100 hover:text-indigo-600 transition">Fikrlar</a>
                        <div className="flex flex-col gap-3 pt-4">
                            <Link to="/login" className="w-full py-4 text-center text-indigo-600 font-bold bg-indigo-50 rounded-2xl hover:bg-indigo-100 transition">Kirish</Link>
                            <Link to="/register" className="w-full py-4 text-center text-white font-bold bg-indigo-600 rounded-2xl shadow-lg hover:bg-indigo-700 transition">Ro'yxatdan o'tish</Link>
                        </div>
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-24 px-4 bg-gradient-hero relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-200/30 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl"></div>

                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-6">
                        <span className="animate-pulse">🚀</span> 10,000+ foydalanuvchilar bilan qo'shiling
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold mb-6 text-gray-900 leading-tight font-poppins">
                        Bilim olish endi <br className="hidden sm:block" />
                        <span className="bg-clip-text text-transparent bg-gradient-custom">qiziqarli va oson</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
                        Duolingo uslubidagi roadmap, interaktiv testlar va natijalarni kuzatish tizimi bilan yangi marralarni zabt eting.
                    </p>

                    {/* Hero CTA */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link to="/register" className="group px-10 py-5 bg-gradient-custom text-white rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-indigo-300/50 transition-all duration-300 flex items-center gap-2 animate-pulse-glow">
                            <span>Boshlash</span>
                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </Link>
                        <a href="#preview" className="group px-10 py-5 bg-white text-indigo-600 border-2 border-indigo-200 rounded-2xl font-bold text-lg hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-300 flex items-center gap-2 shadow-lg">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                            <span>Demo ko'rish</span>
                        </a>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="py-24 bg-white relative">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <span className="inline-block px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold mb-4">QANDAY ISHLAYDI?</span>
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-poppins">5 oddiy qadamda muvaffaqiyatga</h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">O'qishni boshlash juda oson. Quyidagi qadamlarni bajaring va o'z yo'lingizni boshlang.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
                        {/* Step 1 */}
                        <div className="step-card connector-line">
                            <div className="card-gradient-1 rounded-3xl p-6 text-white text-center shadow-xl shadow-indigo-200/50">
                                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 animate-float">📝</div>
                                <div className="text-xs font-bold opacity-70 mb-2">1-QADAM</div>
                                <h3 className="text-lg font-bold mb-2 font-poppins">Ro'yxatdan o'tish</h3>
                                <p className="text-sm opacity-90">Email va parol bilan 30 soniyada ro'yxatdan o'ting</p>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="step-card connector-line">
                            <div className="card-gradient-2 rounded-3xl p-6 text-white text-center shadow-xl shadow-pink-200/50">
                                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 animate-float" style={{ animationDelay: '0.5s' }}>🎯</div>
                                <div className="text-xs font-bold opacity-70 mb-2">2-QADAM</div>
                                <h3 className="text-lg font-bold mb-2 font-poppins">Maqsad tanlash</h3>
                                <p className="text-sm opacity-90">Fan va sinfingizni tanlang, shaxsiy yo'l yaratiladi</p>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="step-card connector-line">
                            <div className="card-gradient-3 rounded-3xl p-6 text-white text-center shadow-xl shadow-blue-200/50">
                                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 animate-float" style={{ animationDelay: '1s' }}>🗺️</div>
                                <div className="text-xs font-bold opacity-70 mb-2">3-QADAM</div>
                                <h3 className="text-lg font-bold mb-2 font-poppins">Roadmap</h3>
                                <p className="text-sm opacity-90">Shaxsiy o'quv yo'lingiz bo'ylab ilgarilab boring</p>
                            </div>
                        </div>

                        {/* Step 4 */}
                        <div className="step-card connector-line">
                            <div className="card-gradient-4 rounded-3xl p-6 text-white text-center shadow-xl shadow-emerald-200/50">
                                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 animate-float" style={{ animationDelay: '1.5s' }}>📊</div>
                                <div className="text-xs font-bold opacity-70 mb-2">4-QADAM</div>
                                <h3 className="text-lg font-bold mb-2 font-poppins">Testlar</h3>
                                <p className="text-sm opacity-90">Interaktiv testlar bilan bilimingizni mustahkamlang</p>
                            </div>
                        </div>

                        {/* Step 5 */}
                        <div className="step-card">
                            <div className="card-gradient-5 rounded-3xl p-6 text-white text-center shadow-xl shadow-orange-200/50">
                                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 animate-float" style={{ animationDelay: '2s' }}>🏆</div>
                                <div className="text-xs font-bold opacity-70 mb-2">5-QADAM</div>
                                <h3 className="text-lg font-bold mb-2 font-poppins">Sertifikat</h3>
                                <p className="text-sm opacity-90">Kursni tugating va sertifikatingizni oling</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <span className="inline-block px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold mb-4">IMKONIYATLAR</span>
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-poppins">Nima uchun EduPlatform?</h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">Zamonaviy o'qitish usullari va gamifikatsiya elementlari</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="p-8 rounded-3xl bg-indigo-50 border border-indigo-100 hover:scale-105 transition duration-300">
                            <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-4xl mb-6">🗺️</div>
                            <h3 className="text-2xl font-bold mb-3 text-gray-900 font-poppins">O'rganish Yo'li</h3>
                            <p className="text-gray-600 leading-relaxed">Har bir fan uchun Duolingo kabi bosqichma-bosqich roadmap. Yopiq darslarni ochish uchun testlardan o'ting.</p>
                        </div>
                        <div className="p-8 rounded-3xl bg-purple-50 border border-purple-100 hover:scale-105 transition duration-300">
                            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center text-4xl mb-6">🔥</div>
                            <h3 className="text-2xl font-bold mb-3 text-gray-900 font-poppins">Streak va Progress</h3>
                            <p className="text-gray-600 leading-relaxed">Har kuni dars qiling va o'z streak'ingizni saqlang. Progressingizni circular diagrammalarda kuzating.</p>
                        </div>
                        <div className="p-8 rounded-3xl bg-emerald-50 border border-emerald-100 hover:scale-105 transition duration-300">
                            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-4xl mb-6">👨‍🏫</div>
                            <h3 className="text-2xl font-bold mb-3 text-gray-900 font-poppins">O'qituvchilar uchun</h3>
                            <p className="text-gray-600 leading-relaxed">Excel formatida reja yuklash, testlar yaratish va o'quvchilar statistikasini boshqarish paneli.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-gradient-custom relative overflow-hidden">
                <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-poppins">O'qishni bugundan boshlang</h2>
                    <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">Minglab o'quvchilarga qo'shiling va o'z yo'lingizni yarating. Bepul ro'yxatdan o'ting!</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/register" className="px-10 py-5 bg-white text-indigo-600 rounded-2xl font-bold text-lg hover:bg-gray-100 transition shadow-xl flex items-center justify-center gap-2">
                            Bepul boshlash
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </Link>
                        <Link to="/login" className="px-10 py-5 bg-transparent text-white border-2 border-white/50 rounded-2xl font-bold text-lg hover:bg-white/10 transition flex items-center justify-center gap-2">
                            Kirish
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 bg-gray-900 text-gray-400">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-2 text-2xl font-bold text-white">
                            <span className="text-3xl">🎯</span> EduPlatform
                        </div>
                        <div className="flex items-center gap-8">
                            <a href="#features" className="hover:text-white transition">Imkoniyatlar</a>
                            <a href="#how-it-works" className="hover:text-white transition">Qanday ishlaydi?</a>
                            <a href="#testimonials" className="hover:text-white transition">Fikrlar</a>
                        </div>
                        <div className="text-sm">
                            © 2026 EduPlatform. Barcha huquqlar himoyalangan.
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
