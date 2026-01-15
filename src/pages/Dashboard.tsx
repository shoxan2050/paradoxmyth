import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ref, get } from 'firebase/database';
import { db } from '../services/firebase';
import type { Subject } from '../types';

const Dashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [settingsModalOpen, setSettingsModalOpen] = useState(false);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        loadSubjects();
    }, [user]);

    const loadSubjects = async () => {
        if (!user) return;

        try {
            const snapshot = await get(ref(db, 'subjects'));
            if (snapshot.exists()) {
                const data = snapshot.val();

                // Filter subjects by user's class (sinf)
                const userSinf = parseInt(user.sinf || '0');
                const subjectsList = Object.entries(data)
                    .filter(([_, val]: [string, any]) => {
                        const classes = val.classes || [];
                        const sClass = parseInt(val.class || '0');
                        return classes.includes(userSinf) || sClass === userSinf;
                    })
                    .map(([id, val]: [string, any]) => ({
                        id,
                        name: val.name,
                        icon: val.icon || '📚',
                        lessonsCount: val.lessons ? Object.keys(val.lessons).length : 0,
                    }));

                setSubjects(subjectsList);

                // Calculate real progress
                let totalLessons = 0;
                let completedLessons = 0;

                Object.entries(data).forEach(([subjId, s]: [string, any]) => {
                    const userSinf = parseInt(user.sinf || '0');
                    const isForClass = (s.classes || []).includes(userSinf) || parseInt(s.class || '0') === userSinf;

                    if (isForClass && s.lessons) {
                        const lessons = Object.keys(s.lessons);
                        totalLessons += lessons.length;

                        lessons.forEach(lId => {
                            const score = user.progress?.[subjId]?.[lId] || 0;
                            if (score >= 70) {
                                completedLessons++;
                            }
                        });
                    }
                });

                if (totalLessons > 0) {
                    const progressPercent = Math.round((completedLessons / totalLessons) * 100);
                    setProgress(progressPercent);
                } else {
                    setProgress(0);
                }
            }
        } catch (error) {
            console.error('Error loading subjects or progress:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        showToast("Chiqish muvaffaqiyatli", 'success');
        navigate('/login');
    };

    // Calculate progress circle offset
    const circleOffset = 264 - (264 * progress) / 100;

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Navbar */}
            <nav className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-2 text-xl font-bold text-indigo-600">
                    <span>🎯</span> EduPlatform
                </div>
                <div className="flex items-center gap-4">
                    {(user?.role === 'teacher' || user?.role === 'admin') && (
                        <Link to="/teacher" className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition">
                            👨‍🏫 O'qituvchi paneli
                        </Link>
                    )}
                    <span className="text-gray-700 font-medium">{user?.name || 'O\'quvchi'}</span>
                    <div className="relative">
                        <button
                            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                            className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold hover:bg-indigo-700 transition"
                        >
                            👤
                        </button>
                        {profileDropdownOpen && (
                            <div className="absolute top-12 right-0 bg-white rounded-2xl shadow-xl border border-gray-100 w-56 p-2 z-50">
                                {(user?.role === 'teacher' || user?.role === 'admin') && (
                                    <button
                                        onClick={() => navigate('/teacher')}
                                        className="w-full p-3 text-left hover:bg-gray-50 rounded-xl text-gray-700"
                                    >
                                        👨‍🏫 O'qituvchi paneli
                                    </button>
                                )}
                                <button
                                    onClick={() => { setSettingsModalOpen(true); setProfileDropdownOpen(false); }}
                                    className="w-full p-3 text-left hover:bg-gray-50 rounded-xl text-gray-700"
                                >
                                    ⚙️ Sozlamalar
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="w-full p-3 text-left hover:bg-red-50 rounded-xl text-red-500"
                                >
                                    🚪 Chiqish
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto p-6 space-y-8">
                {/* Profile & Streak Header */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 font-poppins">
                                Xayrli kun, <span>{user?.name?.split(' ')[0] || 'O\'quvchi'}</span>! 👋
                            </h2>
                            <p className="text-gray-500 mt-2">Bugungi o'rganish marrangizni zabt etishga tayyormisiz?</p>
                            {user?.maktab && (
                                <p className="text-indigo-600 text-sm font-medium mt-1">🏫 {user.maktab}</p>
                            )}
                        </div>
                        <div className="hidden sm:block text-6xl">🚀</div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-400 to-red-500 p-8 rounded-3xl shadow-lg text-white text-center flex flex-col justify-center items-center">
                        <div className="text-4xl mb-2">🔥</div>
                        <div className="text-4xl font-bold">{user?.streak || 0}</div>
                        <div className="uppercase tracking-widest text-sm opacity-90">Kunlik Streak</div>
                    </div>
                </div>

                {/* Progress Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center">
                        <div className="relative flex items-center justify-center mb-4" style={{ width: '120px', height: '120px' }}>
                            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                                <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100" />
                                <circle
                                    cx="50" cy="50" r="42"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    fill="transparent"
                                    strokeDasharray="264"
                                    strokeDashoffset={circleOffset}
                                    strokeLinecap="round"
                                    className="text-indigo-600 transition-all duration-1000"
                                />
                            </svg>
                            <span className="absolute text-2xl font-bold text-gray-800">{progress}%</span>
                        </div>
                        <p className="text-gray-600 font-medium">Umumiy progress</p>
                    </div>

                    {/* Learning Path Button */}
                    <Link
                        to="/path"
                        className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-3xl shadow-lg text-white flex flex-col justify-center items-center cursor-pointer hover:scale-105 transition-transform"
                    >
                        <div className="text-4xl mb-2">🛤️</div>
                        <div className="text-xl font-bold">Yo'llar</div>
                        <div className="text-sm opacity-80">Mavzularni o'rganish</div>
                    </Link>

                    <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 font-poppins">Bugungi topshiriq (3-5 daqiqa)</h3>
                        <div className="p-5 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-2xl">📖</div>
                                <div>
                                    <p className="font-bold text-gray-900">Yangi mavzu: Kirish</p>
                                    <p className="text-sm text-gray-500">Mavzuni o'qing va 3 ta savolga javob bering</p>
                                </div>
                            </div>
                            <Link to="/path" className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition">
                                Boshlash
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Subjects List */}
                <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 font-poppins">Mening fanlarim</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {loading ? (
                            <div className="p-6 bg-white rounded-2xl border border-gray-100 animate-pulse">
                                <div className="h-4 bg-gray-100 rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-gray-50 rounded w-1/2"></div>
                            </div>
                        ) : subjects.length > 0 ? (
                            subjects.map(subject => (
                                <Link
                                    key={subject.id}
                                    to={`/path?subject=${subject.id}`}
                                    className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg hover:scale-105 transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center text-2xl">
                                            {subject.icon}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">{subject.name}</h4>
                                            <p className="text-sm text-gray-500">{subject.lessonsCount || 0} ta dars</p>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="col-span-3 text-center py-12 text-gray-400">
                                <div className="text-4xl mb-4">📚</div>
                                <p>Hozircha fanlar mavjud emas</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Badges Section */}
                <div className="mt-10">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 font-poppins">🎖️ Mening Badgelarim</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 text-center">
                            <span className={`text-4xl ${user?.streak && user.streak >= 7 ? '' : 'grayscale opacity-30'}`}>💎</span>
                            <div className="text-sm text-gray-400 mt-2">Olmoschi</div>
                            <div className="text-xs text-gray-300">7 kun streak</div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 text-center">
                            <span className="text-4xl grayscale opacity-30">⭐</span>
                            <div className="text-sm text-gray-400 mt-2">Mukammal</div>
                            <div className="text-xs text-gray-300">100% natija</div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 text-center">
                            <span className="text-4xl grayscale opacity-30">🏆</span>
                            <div className="text-sm text-gray-400 mt-2">Chempion</div>
                            <div className="text-xs text-gray-300">Haftalik top</div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 text-center">
                            <span className={`text-4xl ${user?.streak && user.streak >= 3 ? '' : 'grayscale opacity-30'}`}>🔥</span>
                            <div className="text-sm text-gray-400 mt-2">O'tga tushdi</div>
                            <div className="text-xs text-gray-300">3 kun streak</div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Mobile Bottom Navigation */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 safe-area-bottom">
                <div className="flex justify-around items-center py-2">
                    <Link to="/dashboard" className="flex flex-col items-center gap-1 p-2 text-indigo-600">
                        <span className="text-xl">📊</span>
                        <span className="text-xs font-semibold">Dashboard</span>
                    </Link>
                    <Link to="/path" className="flex flex-col items-center gap-1 p-2 text-gray-400 hover:text-indigo-600">
                        <span className="text-xl">🛤️</span>
                        <span className="text-xs font-semibold">Yo'llar</span>
                    </Link>
                    <button className="flex flex-col items-center gap-1 p-2 text-gray-400 hover:text-indigo-600">
                        <span className="text-xl">📝</span>
                        <span className="text-xs font-semibold">Testlar</span>
                    </button>
                    <button
                        onClick={() => setSettingsModalOpen(true)}
                        className="flex flex-col items-center gap-1 p-2 text-gray-400 hover:text-indigo-600"
                    >
                        <span className="text-xl">👤</span>
                        <span className="text-xs font-semibold">Profil</span>
                    </button>
                </div>
            </nav>

            {/* Mobile nav padding */}
            <div className="lg:hidden h-20"></div>

            {/* Settings Modal */}
            {settingsModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white flex justify-between items-center">
                            <h2 className="text-2xl font-bold font-poppins">⚙️ Sozlamalar</h2>
                            <button onClick={() => setSettingsModalOpen(false)} className="text-white/80 hover:text-white text-2xl">✕</button>
                        </div>
                        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                            {/* Theme Section */}
                            <div>
                                <h3 className="font-bold text-gray-900 mb-3">🎨 Mavzu</h3>
                                <div className="grid grid-cols-5 gap-3">
                                    <button className="flex flex-col items-center gap-2 p-3 rounded-2xl border-2 border-indigo-500 bg-indigo-50 transition">
                                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-xl">☀️</div>
                                        <span className="text-xs text-gray-500">Yorug'</span>
                                    </button>
                                    <button className="flex flex-col items-center gap-2 p-3 rounded-2xl border-2 border-transparent hover:border-indigo-500 transition">
                                        <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center text-xl">🌙</div>
                                        <span className="text-xs text-gray-500">Qorong'i</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-100 flex justify-end">
                            <button
                                onClick={() => setSettingsModalOpen(false)}
                                className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700"
                            >
                                Yopish
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
