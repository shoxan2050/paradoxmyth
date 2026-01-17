import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';


const ResultPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const subjectId = searchParams.get('subject') || '';
    const lessonId = searchParams.get('lesson') || '';
    const score = parseInt(searchParams.get('score') || '0');
    const correct = searchParams.get('correct');
    const total = searchParams.get('total');
    const showConfetti = searchParams.get('confetti') === '1';

    const navigate = useNavigate();
    const [hasWrongQuestions, setHasWrongQuestions] = useState(false);

    useEffect(() => {
        if (showConfetti) {
            const duration = 3 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

            const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

            const interval = setInterval(() => {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);

                confetti({
                    ...defaults,
                    particleCount,
                    origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
                    colors: ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
                });
                confetti({
                    ...defaults,
                    particleCount,
                    origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
                    colors: ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
                });
            }, 250);

            return () => clearInterval(interval);
        }
    }, [showConfetti]);

    useEffect(() => {
        const wrong = sessionStorage.getItem('wrongQuestions');
        setHasWrongQuestions(!!wrong);
    }, []);

    const getResultFeedback = () => {
        if (score >= 70) {
            return {
                emoji: '🎉',
                title: 'Tabriklaymiz!',
                desc: 'Siz darsni muvaffaqiyatli yakunladingiz',
                levelUpBadge: true
            };
        } else if (score >= 50) {
            return {
                emoji: '🤔',
                title: "Yaxshiroq bo'lishi mumkin",
                desc: "Mavzuni qayta o'qib chiqishni tavsiya qilamiz",
                levelUpBadge: false
            };
        } else {
            return {
                emoji: '😔',
                title: "Qayta urinib ko'ring",
                desc: "Mavzuni yaxshilab o'rganing va qayta topshiring",
                levelUpBadge: false
            };
        }
    };

    const feedback = getResultFeedback();

    return (
        <div className="bg-gray-50 min-h-screen flex items-center justify-center p-6">
            <div className="bg-white w-full max-w-md p-10 rounded-[2.5rem] shadow-2xl border border-gray-100 text-center animate-in zoom-in duration-500 relative z-10">

                {feedback.levelUpBadge && (
                    <div className="bg-gradient-to-r from-amber-400 to-amber-600 text-white px-6 py-3 rounded-2xl font-bold text-lg mb-6 shadow-lg animate-bounce">
                        🎖️ Yangi daraja ochildi!
                    </div>
                )}

                <div className="text-8xl mb-6 animate-pulse">{feedback.emoji}</div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{feedback.title}</h1>
                <p className="text-gray-500 mb-8">{feedback.desc}</p>

                <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 mb-8">
                    <div className="flex flex-col items-center justify-center min-h-[80px]">
                        <div className="text-5xl font-bold text-indigo-600 mb-1">{score}%</div>
                    </div>
                    <div className="text-indigo-400 font-semibold uppercase tracking-widest text-sm">To'g'ri javoblar</div>
                    {correct && total && (
                        <div className="text-sm text-gray-500 mt-2">{correct} / {total} savol</div>
                    )}
                </div>

                <div className="space-y-3">
                    <Link
                        to={`/path?subject=${subjectId}`}
                        className="flex items-center justify-center gap-3 w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-bold text-lg hover:opacity-90 transition shadow-lg"
                    >
                        Keyingi →
                    </Link>

                    <Link
                        to={`/test?subject=${subjectId}&lesson=${lessonId}`}
                        className="block w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 text-center"
                    >
                        🔄 Qayta topshirish
                    </Link>

                    {hasWrongQuestions && (
                        <button
                            onClick={() => navigate(`/test?subject=${subjectId}&lesson=${lessonId}&retry=1`)}
                            className="block w-full py-4 bg-amber-500 text-white rounded-2xl font-bold text-lg hover:bg-amber-600 transition shadow-lg shadow-amber-200 text-center"
                        >
                            🎯 Xatolar bilan ishlash
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResultPage;
