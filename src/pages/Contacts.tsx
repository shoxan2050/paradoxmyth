import React from 'react';
import { Link } from 'react-router-dom';

const Contacts: React.FC = () => {
    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Header */}
            <nav className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4 flex justify-between items-center sticky top-0 z-10">
                <Link to="/" className="flex items-center gap-2 text-xl font-bold text-indigo-600">
                    <span className="text-2xl">🎯</span> EduPlatform
                </Link>
                <Link to="/" className="text-gray-600 hover:text-indigo-600 transition">← Orqaga</Link>
            </nav>

            <main className="max-w-4xl mx-auto p-6 py-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">📞 Aloqa</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Contact Info */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Bog'lanish</h2>

                        <div className="space-y-6">
                            {/* Phone */}
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-2xl">📞</div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Telefon</h3>
                                    <p className="text-gray-600">+998 70 116 38 04</p>
                                    <p className="text-gray-600">+998 50 100 41 75</p>
                                </div>
                            </div>

                            {/* Telegram */}
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-2xl">✈️</div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Telegram</h3>
                                    <a href="https://t.me/jun1or_person" target="_blank" rel="noopener noreferrer"
                                        className="text-indigo-600 hover:text-indigo-800 transition">
                                        @jun1or_person
                                    </a>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-2xl">✉️</div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Email</h3>
                                    <a href="mailto:boburjonbaratov97@gmail.com"
                                        className="text-indigo-600 hover:text-indigo-800 transition">
                                        boburjonbaratov97@gmail.com
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Partnership */}
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl p-8 text-white">
                        <h2 className="text-2xl font-bold mb-4">🤝 Hamkorlik</h2>
                        <p className="text-white/80 mb-6">
                            EduPlatform bilan hamkorlik qilishni xohlaysizmi? Biz bilan bog'laning va birgalikda ta'lim sifatini oshiramiz!
                        </p>
                        <ul className="space-y-3 text-white/90">
                            <li className="flex items-center gap-2">
                                <span>✅</span> O'quv muassasalari uchun maxsus shartlar
                            </li>
                            <li className="flex items-center gap-2">
                                <span>✅</span> O'qituvchilar uchun bepul akkaunt
                            </li>
                            <li className="flex items-center gap-2">
                                <span>✅</span> Texnik qo'llab-quvvatlash
                            </li>
                        </ul>
                        <a href="https://t.me/jun1or_person" target="_blank" rel="noopener noreferrer"
                            className="mt-8 block w-full py-4 bg-white text-indigo-600 rounded-2xl font-bold text-center hover:bg-gray-100 transition">
                            Telegram orqali bog'lanish
                        </a>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Contacts;
