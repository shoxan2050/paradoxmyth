import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import type { RegisterFormData, Maktab } from '../types';

// Goal step info
const goalStepInfo = {
    1: { title: "Maqsadingiz", desc: "Nimani o'rganmoqchisiz?" },
    2: { title: "Darajangiz", desc: "Hozirgi bilim darajangiz qanday?" },
    3: { title: "Jadvalingiz", desc: "Haftada necha kun o'qiysiz?" }
};

const Register: React.FC = () => {
    // Phase 1 form data
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [sinf, setSinf] = useState('');
    const [viloyat, setViloyat] = useState('');
    const [tuman, setTuman] = useState('');
    const [maktab, setMaktab] = useState('');

    // Phase 2 data
    const [goal, setGoal] = useState<'til' | 'it' | 'matematika' | ''>('');
    const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced' | ''>('');
    const [schedule, setSchedule] = useState<number | null>(null);

    // UI state
    const [phase, setPhase] = useState(1);
    const [goalStep, setGoalStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [maktablarData, setMaktablarData] = useState<Maktab[]>([]);

    const { register } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    // Load maktablar data
    useEffect(() => {
        const loadMaktablar = async () => {
            try {
                const response = await fetch('/assets/data/maktablar.json');
                const data = await response.json();
                setMaktablarData(data);
            } catch (error) {
                console.error('Maktablar yuklanmadi:', error);
            }
        };
        loadMaktablar();
    }, []);

    // Get unique viloyatlar
    const viloyatlar = [...new Set(maktablarData.map(m => m.viloyat))].sort();

    // Get tumanlar for selected viloyat
    const tumanlar = [...new Set(
        maktablarData.filter(m => m.viloyat === viloyat).map(m => m.tuman)
    )].sort();

    // Get maktablar for selected viloyat and tuman
    const maktablar = maktablarData
        .filter(m => m.viloyat === viloyat && m.tuman === tuman)
        .map(m => m.maktab)
        .sort((a, b) => {
            const aNum = parseInt(a.match(/^\d+/)?.[0] || '999');
            const bNum = parseInt(b.match(/^\d+/)?.[0] || '999');
            return aNum - bNum || a.localeCompare(b);
        });

    const handlePhase1Submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            showToast("Parollar mos kelmaydi!", 'error');
            return;
        }

        setPhase(2);
    };

    const handleGoalSelect = (selectedGoal: 'til' | 'it' | 'matematika') => {
        setGoal(selectedGoal);
    };

    const handleLevelSelect = (selectedLevel: 'beginner' | 'intermediate' | 'advanced') => {
        setLevel(selectedLevel);
    };

    const handleScheduleSelect = (days: number) => {
        setSchedule(days);
    };

    const nextGoalStep = () => {
        if (goalStep === 1 && !goal) {
            showToast("Iltimos, maqsadni tanlang", 'error');
            return;
        }
        if (goalStep === 2 && !level) {
            showToast("Iltimos, darajangizni tanlang", 'error');
            return;
        }
        if (goalStep === 3 && !schedule) {
            showToast("Iltimos, jadvalini tanlang", 'error');
            return;
        }

        if (goalStep === 3) {
            handleSubmit();
            return;
        }

        setGoalStep(prev => prev + 1);
    };

    const prevGoalStep = () => {
        if (goalStep === 1) {
            setPhase(1);
        } else {
            setGoalStep(prev => prev - 1);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await register({
                name,
                email,
                password,
                sinf,
                viloyat,
                tuman,
                maktab,
                goal: goal as 'til' | 'it' | 'matematika',
                level: level as 'beginner' | 'intermediate' | 'advanced',
                schedule: schedule!,
                role: 'student'
            });

            showToast("Hisob muvaffaqiyatli yaratildi! 🎉", 'success');
            navigate('/dashboard');
        } catch (error: any) {
            showToast(error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Card */}
                <div className="bg-white rounded-[2rem] overflow-hidden">
                    {/* Header */}
                    <div className="p-8 pb-4 text-center">
                        <h1 className="text-2xl font-bold text-gray-900 font-poppins">
                            {phase === 1 ? "Hisob yarating" : goalStepInfo[goalStep as keyof typeof goalStepInfo].title}
                        </h1>
                        <p className="text-gray-500 mt-1 text-sm">
                            {phase === 1 ? "Ma'lumotlaringizni kiriting" : goalStepInfo[goalStep as keyof typeof goalStepInfo].desc}
                        </p>
                    </div>

                    {/* PHASE 1: Basic Info Form */}
                    {phase === 1 && (
                        <form onSubmit={handlePhase1Submit} className="px-8 pb-8 animate-fade-in">
                            {/* Name */}
                            <div className="relative mb-4">
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="input-field w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 outline-none transition"
                                    placeholder=" "
                                    required
                                />
                                <label className="floating-label">Ism va Familiya</label>
                            </div>

                            {/* Email */}
                            <div className="relative mb-4">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input-field w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 outline-none transition"
                                    placeholder=" "
                                    required
                                />
                                <label className="floating-label">Email manzil</label>
                            </div>

                            {/* Password */}
                            <div className="relative mb-4">
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input-field w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 outline-none transition"
                                    placeholder=" "
                                    minLength={6}
                                    required
                                />
                                <label className="floating-label">Parol (kamida 6 ta belgi)</label>
                            </div>

                            {/* Confirm Password */}
                            <div className="relative mb-4">
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="input-field w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 outline-none transition"
                                    placeholder=" "
                                    required
                                />
                                <label className="floating-label">Parolni tasdiqlang</label>
                            </div>

                            {/* Sinf */}
                            <select
                                value={sinf}
                                onChange={(e) => setSinf(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 outline-none transition cursor-pointer mb-4"
                                required
                            >
                                <option value="">Sinfni tanlang...</option>
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(s => (
                                    <option key={s} value={s}>{s}-sinf</option>
                                ))}
                            </select>

                            {/* Viloyat */}
                            <select
                                value={viloyat}
                                onChange={(e) => { setViloyat(e.target.value); setTuman(''); setMaktab(''); }}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 outline-none transition cursor-pointer mb-4"
                                required
                            >
                                <option value="">Viloyatni tanlang...</option>
                                {viloyatlar.map(v => (
                                    <option key={v} value={v}>{v}</option>
                                ))}
                            </select>

                            {/* Tuman */}
                            <select
                                value={tuman}
                                onChange={(e) => { setTuman(e.target.value); setMaktab(''); }}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 outline-none transition cursor-pointer mb-4"
                                required
                                disabled={!viloyat}
                            >
                                <option value="">Tumanni tanlang...</option>
                                {tumanlar.map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>

                            {/* Maktab */}
                            <select
                                value={maktab}
                                onChange={(e) => setMaktab(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 outline-none transition cursor-pointer mb-6"
                                required
                                disabled={!tuman}
                            >
                                <option value="">Maktabni tanlang...</option>
                                {maktablar.map(m => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>

                            {/* Continue Button */}
                            <button
                                type="submit"
                                className="w-full py-4 bg-gray-900 text-white rounded-2xl font-semibold text-lg hover:bg-gray-800 transition"
                            >
                                Davom etish →
                            </button>
                        </form>
                    )}

                    {/* PHASE 2: Goals */}
                    {phase === 2 && (
                        <div className="px-8 pb-8 animate-slide-in">
                            {/* Step 1: Goal */}
                            {goalStep === 1 && (
                                <div className="space-y-3 mb-4">
                                    <div
                                        onClick={() => handleGoalSelect('til')}
                                        className={`choice-card rounded-2xl p-4 flex items-center gap-4 ${goal === 'til' ? 'selected' : ''}`}
                                    >
                                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-2xl shadow-lg">🌍</div>
                                        <div className="flex-1">
                                            <div className="font-semibold text-gray-900">Til o'rganish</div>
                                            <div className="text-sm text-gray-500">IELTS, CEFR darajalari, Ingliz tili</div>
                                        </div>
                                        <div className={`w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center transition-all ${goal === 'til' ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    </div>

                                    <div
                                        onClick={() => handleGoalSelect('it')}
                                        className={`choice-card rounded-2xl p-4 flex items-center gap-4 ${goal === 'it' ? 'selected' : ''}`}
                                    >
                                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl shadow-lg">💻</div>
                                        <div className="flex-1">
                                            <div className="font-semibold text-gray-900">IT va Dasturlash</div>
                                            <div className="text-sm text-gray-500">Frontend, Python, Data Science</div>
                                        </div>
                                        <div className={`w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center transition-all ${goal === 'it' ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    </div>

                                    <div
                                        onClick={() => handleGoalSelect('matematika')}
                                        className={`choice-card rounded-2xl p-4 flex items-center gap-4 ${goal === 'matematika' ? 'selected' : ''}`}
                                    >
                                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-2xl shadow-lg">📐</div>
                                        <div className="flex-1">
                                            <div className="font-semibold text-gray-900">Matematika</div>
                                            <div className="text-sm text-gray-500">Maktab kursi, Olimpiada tayyorgarlik</div>
                                        </div>
                                        <div className={`w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center transition-all ${goal === 'matematika' ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Level */}
                            {goalStep === 2 && (
                                <div className="space-y-3 mb-4">
                                    <div
                                        onClick={() => handleLevelSelect('beginner')}
                                        className={`choice-card rounded-2xl p-4 flex items-center gap-4 ${level === 'beginner' ? 'selected' : ''}`}
                                    >
                                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-2xl shadow-lg">🌱</div>
                                        <div className="flex-1">
                                            <div className="font-semibold text-gray-900">Boshlang'ich</div>
                                            <div className="text-sm text-gray-500">Endigina boshlayman, asoslarni o'rganaman</div>
                                        </div>
                                        <div className={`w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center transition-all ${level === 'beginner' ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    </div>

                                    <div
                                        onClick={() => handleLevelSelect('intermediate')}
                                        className={`choice-card rounded-2xl p-4 flex items-center gap-4 ${level === 'intermediate' ? 'selected' : ''}`}
                                    >
                                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-2xl shadow-lg">📚</div>
                                        <div className="flex-1">
                                            <div className="font-semibold text-gray-900">O'rta</div>
                                            <div className="text-sm text-gray-500">Ba'zi bilimlarim bor, chuqurlashtirmoqchiman</div>
                                        </div>
                                        <div className={`w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center transition-all ${level === 'intermediate' ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    </div>

                                    <div
                                        onClick={() => handleLevelSelect('advanced')}
                                        className={`choice-card rounded-2xl p-4 flex items-center gap-4 ${level === 'advanced' ? 'selected' : ''}`}
                                    >
                                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center text-2xl shadow-lg">🚀</div>
                                        <div className="flex-1">
                                            <div className="font-semibold text-gray-900">Yuqori</div>
                                            <div className="text-sm text-gray-500">Yaxshi bilaman, professional darajaga yetishmoqchiman</div>
                                        </div>
                                        <div className={`w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center transition-all ${level === 'advanced' ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Schedule */}
                            {goalStep === 3 && (
                                <div>
                                    <div className="text-center mb-6">
                                        <div className="text-4xl mb-2">📅</div>
                                        <p className="text-gray-600">O'qish jadvalingizni belgilang</p>
                                    </div>
                                    <div className="flex gap-3 mb-6">
                                        {[3, 5, 7].map(days => (
                                            <div
                                                key={days}
                                                onClick={() => handleScheduleSelect(days)}
                                                className={`flex-1 choice-card rounded-2xl p-4 text-center cursor-pointer ${schedule === days ? 'selected !bg-gradient-to-br !from-indigo-600 !to-purple-600 !text-white !border-indigo-600' : ''}`}
                                            >
                                                <div className={`text-3xl font-bold mb-1 ${schedule === days ? 'text-white' : 'text-gray-900'}`}>{days}</div>
                                                <div className={`text-sm ${schedule === days ? 'text-white/80' : 'text-gray-500'}`}>
                                                    {days === 7 ? 'har kuni' : 'kun/hafta'}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Streak Preview */}
                                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-4 border border-indigo-100">
                                        <div className="flex items-center gap-3">
                                            <div className="text-3xl">🔥</div>
                                            <div>
                                                <div className="font-semibold text-gray-900">Streak bilan o'qing!</div>
                                                <div className="text-sm text-gray-600">Har kuni dars qilsangiz, streak'ingiz oshadi</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Navigation Buttons */}
                            <button
                                onClick={nextGoalStep}
                                disabled={loading}
                                className="w-full py-4 bg-gray-900 text-white rounded-2xl font-semibold text-lg hover:bg-gray-800 transition mt-4 disabled:opacity-50"
                            >
                                {loading ? (
                                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                                ) : goalStep === 3 ? (
                                    "Ro'yxatdan o'tish"
                                ) : (
                                    'Davom etish'
                                )}
                            </button>

                            <button
                                onClick={prevGoalStep}
                                className="w-full py-3 mt-3 text-gray-500 font-medium hover:text-gray-700 transition"
                            >
                                ← Orqaga
                            </button>
                        </div>
                    )}
                </div>

                {/* Login Link */}
                <p className="text-center mt-6 text-gray-500">
                    Hisobingiz bormi?{' '}
                    <Link to="/login" className="text-indigo-600 font-semibold hover:underline">
                        Kirish
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
