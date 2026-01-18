import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import AIChat from '../common/AIChat';

interface NavbarProps {
    showBackButton?: boolean;
    backTo?: string;
    title?: string;
}

const Navbar: React.FC<NavbarProps> = ({ showBackButton = false, backTo = '/dashboard', title }) => {
    const { user, logout } = useAuth();
    const { theme, setTheme } = useTheme();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();

    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [settingsModalOpen, setSettingsModalOpen] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [aiChatOpen, setAiChatOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        showToast("Chiqish muvaffaqiyatli", 'success');
        navigate('/login');
    };

    const themes = [
        { id: 'light', icon: '☀️', label: "Yorug'", bgClass: 'bg-gray-100' },
        { id: 'dark', icon: '🌙', label: "Qorong'i", bgClass: 'bg-gray-800' },
        { id: 'neon-purple', icon: '💜', label: 'Neon', bgClass: 'bg-purple-900' },
        { id: 'neon-green', icon: '💚', label: 'Matrix', bgClass: 'bg-green-900' },
        { id: 'neon-blue', icon: '💙', label: 'Cyber', bgClass: 'bg-blue-900' },
    ] as const;

    // Student menu items
    const studentMenuItems = [
        { icon: '📊', label: 'Dashboard', path: '/dashboard' },
        { icon: '🛤️', label: "Yo'llar", path: '/path' },
        { icon: '📚', label: 'Mening darslarim', path: '/path' },
        { icon: '📈', label: 'Natijalarim', path: '/dashboard' },
        { icon: '🏆', label: 'Yutuqlarim', path: '/dashboard' },
    ];

    // Teacher/Admin menu items
    const teacherMenuItems = [
        { icon: '📊', label: 'Dashboard', path: '/dashboard' },
        { icon: '📚', label: 'Fanlar boshqaruvi', path: '/teacher' },
        { icon: '👨‍🎓', label: "O'quvchilar statistikasi", path: '/teacher' },
        { icon: '⚙️', label: 'Boshqaruv paneli', path: '/teacher' },
    ];

    // Add admin-only items
    const adminMenuItems = [
        ...teacherMenuItems,
        { icon: '👑', label: 'Admin panel', path: '/admin' },
    ];

    const getMenuItems = () => {
        if (user?.role === 'admin') return adminMenuItems;
        if (user?.role === 'teacher') return teacherMenuItems;
        return studentMenuItems;
    };

    const isActive = (path: string) => location.pathname === path;

    return (
        <>
            <nav className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    {/* Hamburger Menu Button */}
                    <button
                        onClick={() => setDrawerOpen(true)}
                        className="p-2 hover:bg-gray-100 rounded-xl transition mr-1"
                        aria-label="Menu"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    {showBackButton ? (
                        <>
                            <Link to={backTo} className="p-2 hover:bg-gray-50 rounded-xl transition">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                            </Link>
                            <h1 className="text-xl font-bold text-gray-900">{title || 'EduPlatform'}</h1>
                        </>
                    ) : (
                        <Link to="/dashboard" className="flex items-center gap-2 text-xl font-bold text-indigo-600">
                            <span>🎯</span> EduPlatform
                        </Link>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    {(user?.role === 'teacher' || user?.role === 'admin') && !showBackButton && (
                        <Link to="/teacher" className="hidden sm:flex px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition">
                            👨‍🏫 O'qituvchi paneli
                        </Link>
                    )}
                    <span className="text-gray-700 font-medium hidden sm:block">{user?.name || "O'quvchi"}</span>
                    <div className="relative">
                        <button
                            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                            className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold hover:bg-indigo-700 transition"
                        >
                            👤
                        </button>
                        {profileDropdownOpen && (
                            <div className="absolute top-12 right-0 bg-white rounded-2xl shadow-xl border border-gray-100 w-56 p-2 z-50">
                                <div className="px-3 py-2 border-b border-gray-100 mb-2">
                                    <p className="font-bold text-gray-900">{user?.name || "O'quvchi"}</p>
                                    <p className="text-sm text-gray-500">{user?.email}</p>
                                </div>
                                {(user?.role === 'teacher' || user?.role === 'admin') && (
                                    <button
                                        onClick={() => { navigate('/teacher'); setProfileDropdownOpen(false); }}
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

            {/* Slide-out Drawer */}
            {drawerOpen && (
                <div className="fixed inset-0 z-50 flex">
                    {/* Overlay */}
                    <div
                        className="fixed inset-0 bg-black/50 transition-opacity"
                        onClick={() => setDrawerOpen(false)}
                    />

                    {/* Drawer Panel */}
                    <div className="relative w-72 max-w-[80vw] bg-white shadow-2xl flex flex-col animate-slide-in">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-2xl">🎯</span>
                                <button
                                    onClick={() => setDrawerOpen(false)}
                                    className="text-white/80 hover:text-white"
                                >
                                    ✕
                                </button>
                            </div>
                            <h2 className="text-xl font-bold">EduPlatform</h2>
                            <p className="text-white/80 text-sm">{user?.name || "O'quvchi"}</p>
                            <p className="text-white/60 text-xs">{user?.role === 'admin' ? 'Administrator' : user?.role === 'teacher' ? "O'qituvchi" : "O'quvchi"}</p>
                        </div>

                        {/* Menu Items */}
                        <div className="flex-1 py-4 overflow-y-auto">
                            {getMenuItems().map((item, index) => (
                                <Link
                                    key={index}
                                    to={item.path}
                                    onClick={() => setDrawerOpen(false)}
                                    className={`flex items-center gap-4 px-6 py-3 transition ${isActive(item.path)
                                        ? 'bg-indigo-50 text-indigo-600 border-r-4 border-indigo-600'
                                        : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    <span className="text-xl">{item.icon}</span>
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            ))}

                            {/* Divider */}
                            <div className="border-t border-gray-100 my-4 mx-4"></div>

                            {/* Settings */}
                            <button
                                onClick={() => { setSettingsModalOpen(true); setDrawerOpen(false); }}
                                className="flex items-center gap-4 px-6 py-3 text-gray-700 hover:bg-gray-50 w-full"
                            >
                                <span className="text-xl">⚙️</span>
                                <span className="font-medium">Sozlamalar</span>
                            </button>

                            {/* AI Chat Button in Hamburger Menu */}
                            <button
                                onClick={() => { setAiChatOpen(true); setDrawerOpen(false); }}
                                className="flex items-center gap-4 px-6 py-3 text-gray-700 hover:bg-gray-50 w-full bg-gradient-to-r from-indigo-50 to-purple-50"
                            >
                                <span className="text-xl">🤖</span>
                                <span className="font-medium">AI Yordamchi</span>
                                <span className="ml-auto px-2 py-0.5 bg-indigo-600 text-white text-xs rounded-full">Yangi</span>
                            </button>
                        </div>

                        {/* Footer */}
                        <div className="border-t border-gray-100 p-4">
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-4 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl w-full transition"
                            >
                                <span className="text-xl">🚪</span>
                                <span className="font-medium">Chiqish</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                                    {themes.map((t) => (
                                        <button
                                            key={t.id}
                                            onClick={() => setTheme(t.id)}
                                            className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition ${theme === t.id
                                                ? 'border-indigo-500 bg-indigo-50'
                                                : 'border-transparent hover:border-indigo-500'
                                                }`}
                                        >
                                            <div className={`w-12 h-12 rounded-xl ${t.bgClass} flex items-center justify-center text-xl`}>
                                                {t.icon}
                                            </div>
                                            <span className="text-xs text-gray-500">{t.label}</span>
                                        </button>
                                    ))}
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

            {/* Close dropdown when clicking outside */}
            {profileDropdownOpen && (
                <div
                    className="fixed inset-0 z-[5]"
                    onClick={() => setProfileDropdownOpen(false)}
                />
            )}

            {/* AI Chat Component */}
            <AIChat isOpen={aiChatOpen} onClose={() => setAiChatOpen(false)} />
        </>
    );
};

export default Navbar;
