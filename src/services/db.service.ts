import { ref, get, set, update, push, remove } from 'firebase/database';
import { db } from './firebase';
import type { Subject, Lesson, Test, Question, User } from '../types';

export const DbService = {
    // Subjects
    async getAllSubjects(): Promise<Record<string, Subject>> {
        const snapshot = await get(ref(db, 'subjects'));
        return snapshot.val() || {};
    },

    async getAllUsers(): Promise<Record<string, User>> {
        const snapshot = await get(ref(db, 'users'));
        return snapshot.val() || {};
    },

    async getSubjectsByClass(studentClass: number): Promise<Record<string, Subject>> {
        const snapshot = await get(ref(db, 'subjects'));
        const allSubjects = snapshot.val() || {};
        const filtered: Record<string, Subject> = {};

        Object.entries(allSubjects).forEach(([id, s]: [string, any]) => {
            if (s.classes?.includes(studentClass) || s.class === studentClass.toString()) {
                filtered[id] = s;
            }
        });

        return filtered;
    },

    async getSubject(id: string): Promise<Subject | null> {
        const snapshot = await get(ref(db, `subjects/${id}`));
        return snapshot.exists() ? snapshot.val() : null;
    },

    // Lessons
    async getLesson(subjectId: string, lessonId: string): Promise<Lesson | null> {
        const snapshot = await get(ref(db, `subjects/${subjectId}/lessons/${lessonId}`));
        return snapshot.exists() ? snapshot.val() : null;
    },

    // Tests
    async getTests(subjectId: string, lessonId: string): Promise<Test | null> {
        const snapshot = await get(ref(db, `tests/${subjectId}/${lessonId}`));
        return snapshot.exists() ? snapshot.val() : null;
    },

    async getAllTests(): Promise<Record<string, Record<string, Test>>> {
        const snapshot = await get(ref(db, 'tests'));
        return snapshot.val() || {};
    },

    async saveTest(subjectId: string, lessonId: string, testData: any): Promise<void> {
        await set(ref(db, `tests/${subjectId}/${lessonId}`), {
            ...testData,
            createdAt: Date.now()
        });
        await update(ref(db, `subjects/${subjectId}/lessons/${lessonId}`), {
            testGenerated: true,
            lastGenerated: Date.now()
        });
    },

    async updateTest(subjectId: string, lessonId: string, questions: Question[]): Promise<void> {
        const updates: any = {};
        updates[`tests/${subjectId}/${lessonId}/questions`] = questions;
        updates[`tests/${subjectId}/${lessonId}/updatedAt`] = Date.now();
        await update(ref(db), updates);
    },

    // User Progress
    async saveUserProgress(uid: string, subjectId: string, lessonId: string, score: number): Promise<void> {
        const updates: any = {};
        updates[`users/${uid}/progress/${subjectId}/${lessonId}`] = score;
        await update(ref(db), updates);
    },

    async saveTestResult(uid: string, subjectId: string, lessonId: string, score: number, answers: number[]): Promise<void> {
        const resultId = push(ref(db, `testResults/${uid}`)).key;
        if (resultId) {
            await set(ref(db, `testResults/${uid}/${resultId}`), {
                subjectId,
                lessonId,
                score,
                answers,
                timestamp: Date.now()
            });
        }
    },

    // Admin/Teacher operations
    async createSubject(name: string, createdBy: string, icon: string = "📚"): Promise<string> {
        const subjectId = `S-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        await set(ref(db, `subjects/${subjectId}`), {
            id: subjectId,
            name,
            icon,
            createdBy,
            createdAt: Date.now(),
            path: [],
            classes: []
        });
        return subjectId;
    },

    async deleteSubject(id: string): Promise<void> {
        await remove(ref(db, `subjects/${id}`));
        await remove(ref(db, `tests/${id}`));
    },

    async updateSubject(id: string, updates: Partial<Subject>): Promise<void> {
        await update(ref(db, `subjects/${id}`), updates);
    },

    // User Management (Admin only)
    async deleteUser(uid: string): Promise<void> {
        await remove(ref(db, `users/${uid}`));
        await remove(ref(db, `testResults/${uid}`));
    },

    async updateUserRole(uid: string, role: string): Promise<void> {
        await update(ref(db, `users/${uid}`), { role });
    },

    async getLogs(path: string = 'uploads'): Promise<any[]> {
        const snapshot = await get(ref(db, `logs/${path}`));
        const data = snapshot.val() || {};
        return Object.values(data).sort((a: any, b: any) => b.timestamp - a.timestamp);
    },

    async commitBatchUpload(updates: Record<string, any>, logName: string, userUid: string): Promise<void> {
        await update(ref(db), updates);
        await push(ref(db, 'logs/uploads'), {
            timestamp: Date.now(),
            fileName: logName,
            userUid,
            rowCount: Object.keys(updates).length
        });
    }
};
