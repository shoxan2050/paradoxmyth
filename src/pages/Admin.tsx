import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { DbService } from '../services/db.service';
import { Link } from 'react-router-dom';
import type { Subject, User } from '../types';
import toast from 'react-hot-toast';
import { AIChatButton } from '../components/common/AIChat';

const Admin: React.FC = () => {
    const { user, logout } = useAuth();
    const [activePanel, setActivePanel] = useState<'users' | 'subjects' | 'tests' | 'logs'>('users');
    const [stats, setStats] = useState({ users: 0, subjects: 0, tests: 0 });
    const [loading, setLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const [adminData, setAdminData] = useState<{
        users: User[];
        subjects: Subject[];
        tests: Record<string, any>;
        logs: any[];
    }>({ users: [], subjects: [], tests: {}, logs: [] });

    const loadAdminData = useCallback(async () => {
        setLoading(true);
        try {
            const [usersData, subjectsData, testsData, logsData] = await Promise.all([
                DbService.getAllUsers(),
                DbService.getAllSubjects(),
                DbService.getAllTests(),
                DbService.getLogs('uploads')
            ]);

            const usersList = Object.values(usersData);
            const subjectsList = Object.entries(subjectsData).map(([id, s]) => ({ ...s, id }));

            setAdminData({
                users: usersList,
                subjects: subjectsList,
                tests: testsData,
                logs: logsData
            });

            setStats({
                users: usersList.length,
                subjects: subjectsList.length,
                tests: Object.values(testsData).reduce((acc, curr) => acc + Object.keys(curr).length, 0)
            });
        } catch (error) {
            toast.error("Admin ma'lumotlarini yuklashda xatolik!");
        } finally {
            setLoading(false);
        }
    }, []);

    const handleDeleteUser = async (uid: string) => {
        if (!window.confirm("Haqiqatdan ham foydalanuvchini o'chirmoqchimisiz?")) return;
        try {
            await DbService.deleteUser(uid);
            toast.success("Foydalanuvchi o'chirildi.");
            loadAdminData();
        } catch (error) {
            toast.error("Xatolik!");
        }
    };

    const handleRoleChange = async (uid: string, newRole: string) => {
        try {
            await DbService.updateUserRole(uid, newRole as any);
            toast.success("Rol o'zgartirildi.");
            loadAdminData();
        } catch (error) {
            toast.error("Xatolik!");
        }
    };

    useEffect(() => {
        loadAdminData();
    }, [loadAdminData]);

    if (user?.role !== 'admin') {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
                <span className="text-6xl mb-6">🛡️</span>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Ruxsat yo'q!</h1>
                <p className="text-xl text-gray-600 mb-8">Bu sahifaga faqat adminlar kira oladi.</p>
                <Link to="/dashboard" className="px-8 py-4 bg-red-600 text-white rounded-2xl font-bold transition shadow-lg shadow-red-200">
                    Dashboard ga qaytish
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen lg:flex">
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center z-40">
                <div className="flex items-center gap-2 text-xl font-bold text-red-600">
                    <span>🛡️</span> Admin Panel
                </div>
                <button onClick={() => setIsSidebarOpen(true)} className="p-2 rounded-xl bg-gray-100">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            </div>

            {/* Sidebar */}
            <aside className={`fixed lg:relative w-64 bg-white border-r border-gray-200 p-6 flex flex-col gap-6 min-h-screen z-50 transition-transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <div className="flex items-center gap-2 text-xl font-bold text-red-600">
                    <span>🛡️</span> Admin Panel
                </div>
                <nav className="flex flex-col gap-1 flex-grow">
                    {[
                        { id: 'users', label: '👥 Foydalanuvchilar' },
                        { id: 'subjects', label: '📚 Fanlar' },
                        { id: 'tests', label: '📝 Testlar' },
                        { id: 'logs', label: '📋 Loglar' }
                    ].map(panel => (
                        <button
                            key={panel.id}
                            onClick={() => { setActivePanel(panel.id as any); setIsSidebarOpen(false); }}
                            className={`p-3 text-left rounded-xl font-semibold transition ${activePanel === panel.id ? 'bg-red-50 text-red-600' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            {panel.label}
                        </button>
                    ))}
                    <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col gap-1">
                        <Link to="/dashboard" className="p-3 text-gray-500 hover:bg-gray-50 rounded-xl transition">🎓 Talaba sifatida</Link>
                        <Link to="/teacher" className="p-3 text-gray-500 hover:bg-gray-50 rounded-xl transition">👨‍🏫 O'qituvchi paneli</Link>
                    </div>
                </nav>
                <button onClick={logout} className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition font-semibold text-left">
                    🚪 Chiqish
                </button>
            </aside>

            {/* Overlay */}
            {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/50 z-40 lg:hidden" />}

            {/* Admin Main Content */}
            <main className="flex-grow p-6 lg:p-10 pt-20 lg:pt-10">
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">🛡️ Admin Boshqaruv</h1>
                        <p className="text-gray-500 text-sm sm:text-base">Tizim holati va ma'lumotlar boshqaruvi</p>
                    </div>
                    <div className="px-4 py-2 bg-red-100 text-red-600 rounded-xl font-bold text-sm">ADMIN</div>
                </header>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <p className="text-gray-400 text-sm font-bold uppercase mb-1">Jami Foydalanuvchilar</p>
                        <p className="text-3xl font-black text-gray-900">{stats.users || '...'}</p>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <p className="text-gray-400 text-sm font-bold uppercase mb-1">Fanlar</p>
                        <p className="text-3xl font-black text-gray-900">{stats.subjects}</p>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <p className="text-gray-400 text-sm font-bold uppercase mb-1">Testlar</p>
                        <p className="text-3xl font-black text-gray-900">{stats.tests}</p>
                    </div>
                </div>

                {/* Content Panels */}
                {loading ? (
                    <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent" /></div>
                ) : (
                    <>
                        {activePanel === 'users' && (
                            <section>
                                {/* Desktop Table */}
                                <div className="hidden md:block bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="bg-gray-50 border-b border-gray-100">
                                                <tr>
                                                    <th className="p-5 font-bold text-gray-400 text-xs uppercase tracking-widest">Foydalanuvchi</th>
                                                    <th className="p-5 font-bold text-gray-400 text-xs uppercase tracking-widest">Email</th>
                                                    <th className="p-5 font-bold text-gray-400 text-xs uppercase tracking-widest">Rol</th>
                                                    <th className="p-5 font-bold text-gray-400 text-xs uppercase tracking-widest">Sinf</th>
                                                    <th className="p-5 font-bold text-gray-400 text-xs uppercase tracking-widest text-right">Amallar</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {adminData.users.map(u => (
                                                    <tr key={u.uid} className="hover:bg-gray-50/50 transition">
                                                        <td className="p-5 font-bold text-gray-900">{u.name}</td>
                                                        <td className="p-5 text-gray-500">{u.email}</td>
                                                        <td className="p-5">
                                                            <select
                                                                value={u.role}
                                                                onChange={(e) => handleRoleChange(u.uid, e.target.value)}
                                                                className={`px-3 py-1 rounded-lg text-xs font-bold uppercase outline-none ${u.role === 'admin' ? 'bg-red-50 text-red-600' : u.role === 'teacher' ? 'bg-indigo-50 text-indigo-600' : 'bg-green-50 text-green-600'}`}
                                                            >
                                                                <option value="student">Student</option>
                                                                <option value="teacher">Teacher</option>
                                                                <option value="admin">Admin</option>
                                                            </select>
                                                        </td>
                                                        <td className="p-5 font-semibold text-gray-600">{u.sinf || '-'}-sinf</td>
                                                        <td className="p-5 text-right">
                                                            <button
                                                                onClick={() => handleDeleteUser(u.uid)}
                                                                className="text-red-500 hover:text-red-700 font-bold"
                                                            >
                                                                O'chirish
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Mobile Cards */}
                                <div className="md:hidden space-y-4">
                                    {adminData.users.map(u => (
                                        <div key={u.uid} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h3 className="font-bold text-gray-900 text-lg">{u.name}</h3>
                                                    <p className="text-gray-500 text-sm break-all">{u.email}</p>
                                                </div>
                                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold">{u.sinf || '-'}-sinf</span>
                                            </div>
                                            <div className="flex items-center justify-between gap-3">
                                                <select
                                                    value={u.role}
                                                    onChange={(e) => handleRoleChange(u.uid, e.target.value)}
                                                    className={`flex-grow px-3 py-2 rounded-xl text-sm font-bold uppercase outline-none ${u.role === 'admin' ? 'bg-red-50 text-red-600' : u.role === 'teacher' ? 'bg-indigo-50 text-indigo-600' : 'bg-green-50 text-green-600'}`}
                                                >
                                                    <option value="student">Student</option>
                                                    <option value="teacher">Teacher</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                                <button
                                                    onClick={() => handleDeleteUser(u.uid)}
                                                    className="px-4 py-2 bg-red-50 text-red-500 rounded-xl font-bold text-sm hover:bg-red-100 transition"
                                                >
                                                    O'chirish
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {activePanel === 'subjects' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {adminData.subjects.map(s => (
                                    <div key={s.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">{s.icon || '📚'}</span>
                                                <h4 className="font-bold text-gray-900">{s.name}</h4>
                                            </div>
                                            <button className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition" onClick={async () => {
                                                if (window.confirm("O'chirilsinmi?")) {
                                                    await DbService.deleteSubject(s.id);
                                                    loadAdminData();
                                                }
                                            }}>🗑️</button>
                                        </div>
                                        <div className="flex gap-2">
                                            {s.classes?.map(c => <span key={c} className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-[10px] font-bold">{c}</span>)}
                                            {s.class && <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-[10px] font-bold">{s.class}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activePanel === 'logs' && (
                            <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-4 sm:p-5 bg-gray-50 border-b border-gray-100 font-bold uppercase text-xs text-gray-400">Tizim yuklamalari</div>
                                <div className="divide-y divide-gray-50">
                                    {adminData.logs.map((log, i) => (
                                        <div key={i} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 hover:bg-gray-50 transition">
                                            <div>
                                                <p className="font-bold text-gray-900 break-all">{log.fileName}</p>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(log.timestamp).toLocaleString()} • {log.rowCount} qator
                                                </p>
                                            </div>
                                            <div className="text-left sm:text-right">
                                                <p className="text-xs font-mono text-gray-400 truncate sm:w-32">{log.userUid}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {adminData.logs.length === 0 && <div className="p-10 sm:p-20 text-center text-gray-400">Loglar topilmadi.</div>}
                                </div>
                            </section>
                        )}
                    </>
                )}
            </main>
            <AIChatButton />
        </div>
    );
};

export default Admin;
