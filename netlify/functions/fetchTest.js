import fetch from "node-fetch";

export async function handler(event) {
    try {
        if (event.httpMethod !== "GET") {
            return { statusCode: 405, body: "Method Not Allowed" };
        }

        // --- Security Protocols ---
        const token = event.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return { statusCode: 401, body: JSON.stringify({ error: "Unauthorized" }) };
        }

        // Initialize Firebase Admin (Singleton)
        let admin;
        try {
            admin = await import("firebase-admin");
            if (admin.apps.length === 0) {
                admin.initializeApp({
                    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
                    databaseURL: "https://edu-platform-default-rtdb.firebaseio.com"
                });
            }
        } catch (e) {
            console.error("Firebase Admin Error:", e);
            return { statusCode: 500, body: JSON.stringify({ error: "Server Configuration Error" }) };
        }

        // Verify Token
        const decodedToken = await admin.auth().verifyIdToken(token);
        const uid = decodedToken.uid;

        // --- Logic ---
        const { subjectId, lessonId } = event.queryStringParameters;

        if (!subjectId || !lessonId) {
            return { statusCode: 400, body: JSON.stringify({ error: "Missing subjectId or lessonId" }) };
        }

        // Fetch Full Test Data
        const testRef = admin.database().ref(`tests/${subjectId}/${lessonId}`);
        const testSnap = await testRef.once('value');

        if (!testSnap.exists()) {
            return { statusCode: 404, body: JSON.stringify({ error: "Test not found" }) };
        }

        const fullTest = testSnap.val();

        // --- DATA SANITIZATION (CRITICAL) ---
        // Strip out 'correct' answer field from questions
        const sanitizedQuestions = (fullTest.questions || []).map(q => {
            const { correct, ...safeQuestion } = q; // Destructure to remove 'correct'
            return safeQuestion;
        });

        // Safe Payload
        const clientPayload = {
            id: fullTest.id || lessonId,
            questions: sanitizedQuestions,
            duration: fullTest.duration || (sanitizedQuestions.length * 60) // Default 1 min per question if not set
        };

        // Server-side Timer Start (Optional: Record start time here for stricter checking later)
        // await admin.database().ref(`users/${uid}/active_tests/${lessonId}`).set({ startTime: Date.now() });

        return {
            statusCode: 200,
            body: JSON.stringify(clientPayload)
        };

    } catch (err) {
        console.error("Fetch Test Error:", err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: err.message })
        };
    }
}
