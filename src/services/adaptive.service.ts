// Adaptive Learning Service for React
import { ref, get, update } from 'firebase/database';
import { db, auth } from './firebase';

export interface KnowledgeLevels {
    [subjectId: string]: 'beginner' | 'intermediate' | 'advanced';
}

export interface AdaptiveTest {
    subjectId: string;
    topicId: string;
    topicTitle: string;
    questions: any[];
    difficulty: string;
    generatedAt: number;
    grade: number;
}

export const AdaptiveService = {
    // Get user's knowledge level for a subject
    async getUserKnowledgeLevel(uid: string, subjectId: string): Promise<'beginner' | 'intermediate' | 'advanced'> {
        try {
            const snapshot = await get(ref(db, `users/${uid}/knowledgeLevels/${subjectId}`));
            return snapshot.exists() ? snapshot.val() : 'intermediate';
        } catch (e) {
            console.error('getUserKnowledgeLevel error:', e);
            return 'intermediate';
        }
    },

    // Get all knowledge levels for a user
    async getAllKnowledgeLevels(uid: string): Promise<KnowledgeLevels> {
        try {
            const snapshot = await get(ref(db, `users/${uid}/knowledgeLevels`));
            return snapshot.exists() ? snapshot.val() : {};
        } catch (e) {
            console.error('getAllKnowledgeLevels error:', e);
            return {};
        }
    },

    // Update knowledge level based on test score
    async updateKnowledgeLevel(uid: string, subjectId: string, testScore: number): Promise<string> {
        try {
            const currentLevel = await this.getUserKnowledgeLevel(uid, subjectId);
            let newLevel = currentLevel;

            if (testScore >= 80) {
                if (currentLevel === 'beginner') newLevel = 'intermediate';
                else if (currentLevel === 'intermediate') newLevel = 'advanced';
            } else if (testScore < 50) {
                if (currentLevel === 'advanced') newLevel = 'intermediate';
                else if (currentLevel === 'intermediate') newLevel = 'beginner';
            }

            if (newLevel !== currentLevel) {
                await update(ref(db), {
                    [`users/${uid}/knowledgeLevels/${subjectId}`]: newLevel,
                    [`users/${uid}/lastLevelUpdate`]: Date.now()
                });
                console.log(`Level updated: ${subjectId} ${currentLevel} -> ${newLevel}`);
            }

            return newLevel;
        } catch (e) {
            console.error('updateKnowledgeLevel error:', e);
            return 'intermediate';
        }
    },

    // Get auth token for API calls
    async getAuthToken(): Promise<string | null> {
        const user = auth.currentUser;
        if (!user) return null;
        try {
            return await user.getIdToken();
        } catch (e) {
            console.error('getAuthToken error:', e);
            return null;
        }
    },

    // Generate adaptive test
    async generateAdaptiveTest(
        subjectId: string,
        topicId: string,
        topicTitle: string,
        grade: number,
        knowledgeLevel: string
    ): Promise<AdaptiveTest | null> {
        const token = await this.getAuthToken();
        if (!token) {
            console.error('No auth token for adaptive test generation');
            return null;
        }

        try {
            const res = await fetch('/.netlify/functions/generateAdaptiveTest', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    subjectId,
                    topicId,
                    topicTitle,
                    grade,
                    knowledgeLevel
                })
            });

            if (!res.ok) {
                const err = await res.json();
                console.error('Adaptive test error:', err);
                return null;
            }

            return await res.json();
        } catch (e) {
            console.error('generateAdaptiveTest error:', e);
            return null;
        }
    },

    // Background test generation
    async backgroundGenerateTests(
        uid: string,
        subjects: Record<string, any>,
        grade: number
    ): Promise<void> {
        console.log('[AdaptiveService] Starting background test generation...');

        const knowledgeLevels = await this.getAllKnowledgeLevels(uid);
        const token = await this.getAuthToken();

        if (!token) {
            console.warn('No auth token for background generation');
            return;
        }

        for (const [subjectId, subject] of Object.entries(subjects)) {
            const level = knowledgeLevels[subjectId] || 'intermediate';

            const existingTest = await this.getAdaptiveTest(uid, subjectId, 'general', level);

            if (!existingTest) {
                console.log(`[AdaptiveService] Generating test for ${subjectId} (${level})...`);

                await new Promise(r => setTimeout(r, 2000));

                try {
                    await this.generateAdaptiveTest(
                        subjectId,
                        'general',
                        (subject as any).name || subjectId,
                        grade,
                        level
                    );
                    console.log(`[AdaptiveService] Generated test for ${subjectId}`);
                } catch (e) {
                    console.error(`[AdaptiveService] Failed to generate test for ${subjectId}:`, e);
                }
            } else {
                console.log(`[AdaptiveService] Test already exists for ${subjectId} (${level})`);
            }
        }

        console.log('[AdaptiveService] Background generation complete');
    },

    // Get user's adaptive test
    async getAdaptiveTest(
        uid: string,
        subjectId: string,
        topicId: string,
        level: string
    ): Promise<AdaptiveTest | null> {
        try {
            const testKey = `${subjectId}_${topicId || 'general'}_${level}`;
            const snapshot = await get(ref(db, `users/${uid}/adaptiveTests/${testKey}`));
            return snapshot.exists() ? snapshot.val() : null;
        } catch (e) {
            console.error('getAdaptiveTest error:', e);
            return null;
        }
    },

    // Get all adaptive tests for user
    async getAllAdaptiveTests(uid: string): Promise<Record<string, AdaptiveTest>> {
        try {
            const snapshot = await get(ref(db, `users/${uid}/adaptiveTests`));
            return snapshot.exists() ? snapshot.val() : {};
        } catch (e) {
            console.error('getAllAdaptiveTests error:', e);
            return {};
        }
    },

    // Save initial assessment results
    async saveInitialAssessment(uid: string, results: Record<string, { score: number; level: string }>): Promise<boolean> {
        try {
            const knowledgeLevels: KnowledgeLevels = {};
            Object.entries(results).forEach(([subject, data]) => {
                const key = subject.toLowerCase().replace(/\s+/g, '_');
                knowledgeLevels[key] = data.level as any;
            });

            await update(ref(db), {
                [`users/${uid}/knowledgeLevels`]: knowledgeLevels,
                [`users/${uid}/initialAssessment`]: {
                    completedAt: Date.now(),
                    results
                }
            });

            console.log('[AdaptiveService] Initial assessment saved:', knowledgeLevels);
            return true;
        } catch (e) {
            console.error('saveInitialAssessment error:', e);
            return false;
        }
    },

    // Calculate knowledge level from score
    calculateKnowledgeLevel(score: number): 'beginner' | 'intermediate' | 'advanced' {
        if (score >= 80) return 'advanced';
        if (score >= 50) return 'intermediate';
        return 'beginner';
    }
};
