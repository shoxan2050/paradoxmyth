import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { DbService } from '../services/db.service';
import type { Test, Question } from '../types';
import toast from 'react-hot-toast';

const TestPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const lessonId = searchParams.get('lesson');
    const subjectId = searchParams.get('subject');
    const { user } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [test, setTest] = useState<Test | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
    const [skippedIdxs, setSkippedIdxs] = useState<number[]>([]);
    const [selectedOpt, setSelectedOpt] = useState<number | null>(null);

    const [timer, setTimer] = useState(0);
    const [startTime] = useState(Date.now());
    const [fiftyFiftyUsed, setFiftyFiftyUsed] = useState(0);
    const MAX_FIFTY_FIFTY = 2;
    const [hiddenOptions, setHiddenOptions] = useState<number[]>([]);

    const [showFeedback, setShowFeedback] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);

    // Refs for timer and cleaning up
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const initTest = useCallback(async () => {
        if (!user || !subjectId || !lessonId) return;

        setLoading(true);
        try {
            const testData = await DbService.getTests(subjectId, lessonId);
            if (testData && testData.questions && testData.questions.length > 0) {
                setTest(testData);
                setQuestions(testData.questions);
                setUserAnswers(new Array(testData.questions.length).fill(null));
            } else {
                toast.error("Bu dars uchun testlar hali qo'shilmagan 📝");
                navigate(`/path?subject=${subjectId}`);
            }
        } catch (error) {
            console.error("Test load error:", error);
            toast.error("Test yuklashda xatolik! ❌");
        } finally {
            setLoading(false);
        }
    }, [user, subjectId, lessonId, navigate]);

    useEffect(() => {
        initTest();
    }, [initTest]);

    useEffect(() => {
        timerRef.current = setInterval(() => {
            setTimer(Math.floor((Date.now() - startTime) / 1000));
        }, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [startTime]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const currentQuestion = questions[currentIdx];
    const progressPercent = questions.length > 0 ? ((currentIdx + 1) / questions.length) * 100 : 0;

    const handleSelectOption = (idx: number) => {
        if (showFeedback || hiddenOptions.includes(idx)) return;
        setSelectedOpt(idx);
    };

    const useFiftyFifty = () => {
        if (fiftyFiftyUsed >= MAX_FIFTY_FIFTY) {
            toast.error("50:50 tugadi! ❌");
            return;
        }
        if (hiddenOptions.length > 0) {
            toast.error("Bu savolda 50:50 ishlatilgan!");
            return;
        }

        const correctIdx = currentQuestion.correct;
        const wrongIndices = currentQuestion.options
            .map((_, i) => i)
            .filter(i => i !== correctIdx);

        const toHide = wrongIndices.sort(() => Math.random() - 0.5).slice(0, 2);
        setHiddenOptions(toHide);
        setFiftyFiftyUsed(prev => prev + 1);
        toast.success("2 ta noto'g'ri javob olib tashlandi! ✂️");
    };

    const skipQuestion = () => {
        if (showFeedback) return;

        if (!skippedIdxs.includes(currentIdx)) {
            setSkippedIdxs(prev => [...prev, currentIdx]);
        }

        moveToNext();
    };

    const moveToNext = () => {
        setSelectedOpt(null);
        setHiddenOptions([]);
        setShowFeedback(false);

        const nextIdx = currentIdx + 1;
        if (nextIdx < questions.length) {
            setCurrentIdx(nextIdx);
        } else {
            // Revisit skipped questions or finish
            if (skippedIdxs.length > 0) {
                const nextSkipped = skippedIdxs[0];
                setSkippedIdxs(prev => prev.slice(1));
                setCurrentIdx(nextSkipped);
                toast("O'tkazilgan savollarga qaytamiz!", { icon: '🔄' });
            } else {
                finishTest();
            }
        }
    };

    const checkAnswer = () => {
        if (selectedOpt === null) return;

        const correct = selectedOpt === currentQuestion.correct;
        setIsCorrect(correct);
        setShowFeedback(true);

        const newAnswers = [...userAnswers];
        newAnswers[currentIdx] = selectedOpt;
        setUserAnswers(newAnswers);
    };

    const finishTest = async () => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (!user || !subjectId || !lessonId) return;

        setLoading(true);

        let correctCount = 0;
        const wrongQuestions: any[] = [];

        questions.forEach((q, idx) => {
            const answer = userAnswers[idx];
            if (answer === q.correct) {
                correctCount++;
            } else {
                wrongQuestions.push({
                    question: q.question,
                    userAnswer: answer !== null ? q.options[answer] : 'Javob berilmagan',
                    correctAnswer: q.options[q.correct]
                });
            }
        });

        const scorePercent = Math.round((correctCount / questions.length) * 100);

        try {
            await DbService.saveUserProgress(user.uid, subjectId, lessonId, scorePercent);
            await DbService.saveTestResult(user.uid, subjectId, lessonId, scorePercent, userAnswers.map(a => a ?? -1));

            if (wrongQuestions.length > 0) {
                sessionStorage.setItem('wrongQuestions', JSON.stringify(wrongQuestions));
            } else {
                sessionStorage.removeItem('wrongQuestions');
            }

            const confetti = scorePercent >= 70 ? '&confetti=1' : '';
            navigate(`/result?subject=${subjectId}&lesson=${lessonId}&score=${scorePercent}&correct=${correctCount}&total=${questions.length}${confetti}`);
        } catch (error) {
            console.error("Finish test error:", error);
            toast.error("Natijani saqlashda xatolik! ❌");
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent mb-4"></div>
                <p className="text-gray-400 font-medium">Test tayyorlanmoqda...</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen flex flex-col">
            <div className="h-2 w-full bg-gray-200 sticky top-0 z-20">
                <div
                    className="h-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                ></div>
            </div>

            <main className="flex-grow flex items-center justify-center p-6 pb-32">
                <div className="bg-white w-full max-w-2xl p-10 rounded-[2.5rem] shadow-xl border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-gray-400">
                                {currentIdx + 1}/{questions.length}
                            </span>
                            <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg text-sm font-bold uppercase tracking-wider">
                                {currentQuestion.difficulty || 'Oson'}
                            </span>
                        </div>
                        <span className="text-gray-400 font-mono text-lg">{formatTime(timer)}</span>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-8 leading-tight">
                        {currentQuestion.question}
                    </h2>

                    <div className="grid gap-4 mb-8">
                        {currentQuestion.options.map((opt, i) => {
                            const isSelected = selectedOpt === i;
                            const isHidden = hiddenOptions.includes(i);
                            const isCorrectOpt = showFeedback && i === currentQuestion.correct;
                            const isWrongSelected = showFeedback && isSelected && !isCorrect;

                            let btnClass = "option-btn w-full p-6 text-left border-2 rounded-2xl transition font-semibold text-lg flex items-center gap-4 ";
                            let dotClass = "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ";

                            if (isHidden) {
                                btnClass += "opacity-30 pointer-events-none line-through border-gray-100 bg-white ";
                                dotClass += "bg-gray-100 text-gray-400 ";
                            } else if (isCorrectOpt) {
                                btnClass += "border-emerald-500 bg-emerald-50 text-emerald-800 ";
                                dotClass += "bg-emerald-500 text-white ";
                            } else if (isWrongSelected) {
                                btnClass += "border-red-500 bg-red-50 text-red-800 ";
                                dotClass += "bg-red-500 text-white ";
                            } else if (isSelected) {
                                btnClass += "border-indigo-600 bg-indigo-50 text-indigo-800 ";
                                dotClass += "bg-indigo-600 text-white ";
                            } else {
                                btnClass += "border-gray-100 bg-white hover:border-indigo-500 hover:bg-indigo-50 ";
                                dotClass += "bg-gray-100 text-gray-400 ";
                            }

                            return (
                                <button
                                    key={i}
                                    disabled={showFeedback || isHidden}
                                    onClick={() => handleSelectOption(i)}
                                    className={btnClass}
                                >
                                    <span className={dotClass}>{String.fromCharCode(65 + i)}</span>
                                    {opt}
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex gap-3 mb-6">
                        <button
                            onClick={useFiftyFifty}
                            disabled={showFeedback || fiftyFiftyUsed >= MAX_FIFTY_FIFTY}
                            className={`flex-1 py-3 px-4 rounded-xl font-bold transition flex items-center justify-center gap-2 ${showFeedback || fiftyFiftyUsed >= MAX_FIFTY_FIFTY ? 'bg-gray-100 text-gray-400 opacity-50' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'}`}
                        >
                            <span className="text-xl">✂️</span> 50:50
                            <span className="text-xs bg-amber-200 px-2 py-0.5 rounded-full">{MAX_FIFTY_FIFTY - fiftyFiftyUsed}</span>
                        </button>
                        <button
                            onClick={skipQuestion}
                            disabled={showFeedback}
                            className={`flex-1 py-3 px-4 rounded-xl font-bold transition flex items-center justify-center gap-2 ${showFeedback ? 'bg-gray-100 text-gray-400 opacity-50' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            <span className="text-xl">⏭️</span> Keyinroq
                            <span className={`text-xs bg-gray-200 px-2 py-0.5 rounded-full ${skippedIdxs.length === 0 ? 'hidden' : ''}`}>
                                {skippedIdxs.length}
                            </span>
                        </button>
                    </div>

                    {!showFeedback && (
                        <button
                            onClick={checkAnswer}
                            disabled={selectedOpt === null}
                            className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-bold text-xl hover:bg-indigo-700 transition disabled:opacity-50"
                        >
                            Tekshirish
                        </button>
                    )}
                </div>
            </main>

            {/* Feedback Panel */}
            {showFeedback && (
                <div className={`fixed bottom-0 left-0 right-0 p-6 z-50 animate-in slide-in-from-bottom duration-300 ${isCorrect ? 'bg-emerald-500' : 'bg-red-500'} text-white`}>
                    <div className="max-w-2xl mx-auto">
                        <div className="flex items-center gap-4 mb-3">
                            <span className="text-4xl">{isCorrect ? '✅' : '❌'}</span>
                            <span className="text-2xl font-bold">{isCorrect ? 'To\'g\'ri!' : 'Noto\'g\'ri!'}</span>
                        </div>
                        {!isCorrect && (
                            <div className="mb-2 text-lg">
                                <strong>To'g'ri javob:</strong> {currentQuestion.options[currentQuestion.correct]}
                            </div>
                        )}
                        {currentQuestion.explanation && (
                            <div className="text-white/90 text-lg mb-4">
                                💡 {currentQuestion.explanation}
                            </div>
                        )}
                        <button
                            onClick={moveToNext}
                            className={`w-full py-4 text-white rounded-2xl font-bold text-lg transition ${isCorrect ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}
                        >
                            {currentIdx + 1 < questions.length || skippedIdxs.length > 0 ? "Keyingi savol →" : "Natijani ko'rish"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TestPage;
