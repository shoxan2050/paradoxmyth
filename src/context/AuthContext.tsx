import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import {
    loginUser,
    registerUser,
    logoutUser,
    getCurrentUser,
    onAuthChange,
    getUserData,
    signInWithGoogle,
    isAdmin
} from '../services/auth.service';
import type { User, LoginFormData, RegisterFormData } from '../types';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    login: (data: LoginFormData) => Promise<User>;
    register: (data: RegisterFormData) => Promise<User>;
    loginWithGoogle: () => Promise<{ firebaseUser: FirebaseUser; userData: User | null }>;
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

        // Timeout to prevent infinite loading if Firebase doesn't respond
        const timeout = setTimeout(() => {
            console.log('AuthContext: Timeout reached, setting loading to false');
            setLoading(false);
        }, 2000);

        const unsubscribe = onAuthChange(async (firebaseUser: FirebaseUser | null) => {
            console.log('AuthContext: Auth state changed', firebaseUser?.email);
            clearTimeout(timeout);
            if (firebaseUser) {
                let userData = await getUserData(firebaseUser.uid);

                // Double check admin status via Remote Config
                if (userData && firebaseUser.email) {
                    const isUserAdmin = await isAdmin(firebaseUser.email);
                    if (isUserAdmin && userData.role !== 'admin') {
                        userData = { ...userData, role: 'admin' };
                    }
                }

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

        return () => {
            clearTimeout(timeout);
            unsubscribe();
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

    const loginWithGoogle = async (): Promise<{ firebaseUser: FirebaseUser; userData: User | null }> => {
        setLoading(true);
        setError(null);
        try {
            const result = await signInWithGoogle();
            if (result.userData) {
                setUser(result.userData);
            }
            return result;
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
        <AuthContext.Provider value={{ user, loading, error, login, register, loginWithGoogle, logout, clearError }}>
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
