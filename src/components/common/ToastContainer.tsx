import React from 'react';
import { useToast } from '../../context/ToastContext';

const ToastContainer: React.FC = () => {
    const { toasts, removeToast } = useToast();

    return (
        <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2">
            {toasts.map(toast => (
                <div
                    key={toast.id}
                    className={`
            px-6 py-3 rounded-2xl text-white font-bold shadow-2xl
            transform transition-all duration-300 cursor-pointer
            ${toast.type === 'success' ? 'bg-emerald-500' : ''}
            ${toast.type === 'error' ? 'bg-red-500' : ''}
            ${toast.type === 'info' ? 'bg-blue-500' : ''}
            ${toast.type === 'warning' ? 'bg-amber-500' : ''}
          `}
                    onClick={() => removeToast(toast.id)}
                >
                    {toast.message}
                </div>
            ))}
        </div>
    );
};

export default ToastContainer;
