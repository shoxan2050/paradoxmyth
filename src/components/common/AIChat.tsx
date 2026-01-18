import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../services/firebase';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface AIChatProps {
    isOpen: boolean;
    onClose: () => void;
    context?: string;
}

const AIChat: React.FC<AIChatProps> = ({ isOpen, onClose, context = 'umumiy' }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedContext, setSelectedContext] = useState(context);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { user } = useAuth();

    // Load saved chat history
    useEffect(() => {
        const saved = localStorage.getItem('aiChatHistory');
        if (saved) {
            try {
                setMessages(JSON.parse(saved));
            } catch (e) {
                setMessages([]);
            }
        }
    }, []);

    // Save chat history
    useEffect(() => {
        if (messages.length > 0) {
            const toSave = messages.slice(-50); // Keep last 50 messages
            localStorage.setItem('aiChatHistory', JSON.stringify(toSave));
        }
    }, [messages]);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setLoading(true);

        try {
            const firebaseUser = auth.currentUser;
            if (!firebaseUser) {
                setMessages(prev => [...prev, { role: 'assistant', content: "Iltimos, avval tizimga kiring." }]);
                return;
            }

            const token = await firebaseUser.getIdToken();

            const res = await fetch('/.netlify/functions/aiChat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    message: userMessage,
                    context: selectedContext,
                    grade: parseInt(user?.sinf || '7'),
                    chatHistory: messages.slice(-10)
                })
            });

            if (!res.ok) {
                throw new Error('AI javob bermadi');
            }

            const data = await res.json();
            setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "Kechirasiz, xatolik yuz berdi. Iltimos, qayta urinib ko'ring."
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleClearHistory = () => {
        if (window.confirm("Chat tarixini tozalashni xohlaysizmi?")) {
            setMessages([]);
            localStorage.removeItem('aiChatHistory');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Chat Panel */}
            <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl flex flex-col animate-slide-in-right">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                            <span className="text-xl">🤖</span>
                        </div>
                        <div>
                            <h3 className="font-bold">AI Yordamchi</h3>
                            <p className="text-xs opacity-80">Savolingizni bering</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleClearHistory}
                            className="p-2 hover:bg-white/20 rounded-full transition"
                            title="Tarixni tozalash"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-full transition"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Context Selector */}
                <div className="p-3 border-b border-gray-100 bg-gray-50">
                    <select
                        value={selectedContext}
                        onChange={(e) => setSelectedContext(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                    >
                        <option value="umumiy">🎯 Umumiy yordam</option>
                        <option value="matematika">📐 Matematika</option>
                        <option value="fizika">⚡ Fizika</option>
                        <option value="ingliz_tili">🌍 Ingliz tili</option>
                        <option value="ona_tili">📖 Ona tili</option>
                        <option value="kimyo">🧪 Kimyo</option>
                        <option value="biologiya">🌿 Biologiya</option>
                    </select>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* Welcome message */}
                    <div className="flex gap-3">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span>🤖</span>
                        </div>
                        <div className="bg-gray-100 rounded-2xl rounded-tl-md px-4 py-3 max-w-[80%]">
                            <p className="text-gray-800 text-sm">
                                Salom! Men sizning AI yordamchingizman. Darslar, testlar yoki har qanday mavzu bo'yicha savollaringizga javob berishga tayyorman. 📚
                            </p>
                        </div>
                    </div>

                    {/* Chat messages */}
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                            {msg.role === 'assistant' && (
                                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span>🤖</span>
                                </div>
                            )}
                            <div className={`rounded-2xl px-4 py-3 max-w-[80%] ${msg.role === 'user'
                                    ? 'bg-indigo-600 text-white rounded-tr-md'
                                    : 'bg-gray-100 text-gray-800 rounded-tl-md'
                                }`}>
                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                            </div>
                        </div>
                    ))}

                    {/* Typing indicator */}
                    {loading && (
                        <div className="flex gap-3">
                            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <span>🤖</span>
                            </div>
                            <div className="bg-gray-100 rounded-2xl rounded-tl-md px-4 py-3">
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-gray-100 bg-white">
                    <form
                        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                        className="flex gap-2"
                    >
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 transition"
                            placeholder="Savolingizni yozing..."
                            autoComplete="off"
                        />
                        <button
                            type="submit"
                            disabled={loading || !input.trim()}
                            className="px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

// Floating AI Chat Button component
export const AIChatButton: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-40 lg:bottom-6"
            >
                <span className="text-2xl">{isOpen ? '✕' : '🤖'}</span>
            </button>
            <AIChat isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    );
};

export default AIChat;
