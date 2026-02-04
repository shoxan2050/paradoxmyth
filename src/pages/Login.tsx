import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';


const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const [loading, setLoading] = useState(false);

    const { login, loginWithGoogle } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !email.includes('@')) {
            showToast("Noto'g'ri email formati", 'error');
            return;
        }
        if (!password) {
            showToast("Iltimos, parol kiriting", 'error');
            return;
        }

        setLoading(true);
        try {
            const user = await login({ email, password, remember });
            showToast(`Xush kelibsiz, ${user.name} ! 👋`, 'success');

            // Redirect based on role
            if (user.role === 'admin') {
                navigate('/admin');
            } else if (user.role === 'teacher') {
                navigate('/teacher');
            } else {
                navigate('/dashboard');
            }
        } catch (error: any) {
            showToast(error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            const { userData } = await loginWithGoogle();
            if (userData) {
                showToast(`Xush kelibsiz, ${userData.name}! 👋`, 'success');
                if (userData.role === 'admin') navigate('/admin');
                else if (userData.role === 'teacher') navigate('/teacher');
                else navigate('/dashboard');
            } else {
                // User exists in Auth but not in DB, redirect to register
                showToast("Iltimos, ro'yxatdan o'tishni yakunlang", 'info');
                navigate('/register');
            }
        } catch (error: any) {
            showToast(error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Card */}
                <div className="bg-white rounded-[2rem] overflow-hidden">
                    {/* Header */}
                    <div className="p-8 pb-6 text-center">
                        <div className="text-4xl mb-3">👋</div>
                        <h1 className="text-2xl font-bold text-gray-900 font-poppins">Xush kelibsiz</h1>
                        <p className="text-gray-500 mt-1 text-sm">Hisobingizga kiring</p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="px-8 pb-8">
                        {/* Email */}
                        <div className="relative mb-4">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input-field w-full px-4 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:ring-0 outline-none transition"
                                placeholder=" "
                                required
                            />
                            <label className="floating-label">Email manzil</label>
                        </div>

                        {/* Password */}
                        <div className="relative mb-6">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input-field w-full px-4 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:ring-0 outline-none transition"
                                placeholder=" "
                                required
                            />
                            <label className="floating-label">Parol</label>
                        </div>

                        {/* Remember me */}
                        <div className="flex items-center justify-between mb-6">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={remember}
                                    onChange={(e) => setRemember(e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="text-sm text-gray-600">Meni eslab qol</span>
                            </label>
                            <a href="#" className="text-sm text-indigo-600 hover:underline">Parolni unutdim</a>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-gray-900 text-white rounded-2xl font-semibold text-lg hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                            ) : (
                                'Kirish'
                            )}
                        </button>

                        {/* Divider */}
                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-gray-400">yoki</span>
                            </div>
                        </div>

                        {/* Google Login Button */}
                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="w-full py-4 bg-white border-2 border-gray-100 text-gray-700 rounded-2xl font-semibold text-lg flex items-center justify-center gap-3 hover:bg-gray-50 transition disabled:opacity-50 shadow-sm"
                        >
                            <svg className="w-6 h-6" viewBox="0 0 48 48">
                                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                            </svg>
                            Google bilan kirish
                        </button>
                    </form>
                </div>

                {/* Register Link */}
                <p className="text-center mt-6 text-gray-500">
                    Hisobingiz yo'qmi?{' '}
                    <Link to="/register" className="text-indigo-600 font-semibold hover:underline">
                        Ro'yxatdan o'tish
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
