import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyB-Bp_gjuChFhdGxRTPIb5w4zGS025ITx4",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "smarter-a99f4.firebaseapp.com",
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://smarter-a99f4-default-rtdb.firebaseio.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "smarter-a99f4",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "smarter-a99f4.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "201127037803",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:201127037803:web:32f85148679a0314645a2e"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getDatabase(app);
export default app;
