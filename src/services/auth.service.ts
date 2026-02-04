import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { ref, set, update, get } from 'firebase/database';
import { auth, db } from './firebase';
import type { User, RegisterFormData, LoginFormData } from '../types';

// Error message translations
const getFriendlyErrorMessage = (code: string): string => {
    switch (code) {
        case 'auth/user-not-found': return "Foydalanuvchi topilmadi. 👤";
        case 'auth/wrong-password': return "Parol noto'g'ri. 🔑";
        case 'auth/email-already-in-use': return "Ushbu email allaqachon ro'yxatdan o'tgan. 📧";
        case 'auth/invalid-email': return "Email formati noto'g'ri. 📬";
        case 'auth/weak-password': return "Parol juda kuchsiz (kamida 6 ta belgi). 🛡️";
        case 'auth/network-request-failed': return "Internet bilan muammo yuz berdi. 🌐";
        case 'auth/invalid-credential': return "Email yoki parol noto'g'ri. 🔐";
        default: return "Kutilmagan xato yuz berdi. Iltimos qaytadan urinib ko'ring.";
    }
};

// Register new user
export const registerUser = async (data: RegisterFormData): Promise<User> => {
    try {
        let firebaseUser;

        // If password is dummy or empty, and user is already logged in (Google)
        if ((!data.password || data.password === 'google-auth-protected') && auth.currentUser) {
            firebaseUser = auth.currentUser;
        } else {
            const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
            firebaseUser = userCredential.user;
        }

        const userData: User = {
            uid: firebaseUser.uid,
            name: data.name,
            email: data.email,
            role: data.role || 'student',
            sinf: data.sinf,
            viloyat: data.viloyat,
            tuman: data.tuman,
            maktab: data.maktab,
            phone: '',
            goal: data.goal || null,
            level: data.level || null,
            schedule: data.schedule || null,
            streak: 0,
            lastActive: null,
            progress: {},
            // Adaptive learning fields
            knowledgeLevels: data.knowledgeLevels || {},
            initialAssessment: data.assessmentResults ? {
                completedAt: Date.now(),
                results: data.assessmentResults
            } : null,
            adaptiveTests: {}
        };

        await set(ref(db, 'users/' + firebaseUser.uid), userData);
        localStorage.setItem('user', JSON.stringify(userData));

        return userData;
    } catch (error: any) {
        throw new Error(getFriendlyErrorMessage(error.code));
    }
};



// Login user
export const loginUser = async (data: LoginFormData): Promise<User> => {
    try {
        const persistence = data.remember ? browserLocalPersistence : browserSessionPersistence;
        await setPersistence(auth, persistence);

        const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
        const firebaseUser = userCredential.user;

        const snapshot = await get(ref(db, 'users/' + firebaseUser.uid));

        if (!snapshot.exists()) {
            throw new Error("Foydalanuvchi ma'lumotlari topilmadi");
        }

        const userData = snapshot.val() as User;
        userData.uid = firebaseUser.uid;

        // Update streak logic
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];

        if (userData.lastActive) {
            const lastActiveDate = new Date(userData.lastActive);
            const lastActiveStr = lastActiveDate.toISOString().split('T')[0];

            const yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            if (lastActiveStr === todayStr) {
                // Already active today
            } else if (lastActiveStr === yesterdayStr) {
                userData.streak = (userData.streak || 0) + 1;
            } else {
                userData.streak = 1;
            }
        } else {
            userData.streak = 1;
        }

        userData.lastActive = now.toISOString();

        await update(ref(db, 'users/' + firebaseUser.uid), {
            lastActive: userData.lastActive,
            streak: userData.streak
        });

        localStorage.setItem('user', JSON.stringify(userData));

        return userData;
    } catch (error: any) {
        throw new Error(getFriendlyErrorMessage(error.code || error.message));
    }
};

// Google Sign In
export const signInWithGoogle = async (): Promise<{ firebaseUser: FirebaseUser; userData: User | null }> => {
    try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const firebaseUser = result.user;

        const snapshot = await get(ref(db, 'users/' + firebaseUser.uid));

        if (snapshot.exists()) {
            const userData = snapshot.val() as User;
            userData.uid = firebaseUser.uid;

            // Update streak logic (same as login)
            const now = new Date();
            const todayStr = now.toISOString().split('T')[0];

            if (userData.lastActive) {
                const lastActiveDate = new Date(userData.lastActive);
                const lastActiveStr = lastActiveDate.toISOString().split('T')[0];
                const yesterday = new Date(now);
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split('T')[0];

                if (lastActiveStr === todayStr) { /* Already active */ }
                else if (lastActiveStr === yesterdayStr) { userData.streak = (userData.streak || 0) + 1; }
                else { userData.streak = 1; }
            } else {
                userData.streak = 1;
            }

            userData.lastActive = now.toISOString();

            await update(ref(db, 'users/' + firebaseUser.uid), {
                lastActive: userData.lastActive,
                streak: userData.streak
            });

            localStorage.setItem('user', JSON.stringify(userData));
            return { firebaseUser, userData };
        }

        return { firebaseUser, userData: null };
    } catch (error: any) {
        throw new Error(getFriendlyErrorMessage(error.code || error.message));
    }
};

// Logout user
export const logoutUser = async (): Promise<void> => {
    localStorage.removeItem('user');
    await signOut(auth);
};

// Get current user from localStorage
export const getCurrentUser = (): User | null => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            return JSON.parse(userStr) as User;
        } catch {
            return null;
        }
    }
    return null;
};

// Subscribe to auth state changes
export const onAuthChange = (callback: (user: FirebaseUser | null) => void) => {
    return onAuthStateChanged(auth, callback);
};

// Get user data from database
export const getUserData = async (uid: string): Promise<User | null> => {
    try {
        const snapshot = await get(ref(db, 'users/' + uid));
        if (snapshot.exists()) {
            return { ...snapshot.val(), uid } as User;
        }
        return null;
    } catch {
        return null;
    }
};
