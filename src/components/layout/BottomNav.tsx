import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface NavItem {
    path: string;
    icon: string;
    label: string;
}

interface BottomNavProps {
    onSettingsClick?: () => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ onSettingsClick }) => {
    const location = useLocation();

    const navItems: NavItem[] = [
        { path: '/dashboard', icon: '📊', label: 'Dashboard' },
        { path: '/path', icon: '🛤️', label: "Yo'llar" },
        { path: '/test', icon: '📝', label: 'Testlar' },
    ];

    const isActive = (path: string) => {
        if (path === '/path') {
            return location.pathname === '/path' || location.pathname.startsWith('/path');
        }
        return location.pathname === path;
    };

    return (
        <>
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 safe-area-bottom">
                <div className="flex justify-around items-center py-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex flex-col items-center gap-1 p-2 ${isActive(item.path) ? 'text-indigo-600' : 'text-gray-400 hover:text-indigo-600'
                                }`}
                        >
                            <span className="text-xl">{item.icon}</span>
                            <span className="text-xs font-semibold">{item.label}</span>
                        </Link>
                    ))}
                    {onSettingsClick && (
                        <button
                            onClick={onSettingsClick}
                            className="flex flex-col items-center gap-1 p-2 text-gray-400 hover:text-indigo-600"
                        >
                            <span className="text-xl">👤</span>
                            <span className="text-xs font-semibold">Profil</span>
                        </button>
                    )}
                </div>
            </nav>
            {/* Mobile nav padding */}
            <div className="lg:hidden h-20"></div>
        </>
    );
};

export default BottomNav;
