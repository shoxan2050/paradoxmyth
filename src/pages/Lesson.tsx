import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { DbService } from '../services/db.service';
import type { Lesson } from '../types';
import toast from 'react-hot-toast';

const LessonPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const lessonId = searchParams.get('lesson');
    const subjectId = searchParams.get('subject');
    const { user } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [lesson, setLesson] = useState<Lesson | null>(null);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const loadLessonData = async () => {
            if (!user || !lessonId || !subjectId) {
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const lessonData = await DbService.getLesson(subjectId, lessonId);
                if (lessonData) {
                    setLesson({ ...lessonData, id: lessonId });

                    const userProgress = user.progress || {};
                    const score = userProgress[subjectId]?.[lessonId] || 0;
                    setProgress(score);
                } else {
                    toast.error("Dars topilmadi! 🤷‍♂️");
                    navigate(`/path?subject=${subjectId}`);
                }
            } catch (error) {
                console.error("Lesson load error", error);
                toast.error("Darsni yuklashda xatolik! ❌");
            } finally {
                setLoading(false);
            }
        };

        loadLessonData();
    }, [lessonId, subjectId, user, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mb-4"></div>
                <p className="text-gray-400 font-medium">Dars yuklanmoqda...</p>
            </div>
        );
    }

    if (!lesson) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
                <span className="text-6xl mb-6">❌</span>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Dars topilmadi</h1>
                <p className="text-xl text-gray-600 mb-10 text-center">Ushbu dars topilmadi yoki hali yuklanmagan.</p>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
                >
                    Bosh sahifaga qaytish
                </button>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen flex flex-col">
            {/* Progress Bar */}
            <div className="h-2 w-full bg-gray-200 sticky top-0 z-20">
                <div
                    className="h-full bg-indigo-600 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>

            <nav className="p-6">
                <Link
                    to={`/path?subject=${subjectId}`}
                    className="p-2 hover:bg-gray-100 rounded-xl transition inline-block"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                    </svg>
                </Link>
            </nav>

            <main className="flex-grow flex items-center justify-center p-6">
                <div className="bg-white w-full max-w-2xl p-10 rounded-[2.5rem] shadow-xl border border-gray-100 animate-in fade-in zoom-in duration-500">
                    <div id="lessonContent">
                        <span className="text-6xl mb-6 block drop-shadow-sm text-center">
                            {lesson.icon || "📚"}
                        </span>
                        <h1 className="text-3xl font-bold text-gray-900 mb-4 text-center">
                            {lesson.title}
                        </h1>

                        <div className="text-xl text-gray-600 leading-relaxed mb-10 space-y-4">
                            <p className="font-bold mb-4">Mavzu: {lesson.title}</p>

                            {lesson.content && (
                                <div className="whitespace-pre-wrap mb-8 text-gray-700">
                                    {lesson.content}
                                </div>
                            )}

                            <div className="mt-8 p-6 bg-indigo-50 rounded-2xl border border-indigo-100 italic">
                                <strong>Vazifa: </strong>
                                <span>{lesson.homework || "Hali vazifa qo'shilmagan."}</span>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate(`/test?subject=${subjectId}&lesson=${lessonId}`)}
                            className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-bold text-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
                        >
                            Tushunarli!
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default LessonPage;
