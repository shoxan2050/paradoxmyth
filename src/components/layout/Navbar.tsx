import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';

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

    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [settingsModalOpen, setSettingsModalOpen] = useState(false);

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

    return (
        <>
            <nav className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    {showBackButton ? (
                        <>
                            <Link to={backTo} className="p-2 mr-2 hover:bg-gray-50 rounded-xl transition">
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
                        <Link to="/teacher" className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition">
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
        </>
    );
};

export default Navbar;
