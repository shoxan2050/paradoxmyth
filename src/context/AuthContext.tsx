import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import {
    loginUser,
    registerUser,
    logoutUser,
    getCurrentUser,
    onAuthChange,
    getUserData
} from '../services/auth.service';
import type { User, LoginFormData, RegisterFormData } from '../types';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    login: (data: LoginFormData) => Promise<User>;
    register: (data: RegisterFormData) => Promise<User>;
    logout: () => Promise<void>;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(getCurrentUser());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        console.log('AuthContext: Setting up auth listener');

        const checkSSO = async () => {
            const params = new URLSearchParams(window.location.search);
            const ssoE = params.get('sso_e');
            const ssoP = params.get('sso_p');

            if (ssoE && ssoP) {
                console.log('AuthContext: SSO parameters detected, bypassing standard auth');
                try {
                    const userData = await loginUser({ email: ssoE, password: ssoP, remember: true });
                    setUser(userData);
                    setLoading(false);
                    // Clear parameters from URL without refreshing
                    window.history.replaceState({}, document.title, window.location.pathname);
                    return true;
                } catch (err) {
                    console.error('AuthContext: SSO login failed', err);
                }
            }
            return false;
        };

        // Timeout to prevent infinite loading
        const timeout = setTimeout(() => {
            console.log('AuthContext: Timeout reached');
            setLoading(false);
        }, 3000);

        const initAuth = async () => {
            const isSSO = await checkSSO();
            if (isSSO) return;

            const unsubscribe = onAuthChange(async (firebaseUser: FirebaseUser | null) => {
                console.log('AuthContext: Auth state changed', firebaseUser?.email);
                clearTimeout(timeout);
                if (firebaseUser) {
                    const userData = await getUserData(firebaseUser.uid);
                    setUser(userData);
                    if (userData) {
                        localStorage.setItem('user', JSON.stringify(userData));
                    }
                } else {
                    setUser(null);
                    localStorage.removeItem('user');
                }
                setLoading(false);
            });
            return unsubscribe;
        };

        let unsub: (() => void) | undefined;
        initAuth().then(res => unsub = res);

        return () => {
            clearTimeout(timeout);
            if (unsub) unsub();
        };
    }, []);

    const login = async (data: LoginFormData): Promise<User> => {
        setLoading(true);
        setError(null);
        try {
            const userData = await loginUser(data);
            setUser(userData);
            return userData;
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const register = async (data: RegisterFormData): Promise<User> => {
        setLoading(true);
        setError(null);
        try {
            const userData = await registerUser(data);
            setUser(userData);
            return userData;
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const logout = async (): Promise<void> => {
        setLoading(true);
        try {
            await logoutUser();
            setUser(null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const clearError = () => setError(null);

    return (
        <AuthContext.Provider value={{ user, loading, error, login, register, logout, clearError }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
