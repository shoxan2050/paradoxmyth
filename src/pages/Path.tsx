import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { DbService } from '../services/db.service';
import type { Subject, Lesson } from '../types';
import toast from 'react-hot-toast';
import Navbar from '../components/layout/Navbar';

const Path: React.FC = () => {
    const [searchParams] = useSearchParams();
    const subjectId = searchParams.get('subject');
    const { user } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [subject, setSubject] = useState<Subject | null>(null);
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [overallProgress, setOverallProgress] = useState(0);
    const [completedCount, setCompletedCount] = useState(0);

    useEffect(() => {
        const loadPathData = async () => {
            if (!user) return;

            setLoading(true);
            try {
                if (!subjectId) {
                    // No subject selected, show subject list
                    const studentClass = parseInt(user.sinf || '0');
                    const subjectsObj = await DbService.getSubjectsByClass(studentClass);
                    setSubjects(Object.entries(subjectsObj).map(([id, s]) => ({ ...s, id })));
                    setLoading(false);
                    return;
                }

                // Load specific subject
                const subjData = await DbService.getSubject(subjectId);
                if (!subjData) {
                    toast.error("Fan topilmadi! 🤷‍♂️");
                    navigate('/path');
                    return;
                }

                setSubject({ ...subjData, id: subjectId });

                const userClass = parseInt(user.sinf || '0');
                const lessonsObj = subjData.lessons || {};
                const pathOrder = subjData.path || [];

                // Build sorted and filtered list
                const studentLessons: Lesson[] = [];
                pathOrder.forEach(uuid => {
                    const lesson = lessonsObj[uuid];
                    if (lesson && (!lesson.sinf || lesson.sinf === userClass)) {
                        studentLessons.push({ ...lesson, id: uuid });
                    }
                });

                // If path is empty, just use all lessons
                if (studentLessons.length === 0) {
                    Object.entries(lessonsObj).forEach(([id, lesson]) => {
                        if (!lesson.sinf || lesson.sinf === userClass) {
                            studentLessons.push({ ...lesson, id });
                        }
                    });
                    studentLessons.sort((a, b) => (a.order || 0) - (b.order || 0));
                }

                setLessons(studentLessons);

                // Calculate progress
                const userProgress = user.progress || {};
                const subjectProgress = userProgress[subjectId] || {};
                let done = 0;
                studentLessons.forEach(lesson => {
                    if ((subjectProgress[lesson.id] || 0) >= 70) done++;
                });
                setCompletedCount(done);
                if (studentLessons.length > 0) {
                    setOverallProgress(Math.round((done / studentLessons.length) * 100));
                }

            } catch (error) {
                console.error("Path load error", error);
                toast.error("Xarita yuklashda xatolik! ❌");
            } finally {
                setLoading(false);
            }
        };

        loadPathData();
    }, [subjectId, user, navigate]);

    const getNodeStatus = (index: number) => {
        if (!user || !subjectId) return 'locked';
        const userProgress = user.progress || {};
        const subjectProgress = userProgress[subjectId] || {};
        const currentLesson = lessons[index];
        const score = subjectProgress[currentLesson.id] || 0;

        if (score >= 70) return 'completed';

        if (index === 0) return 'current';

        const prevLesson = lessons[index - 1];
        const prevScore = subjectProgress[prevLesson.id] || 0;
        if (prevScore >= 70) return 'current';

        return 'locked';
    };

    const getMarginClass = (index: number) => {
        const mod = index % 4;
        switch (mod) {
            case 1: return 'sm:ml-20 ml-10';
            case 3: return 'sm:-ml-20 -ml-10';
            default: return 'ml-0';
        }
    };

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-emerald-500 text-white border-emerald-600 shadow-emerald-200';
            case 'current': return 'bg-indigo-600 text-white border-indigo-700 shadow-xl scale-110 ring-4 ring-indigo-100';
            default: return 'bg-white text-gray-300 border-gray-200 opacity-60 grayscale';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mb-4"></div>
                <p className="text-gray-400 font-medium">Yo'l xaritasi tayyorlanmoqda...</p>
            </div>
        );
    }

    if (!subjectId) {
        return (
            <div className="min-h-screen bg-gray-50 pb-20">
                <Navbar showBackButton={true} title="Fanni tanlang" />

                <div className="max-w-md mx-auto mt-10 px-6">
                    {subjects.length === 0 ? (
                        <div className="py-20 text-center">
                            <p className="text-xl text-gray-500 mb-6">Hali fanlar qo'shilmagan. 📚</p>
                            <Link to="/dashboard" className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold transition shadow-lg shadow-indigo-200 inline-block">
                                Dashboard ga qaytish
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-center text-gray-500 mb-8">Qaysi fanni o'rganmoqchisiz?</p>
                            {subjects.map(s => (
                                <Link key={s.id} to={`/path?subject=${s.id}`} className="block p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-indigo-500 hover:shadow-lg transition">
                                    <div className="flex items-center gap-4">
                                        <span className="text-4xl">{s.icon || '📚'}</span>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">{s.name}</h3>
                                            <p className="text-sm text-gray-500">{Object.keys(s.lessons || {}).length} mavzu</p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Navbar showBackButton={true} title={subject?.name || "Fan Yo'li"} />

            <div className="max-w-md mx-auto mt-10 flex flex-col items-center px-6">
                <div className="w-full mb-8 p-6 bg-white rounded-3xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-gray-500">Umumiy progress</span>
                        <span className="text-2xl font-bold text-indigo-600">{overallProgress}%</span>
                    </div>
                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 rounded-full transition-all duration-1000" style={{ width: `${overallProgress}%` }}></div>
                    </div>
                    <div className="text-sm text-gray-400 mt-2">{completedCount}/{lessons.length} mavzu tugatildi</div>
                </div>

                {lessons.length === 0 ? (
                    <div className="py-20 text-center">
                        <p className="text-xl text-gray-500 mb-6">Hali darslar yo'q. 📖</p>
                        <Link to="/path" className="px-8 py-4 bg-gray-200 text-gray-600 rounded-2xl font-bold transition inline-block">
                            Orqaga
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-12 flex flex-col items-center w-full">
                        {lessons.map((lesson, index) => {
                            const status = getNodeStatus(index);
                            const score = (user?.progress?.[subjectId!]?.[lesson.id]) || 0;

                            return (
                                <div
                                    key={lesson.id}
                                    className={`flex flex-col items-center ${getMarginClass(index)} cursor-pointer group`}
                                    onClick={() => {
                                        if (status === 'locked') {
                                            toast.error("Ushbu dars qulflangan! Oldingi darsni 70% dan yuqori yakunlang. 🔒");
                                        } else {
                                            navigate(`/test?subject=${subjectId}&lesson=${lesson.id}`);
                                        }
                                    }}
                                >
                                    <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl relative transition-transform ${status === 'current' ? 'scale-110' : 'hover:scale-105 active:scale-95'} ${getStatusClass(status)} shadow-lg`}>
                                        {status === 'locked' ? '🔒' : (lesson.icon || '📚')}
                                        {status === 'completed' && (
                                            <div className="absolute -top-1 -right-1 bg-emerald-500 text-white rounded-full p-1 border-2 border-white">
                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                                                </svg>
                                            </div>
                                        )}
                                        {score > 0 && score < 70 && (
                                            <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
                                                {score}%
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-3 text-center transition group-hover:scale-105">
                                        <span className="text-sm font-bold text-gray-700 block">{lesson.title}</span>
                                        <span className="text-xs text-gray-400 shadow-sm uppercase tracking-tighter">
                                            {status === 'completed' ? `✅ ${score}%` : (status === 'locked' ? '🔒 Qulflangan' : '▶️ Boshlash')}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Path;
