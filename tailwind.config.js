/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                'poppins': ['Poppins', 'sans-serif'],
                'inter': ['Inter', 'sans-serif'],
            },
            colors: {
                primary: {
                    50: '#eef2ff',
                    100: '#e0e7ff',
                    200: '#c7d2fe',
                    300: '#a5b4fc',
                    400: '#818cf8',
                    500: '#6366f1',
                    600: '#4f46e5',
                    700: '#4338ca',
                    800: '#3730a3',
                    900: '#312e81',
                }
            },
            animation: {
                'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
                'float': 'float 6s ease-in-out infinite',
                'slide-in': 'slideIn 0.3s ease forwards',
                'fade-in': 'fadeIn 0.3s ease forwards',
            },
            keyframes: {
                pulseGlow: {
                    '0%, 100%': { boxShadow: '0 0 20px rgba(102, 126, 234, 0.3)' },
                    '50%': { boxShadow: '0 0 40px rgba(102, 126, 234, 0.6)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                slideIn: {
                    from: { opacity: '0', transform: 'translateX(30px)' },
                    to: { opacity: '1', transform: 'translateX(0)' },
                },
                fadeIn: {
                    from: { opacity: '0', transform: 'translateY(10px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
            },
        },
    },
    plugins: [],
}
