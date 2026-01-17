import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';


const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
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
