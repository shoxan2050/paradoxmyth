import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { DbService } from '../services/db.service';
import { AiService } from '../services/ai.service';
import { auth } from '../services/firebase';
import { Link, useNavigate } from 'react-router-dom';
import type { Subject, User } from '../types';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

const SUBJECTS_BY_CLASS: Record<string, string[]> = {
    "1": ["Ona tili va o‘qish savodxonligi", "Matematika", "Atrofimizdagi olam", "Tasviriy san’at", "Musiqa", "Texnologiya (mehnat)", "Jismoniy tarbiya"],
    "2": ["Ona tili", "O‘qish", "Matematika", "Tabiatshunoslik", "Tasviriy san’at", "Musiqa", "Texnologiya", "Jismoniy tarbiya"],
    "3": ["Ona tili", "O‘qish", "Matematika", "Tabiatshunoslik", "Tasviriy san’at", "Musiqa", "Texnologiya", "Jismoniy tarbiya"],
    "4": ["Ona tili", "O‘qish", "Matematika", "Tabiatshunoslik", "Tarbiya", "Tasviriy san’at", "Musiqa", "Texnologiya", "Jismoniy tarbiya"],
    "5": ["Ona tili", "Adabiyot", "Matematika", "Tarix", "Tabiiy fanlar", "Ingliz tili", "Rus tili", "Tasviriy san’at", "Musiqa", "Texnologiya", "Jismoniy tarbiya", "Tarbiya"],
    "6": ["Ona tili", "Adabiyot", "Matematika", "Tarix", "Geografiya", "Biologiya", "Ingliz tili", "Rus tili", "Informatika", "Texnologiya", "Jismoniy tarbiya", "Tarbiya"],
    "7": ["Ona tili", "Adabiyot", "Algebra", "Geometriya", "Fizika", "Biologiya", "Geografiya", "Tarix", "Ingliz tili", "Rus tili", "Informatika", "Texnologiya", "Jismoniy tarbiya", "Tarbiya"],
    "8": ["Ona tili", "Adabiyot", "Algebra", "Geometriya", "Fizika", "Kimyo", "Biologiya", "O‘zbekiston tarixi", "Jahon tarixi", "Ingliz tili", "Rus tili", "Informatika", "Jismoniy tarbiya", "Tarbiya"],
    "9": ["Ona tili", "Adabiyot", "Algebra", "Geometriya", "Fizika", "Kimyo", "Biologiya", "O‘zbekiston tarixi", "Jahon tarixi", "Huquq asoslari", "Iqtisodiyot asoslari", "Ingliz tili", "Rus tili", "Informatika", "Jismoniy tarbiya", "Tarbiya"],
    "10": ["Ona tili", "Adabiyot", "Algebra va analiz asoslari", "Geometriya", "Fizika", "Kimyo", "Biologiya", "O‘zbekiston tarixi", "Jahon tarixi", "Ingliz tili", "Rus tili", "Informatika", "Tarbiya", "Jismoniy tarbiya"],
    "11": ["Ona tili", "Adabiyot", "Algebra va analiz asoslari", "Geometriya", "Fizika", "Kimyo", "Biologiya", "O‘zbekiston tarixi", "Jahon tarixi", "Ingliz tili", "Rus tili", "Informatika", "Tarbiya", "Jismoniy tarbiya"]
};

const Teacher: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [activePanel, setActivePanel] = useState<'subjects' | 'stats' | 'admin'>('subjects');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // Subjects State
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loadingSubjects, setLoadingSubjects] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newSubjectName, setNewSubjectName] = useState('');

    // Stats State
    const [students, setStudents] = useState<User[]>([]);
    const [loadingStats, setLoadingStats] = useState(false);

    // AI Generation State
    const [isGeneratingAI, setIsGeneratingAI] = useState<string | null>(null);

    // Lessons Management State
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
    const [isLessonsModalOpen, setIsLessonsModalOpen] = useState(false);

    // Results State
    const [viewingResults, setViewingResults] = useState<{ subjectId: string, lessonId: string, title: string } | null>(null);

    // Excel State
    const [isExcelOpen, setIsExcelOpen] = useState(false);
    const [selectedSinf, setSelectedSinf] = useState('');
    const [selectedSubjName, setSelectedSubjName] = useState('');
    const [excelData, setExcelData] = useState<any[]>([]);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const loadSubjects = useCallback(async () => {
        setLoadingSubjects(true);
        try {
            const data = await DbService.getAllSubjects();
            setSubjects(Object.entries(data).map(([id, s]) => ({ ...s, id })));
        } catch (error) {
            toast.error("Fanlarni yuklashda xatolik!");
        } finally {
            setLoadingSubjects(false);
        }
    }, []);

    const loadStats = useCallback(async () => {
        setLoadingStats(true);
        try {
            const [allUsers, allSubjects] = await Promise.all([
                DbService.getAllUsers(),
                DbService.getAllSubjects()
            ]);

            const subjectsList = Object.values(allSubjects);
            const totalLessons = subjectsList.reduce((acc, s) => acc + Object.keys(s.lessons || {}).length, 0);

            const studentUsers = Object.values(allUsers)
                .filter(u => u.role === 'student')
                .map(u => {
                    let completedCount = 0;
                    if (u.progress) {
                        Object.values(u.progress).forEach(subjProgress => {
                            if (typeof subjProgress === 'object') {
                                Object.values(subjProgress as any).forEach(score => {
                                    if ((score as number) >= 70) completedCount++;
                                });
                            }
                        });
                    }
                    const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
                    return { ...u, progressPercent };
                });

            setStudents(studentUsers);
        } catch (error) {
            toast.error("Statistikani yuklashda xatolik!");
        } finally {
            setLoadingStats(false);
        }
    }, []);

    useEffect(() => {
        if (activePanel === 'subjects') loadSubjects();
        if (activePanel === 'stats') loadStats();
    }, [activePanel, loadSubjects, loadStats]);

    const handleAddSubject = async () => {
        if (!newSubjectName.trim() || !user) return;
        try {
            await DbService.createSubject(newSubjectName, user.uid);
            toast.success("Fan qo'shildi! 🎉");
            setIsAddModalOpen(false);
            setNewSubjectName('');
            loadSubjects();
        } catch (error) {
            toast.error("Xatolik!");
        }
    };

    const handleExcelFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target?.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

            if (data.length < 2) {
                toast.error("Fayl bo'sh!");
                return;
            }

            const rows = (data as any[]).slice(1).map((row, idx) => ({
                tartib: row[0] || (idx + 1),
                mavzu: row[1] || '',
                uygaVazifa: row[2] || ''
            })).filter(r => r.mavzu);

            setExcelData(rows);
            setIsPreviewOpen(true);
        };
        reader.readAsBinaryString(file);
    };

    const [isCommitting, setIsCommitting] = useState(false);

    const commitExcel = async () => {
        if (!user) {
            toast.error("Tizimga kirmagansiz!");
            return;
        }
        if (!selectedSinf) {
            toast.error("Sinfni tanlang!");
            return;
        }
        if (!selectedSubjName) {
            toast.error("Fan nomini kiriting!");
            return;
        }
        if (excelData.length === 0) {
            toast.error("Ma'lumotlar mavjud emas!");
            return;
        }

        setIsCommitting(true);
        const fullSubjName = `${selectedSinf}-sinf ${selectedSubjName}`;
        const subjId = `S-${Date.now()}`;

        const lessons: Record<string, any> = {};
        const lessonIds: string[] = [];

        excelData.forEach((row, idx) => {
            const lId = `L-${Math.random().toString(36).substr(2, 9)}-${idx}`;
            lessons[lId] = {
                id: lId,
                title: row.mavzu,
                order: parseInt(row.tartib) || (idx + 1),
                homework: row.uygaVazifa || '',
                sinf: parseInt(selectedSinf),
                testGenerated: false,
                uploadedBy: user.uid,
                timestamp: Date.now()
            };
            lessonIds.push(lId);
        });

        const updates: any = {};
        updates[`subjects/${subjId}`] = {
            id: subjId,
            name: fullSubjName,
            icon: "📚",
            createdBy: user.uid,
            createdAt: Date.now(),
            classes: [parseInt(selectedSinf)],
            lessons: lessons,
            path: lessonIds
        };

        try {
            await DbService.commitBatchUpload(updates, fullSubjName, user.uid);
            toast.success("Darslar yuklandi! ✅");
            setIsPreviewOpen(false);
            setIsExcelOpen(false);
            // Reset state
            setSelectedSinf('');
            setSelectedSubjName('');
            setExcelData([]);
            loadSubjects();
        } catch (error) {
            console.error("Batch upload error:", error);
            toast.error("Yuklashda xatolik!");
        } finally {
            setIsCommitting(false);
        }
    };

    const handleGenerateAI = async (subjectId: string, lessonId: string, topic: string) => {
        if (!user || !auth.currentUser) return;
        setIsGeneratingAI(lessonId);
        try {
            const token = await auth.currentUser.getIdToken();
            const result = await AiService.generateTest(topic, subjectId, lessonId, token);
            await DbService.saveTest(subjectId, lessonId, result);
            toast.success("AI Test muvaffaqiyatli yaratildi! 🤖");
            loadSubjects();
        } catch (error: any) {
            toast.error(error.message || "AI generatsiyada xatolik!");
        } finally {
            setIsGeneratingAI(null);
        }
    };

    const handleGenerateAllAI = async (subject: Subject) => {
        if (!user || !auth.currentUser) return;
        const lessonIds = Object.keys(subject.lessons || {}).filter(id => !subject.lessons![id].testGenerated);
        if (lessonIds.length === 0) {
            toast.success("Barcha mavzularda testlar mavjud! ✅");
            return;
        }

        if (!window.confirm(`${lessonIds.length} ta mavzu uchun AI test yaratilsinmi?`)) return;

        const token = await auth.currentUser.getIdToken();
        toast.loading("AI testlar yaratilmoqda...", { id: 'ai-gen' });

        try {
            for (const lId of lessonIds) {
                const lesson = subject.lessons![lId];
                setIsGeneratingAI(lId);
                const result = await AiService.generateTest(lesson.title, subject.id, lId, token);
                await DbService.saveTest(subject.id, lId, result);
            }
            toast.success("Hamma testlar muvaffaqiyatli yaratildi! 🤖", { id: 'ai-gen' });
            loadSubjects();
        } catch (error: any) {
            toast.error(error.message || "Xatolik!", { id: 'ai-gen' });
        } finally {
            setIsGeneratingAI(null);
        }
    };

    const handleDeleteSubject = async (subjectId: string) => {
        if (!window.confirm("Haqiqatdan ham ushbu fanni o'chirmoqchimisiz?")) return;
        try {
            await DbService.deleteSubject(subjectId);
            toast.success("Fan o'chirildi.");
            loadSubjects();
        } catch (error) {
            toast.error("O'chirishda xatolik!");
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen lg:flex">
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center z-40">
                <div className="flex items-center gap-2 text-xl font-bold text-indigo-600">
                    <span>👨‍🏫</span> EduPanel
                </div>
                <button onClick={() => setIsSidebarOpen(true)} className="p-2 rounded-xl bg-gray-100">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            </div>

            {/* Sidebar */}
            <aside className={`fixed lg:relative w-64 bg-white border-r border-gray-200 p-6 flex flex-col gap-6 min-h-screen z-50 transition-transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <div className="flex items-center gap-2 text-xl font-bold text-indigo-600">
                    <span>👨‍🏫</span> EduPanel
                </div>
                <nav className="flex flex-col gap-1 flex-grow">
                    <button
                        onClick={() => { setActivePanel('subjects'); setIsSidebarOpen(false); }}
                        className={`p-3 text-left rounded-xl font-semibold transition flex items-center gap-3 ${activePanel === 'subjects' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <span className="text-xl">📚</span>
                        <span className="whitespace-nowrap">Fanlar boshqaruvi</span>
                    </button>
                    <button
                        onClick={() => { setActivePanel('stats'); setIsSidebarOpen(false); }}
                        className={`p-3 text-left rounded-xl font-semibold transition flex items-center gap-3 ${activePanel === 'stats' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <span className="text-xl">📊</span>
                        <span className="whitespace-nowrap">O'quvchilar statistikasi</span>
                    </button>
                </nav>
                <div className="mt-auto pt-6 border-t border-gray-100">
                    <button onClick={logout} className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition font-bold text-left flex items-center gap-3 w-full">
                        <span className="text-xl">🚪</span>Chiqish
                    </button>
                </div>
            </aside>

            {/* Overlay */}
            {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/50 z-40 lg:hidden" />}

            {/* Main Content */}
            <main className="flex-grow p-6 lg:p-10 pt-20 lg:pt-10">
                <div className="flex justify-end mb-6 relative">
                    <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center text-xl shadow-md">
                        👤
                    </button>
                    {isProfileOpen && (
                        <div className="absolute top-16 right-0 bg-white rounded-3xl shadow-2xl border border-gray-100 w-72 overflow-hidden z-50">
                            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white text-center">
                                <p className="font-bold">{user?.name}</p>
                                <p className="text-xs opacity-80">{user?.email}</p>
                            </div>
                            <div className="p-2">
                                <Link to="/dashboard" className="block p-3 hover:bg-gray-50 rounded-xl text-gray-700">🎓 Talaba paneli</Link>
                                <button onClick={logout} className="w-full text-left p-3 hover:bg-red-50 rounded-xl text-red-500 font-bold">🚪 Chiqish</button>
                            </div>
                        </div>
                    )}
                </div>

                {activePanel === 'subjects' && (
                    <section>
                        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">📚 Fanlar boshqaruvi</h1>
                                <p className="text-gray-500 mt-1">Fanlar va darslarni boshqaring</p>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setIsAddModalOpen(true)} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200">+ Yangi fan</button>
                                <button onClick={() => setIsExcelOpen(!isExcelOpen)} className="px-6 py-3 border-2 border-indigo-600 text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition">📊 Reja yuklash</button>
                            </div>
                        </header>

                        {isExcelOpen && (
                            <div className="mb-8 p-8 bg-white rounded-[2rem] shadow-xl border border-indigo-100 animate-in slide-in-from-top duration-500">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest pl-1">1. Sinfni tanlang</label>
                                        <select
                                            value={selectedSinf}
                                            onChange={(e) => setSelectedSinf(e.target.value)}
                                            className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl transition-all outline-none font-semibold text-gray-700 appearance-none"
                                        >
                                            <option value="">-- Tanlang --</option>
                                            {[...Array(11)].map((_, i) => <option key={i + 1} value={i + 1}>{i + 1}-sinf</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest pl-1">2. Fan nomi</label>
                                        <select
                                            value={selectedSubjName}
                                            onChange={(e) => setSelectedSubjName(e.target.value)}
                                            disabled={!selectedSinf}
                                            className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl transition-all outline-none font-semibold text-gray-700 appearance-none disabled:opacity-50"
                                        >
                                            <option value="">-- Fan tanlang --</option>
                                            {selectedSinf && SUBJECTS_BY_CLASS[selectedSinf]?.map((sub, i) => (
                                                <option key={i} value={sub}>{sub}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest pl-1">3. Excel fayli</label>
                                        <div className={`relative group ${(!selectedSinf || !selectedSubjName) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                            <input
                                                type="file"
                                                accept=".xlsx"
                                                onChange={handleExcelFile}
                                                disabled={!selectedSinf || !selectedSubjName}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                                            />
                                            <div className="w-full p-4 bg-indigo-50 border-2 border-dashed border-indigo-200 group-hover:border-indigo-400 rounded-2xl transition-all flex items-center justify-center gap-3 text-indigo-600 font-bold">
                                                <span>📂</span>
                                                <span className="truncate">{excelData.length > 0 ? "Fayl yuklandi" : "Faylni tanlang"}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
                                    <span className="text-xl">💡</span>
                                    <p className="text-sm text-amber-800 leading-relaxed">
                                        Excel fayli quyidagi ustunlardan iborat bo'lishi kerak: <b>Tartib</b>, <b>Mavzu</b>, <b>Uyga Vazifa</b>.
                                        Birinchi qator sarlavha hisoblanadi.
                                    </p>
                                </div>
                            </div>
                        )}

                        {loadingSubjects ? (
                            <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent" /></div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {subjects
                                    .filter(s => !selectedSinf || s.classes?.includes(parseInt(selectedSinf)) || s.class === selectedSinf)
                                    .map(s => (
                                        <div key={s.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-2xl">{s.icon || '📚'}</span>
                                                    <h4 className="text-xl font-bold text-gray-900">{s.name}</h4>
                                                </div>
                                                <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-lg text-xs font-bold">{Object.keys(s.lessons || {}).length} mavzu</span>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <button
                                                    onClick={() => navigate(`/path?subject=${s.id}`)}
                                                    className="flex-1 py-3 bg-indigo-100 text-indigo-600 rounded-xl font-bold hover:bg-indigo-200"
                                                >
                                                    Talaba ko'rinishi
                                                </button>
                                                <button
                                                    onClick={() => { setSelectedSubject(s); setIsLessonsModalOpen(true); }}
                                                    className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-md"
                                                >
                                                    Mavzularni boshqarish
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteSubject(s.id)}
                                                className="w-full mt-2 py-2 text-red-500 hover:bg-red-50 rounded-xl text-xs font-semibold"
                                            >
                                                🗑️ Fanni o'chirish
                                            </button>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </section>
                )}

                {activePanel === 'stats' && (
                    <section>
                        <header className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-900">📊 O'quvchilar statistikasi</h1>
                            <p className="text-gray-500 mt-1">O'quvchilarning natijalari va faolligini kuzating</p>
                        </header>

                        {loadingStats ? (
                            <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent" /></div>
                        ) : (
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 border-b border-gray-100">
                                            <tr>
                                                <th className="p-5 font-bold text-gray-400 text-xs uppercase tracking-widest w-16">#</th>
                                                <th className="p-5 font-bold text-gray-400 text-xs uppercase tracking-widest">ISM</th>
                                                <th className="p-5 font-bold text-gray-400 text-xs uppercase tracking-widest">SINF</th>
                                                <th className="p-5 font-bold text-gray-400 text-xs uppercase tracking-widest">PROGRESS</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {students.map((s, idx) => (
                                                <tr key={s.uid} className="hover:bg-gray-50/50 transition">
                                                    <td className="p-5 font-bold text-gray-400">{idx + 1}</td>
                                                    <td className="p-5">
                                                        <p className="font-bold text-gray-900">{s.name}</p>
                                                    </td>
                                                    <td className="p-5 font-semibold text-gray-600">{s.sinf || '--'}-sinf</td>
                                                    <td className="p-5">
                                                        <div className="flex items-center gap-4">
                                                            <div className="flex-grow bg-gray-100 h-2 rounded-full overflow-hidden">
                                                                <div
                                                                    className="bg-indigo-600 h-full transition-all duration-1000"
                                                                    style={{ width: `${(s as any).progressPercent || 0}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-xs font-bold text-gray-400 w-8">
                                                                {(s as any).progressPercent || 0}%
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {students.length === 0 && (
                                                <tr>
                                                    <td colSpan={4} className="p-20 text-center text-gray-400">
                                                        Hozircha o'quvchilar yo'q.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </section>
                )}

                {activePanel === 'admin' && (
                    <section>
                        <header className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-900">⚙️ Boshqaruv paneli</h1>
                            <p className="text-gray-500 mt-1">Platforma sozlamalari va ma'lumotlar bazasini boshqarish</p>
                        </header>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                                <h3 className="font-bold text-lg mb-2">Foydalanuvchilar</h3>
                                <p className="text-gray-500 text-sm mb-4">Barcha foydalanuvchilar ro'yxati va rollarini boshqarish</p>
                                <button className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200">Boshqarish</button>
                            </div>
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                                <h3 className="font-bold text-lg mb-2">Tizim jurnallari</h3>
                                <p className="text-gray-500 text-sm mb-4">Oxirgi harakatlar va xatoliklar jurnali</p>
                                <button className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200">Ko'rish</button>
                            </div>
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                                <h3 className="font-bold text-lg mb-2">Ma'lumotlarni eksport qilish</h3>
                                <p className="text-gray-500 text-sm mb-4">Hamma natijalarni Excel formatida yuklab olish</p>
                                <button className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200">Eksport</button>
                            </div>
                        </div>
                    </section>
                )}
            </main>

            {/* Lesson Management Modal */}
            {isLessonsModalOpen && selectedSubject && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
                        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">{selectedSubject.icon} {selectedSubject.name}</h2>
                                <div className="flex items-center gap-4 mt-1">
                                    <p className="text-sm text-gray-500">Mavzularni boshqarish va AI testlar yaratish</p>
                                    <button
                                        onClick={() => handleGenerateAllAI(selectedSubject)}
                                        className="text-indigo-600 text-xs font-bold hover:underline"
                                    >
                                        🤖 Hamma mavzuga test yaratish
                                    </button>
                                </div>
                            </div>
                            <button onClick={() => setIsLessonsModalOpen(false)} className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm text-gray-400 hover:text-gray-600 tracking-tighter">
                                <span className="text-2xl">×</span>
                            </button>
                        </div>
                        <div className="p-8 overflow-y-auto flex-grow bg-white">
                            <div className="grid grid-cols-1 gap-4">
                                {Object.entries(selectedSubject.lessons || {}).sort((a, b) => (a[1].order || 0) - (b[1].order || 0)).map(([id, lesson]) => (
                                    <div key={id} className="p-5 border border-gray-100 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-indigo-100 hover:shadow-sm transition">
                                        <div className="flex gap-4 items-center">
                                            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-bold text-lg">
                                                {lesson.order}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 line-clamp-1">{lesson.title}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    {lesson.testGenerated ? (
                                                        <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded text-[10px] font-bold uppercase tracking-wider">Test mavjud ✅</span>
                                                    ) : (
                                                        <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded text-[10px] font-bold uppercase tracking-wider">Test yo'q ❌</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 w-full sm:w-auto">
                                            <button
                                                onClick={() => handleGenerateAI(selectedSubject.id, id, lesson.title)}
                                                disabled={isGeneratingAI === id}
                                                className={`flex-grow sm:flex-initial px-4 py-2 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 ${lesson.testGenerated ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'}`}
                                            >
                                                {isGeneratingAI === id ? (
                                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                                                ) : (
                                                    <span>{lesson.testGenerated ? "🤖 Yangilash" : "🤖 AI Generatsiya"}</span>
                                                )}
                                            </button>
                                            <button
                                                onClick={() => setViewingResults({ subjectId: selectedSubject.id, lessonId: id, title: lesson.title })}
                                                className="p-2 text-gray-400 hover:text-indigo-500 hover:bg-gray-50 rounded-lg transition"
                                                title="Natijalarni ko'rish"
                                            >
                                                📊
                                            </button>
                                            <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {Object.keys(selectedSubject.lessons || {}).length === 0 && (
                                    <div className="py-20 text-center text-gray-400">
                                        Bu fanda hali mavzular yo'q.
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="p-8 border-t border-gray-50 bg-gray-50 flex justify-end">
                            <button onClick={() => setIsLessonsModalOpen(false)} className="px-8 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-100 shadow-sm">
                                Yopish
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl">
                        <h2 className="text-2xl font-bold mb-6 text-gray-900">➕ Yangi fan</h2>
                        <input value={newSubjectName} onChange={(e) => setNewSubjectName(e.target.value)} placeholder="Fan nomi" className="w-full p-4 border border-gray-200 rounded-xl mb-6 text-lg" />
                        <div className="flex gap-4">
                            <button onClick={() => setIsAddModalOpen(false)} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl">Bekor qilish</button>
                            <button onClick={handleAddSubject} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold">Qo'shish</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Excel Preview Modal */}
            {isPreviewOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[80vh]">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold">Excel ko'rib chiqish</h2>
                            <button onClick={() => setIsPreviewOpen(false)} className="text-gray-400">✕</button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-grow">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-gray-500 font-bold uppercase">
                                    <tr><th className="p-3">#</th><th className="p-3">Mavzu</th><th className="p-3">Uyga vazifa</th></tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {excelData.map((r, i) => <tr key={i}><td className="p-3">{r.tartib}</td><td className="p-3">{r.mavzu}</td><td className="p-3">{r.uygaVazifa}</td></tr>)}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-6 border-t border-gray-100 flex justify-between items-center">
                            <span className="font-bold text-gray-600">{excelData.length} ta dars</span>
                            <div className="flex gap-3">
                                <button onClick={() => setIsPreviewOpen(false)} className="px-6 py-3 font-bold text-gray-500" disabled={isCommitting}>Orqaga</button>
                                <button
                                    onClick={commitExcel}
                                    disabled={isCommitting}
                                    className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isCommitting && <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />}
                                    Tasdiqlash
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* View Results Modal */}
            {viewingResults && (
                <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
                        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{viewingResults.title}</h2>
                                <p className="text-sm text-gray-500 font-semibold mt-1">O'quvchilar natijalari</p>
                            </div>
                            <button onClick={() => setViewingResults(null)} className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm text-gray-400 text-xl font-black">×</button>
                        </div>
                        <div className="p-8 overflow-y-auto flex-grow bg-white">
                            <table className="w-full text-left">
                                <thead className="text-xs text-gray-400 font-bold uppercase tracking-widest bg-gray-50/50">
                                    <tr>
                                        <th className="p-4">O'quvchi</th>
                                        <th className="p-4 text-center">Natija</th>
                                        <th className="p-4 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {students.map(s => {
                                        const score = (s.progress?.[viewingResults.subjectId] as any)?.[viewingResults.lessonId] || 0;
                                        return (
                                            <tr key={s.uid} className="hover:bg-gray-50 transition">
                                                <td className="p-4 font-bold text-gray-700">{s.name}</td>
                                                <td className="p-4 text-center">
                                                    <span className={`px-3 py-1 rounded-lg font-black ${score >= 70 ? 'bg-green-100 text-green-700' : score > 0 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-400'}`}>
                                                        {score}%
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right">
                                                    {score >= 70 ? '✅ Topshirdi' : score > 0 ? '⚠️ O\'tolmadi' : '⏳ Kutilmoqda'}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {students.length === 0 && <tr><td colSpan={3} className="p-10 text-center text-gray-400">Hali o'quvchilar yo'q.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
                            <button onClick={() => setViewingResults(null)} className="px-8 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-100">Yopish</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Teacher;
