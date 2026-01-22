import React, { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const SSOLogin: React.FC = () => {
    const [searchParams] = useSearchParams();
    const { login } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const hasTried = useRef(false);

    useEffect(() => {
        if (hasTried.current) return;

        const email = searchParams.get('e');
        const password = searchParams.get('p');

        if (email && password) {
            hasTried.current = true;
            const attemptLogin = async () => {
                try {
                    const user = await login({ email, password, remember: true });
                    showToast(`Xush kelibsiz, ${user.name}! (SSO) 👋`, 'success');

                    if (user.role === 'admin') navigate('/admin');
                    else if (user.role === 'teacher') navigate('/teacher');
                    else navigate('/dashboard');
                } catch (error: any) {
                    showToast("SSO xatosi: " + error.message, 'error');
                    navigate('/login');
                }
            };
            attemptLogin();
        } else {
            navigate('/login');
        }
    }, [searchParams, login, navigate, showToast]);

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
            <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-6"></div>
            <h2 className="text-2xl font-bold text-white mb-2">Xavfsiz ulanish</h2>
            <p className="text-indigo-400">Hisobingizga kirilmoqda, iltimos kuting...</p>
        </div>
    );
};

export default SSOLogin;
