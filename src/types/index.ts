// User types
export interface User {
    uid: string;
    name: string;
    email: string;
    role: 'student' | 'teacher' | 'admin';
    sinf: string | null;
    viloyat: string | null;
    tuman: string | null;
    maktab: string | null;
    phone: string;
    goal: 'til' | 'it' | 'matematika' | null;
    level: 'beginner' | 'intermediate' | 'advanced' | null;
    schedule: number | null;
    streak: number;
    lastActive: string | null;
    progress: Record<string, Record<string, number>>;
}

export interface AuthState {
    user: User | null;
    loading: boolean;
    error: string | null;
}

// Subject types
export interface Subject {
    id: string;
    name: string;
    icon?: string;
    class?: string;
    classes?: number[];
    lessons?: Record<string, Lesson>;
    path?: string[];
    createdBy?: string;
    createdAt?: number;
    lessonsCount?: number;
    testsCount?: number;
}

// Lesson types
export interface Lesson {
    id: string;
    subjectId: string;
    title: string;
    order: number;
    icon?: string;
    content?: string;
    homework?: string;
    sinf?: number;
    testGenerated: boolean;
    uploadedBy?: string;
    timestamp?: number;
}

// Test types
export interface Question {
    question: string;
    options: string[];
    correct: number;
    difficulty: 'easy' | 'medium' | 'hard';
    explanation?: string;
}

export interface Test {
    id: string;
    lessonId: string;
    questions: Question[];
    timeLimit?: number;
}

export interface TestResult {
    id: string;
    oduvchiId: string;
    testId: string;
    answers: number[];
    score: number;
    percentage: number;
    completedAt: string;
}

// Registration form data
export interface RegisterFormData {
    name: string;
    email: string;
    password: string;
    sinf: string;
    viloyat: string;
    tuman: string;
    maktab: string;
    goal?: 'til' | 'it' | 'matematika';
    level?: 'beginner' | 'intermediate' | 'advanced';
    schedule?: number;
    role: 'student' | 'teacher';
}

// Login form data
export interface LoginFormData {
    email: string;
    password: string;
    remember?: boolean;
}

// Maktab data
export interface Maktab {
    viloyat: string;
    tuman: string;
    maktab: string;
}

// Toast types
export interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
}
