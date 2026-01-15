export async function handler(event) {
    try {
        if (event.httpMethod !== "POST") {
            return { statusCode: 405, body: "Method Not Allowed" };
        }

        // --- Security Protocols ---
        const token = event.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return { statusCode: 401, body: JSON.stringify({ error: "Unauthorized" }) };
        }

        // Dynamic check for admin to avoid cold start crashes if not installed yet (though user should install it)
        let admin;
        try {
            admin = await import("firebase-admin");
            // Initialize only once
            if (admin.apps.length === 0) {
                admin.initializeApp({
                    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
                });
            }
        } catch (e) {
            // If firebase-admin is missing or service account env var is missing
            console.error("Firebase Admin Error:", e);
            return { statusCode: 500, body: JSON.stringify({ error: "Server Configuration Error" }) };
        }

        const decodedToken = await admin.auth().verifyIdToken(token);
        const userRef = admin.database().ref(`users/${decodedToken.uid}`);
        const userSnap = await userRef.once('value');
        const userData = userSnap.val();

        if (userData?.role !== 'teacher') {
            return { statusCode: 403, body: JSON.stringify({ error: "Forbidden: Teachers Only" }) };
        }

        // --- Rate Limiting Strategy ---
        // Per-lesson 24h cooldown to prevent AI abuse
        const { topic, subjectId, lessonId, force } = JSON.parse(event.body || "{}");

        if (!topic || !lessonId) {
            return { statusCode: 400, body: JSON.stringify({ error: "Topic and lessonId required" }) };
        }

        const lessonCooldownKey = `limits/lessons/${lessonId}/lastGenerated`;
        const lastLessonGen = userData.limits?.lessons?.[lessonId]?.lastGenerated || 0;
        const now = Date.now();
        const COOLDOWN_24H = 24 * 60 * 60 * 1000;

        if (!force && (now - lastLessonGen < COOLDOWN_24H)) {
            const hoursLeft = Math.ceil((COOLDOWN_24H - (now - lastLessonGen)) / (60 * 60 * 1000));
            return {
                statusCode: 429,
                body: JSON.stringify({ error: `Bu dars uchun 24 soat kutish kerak. Qoldi: ~${hoursLeft} soat` })
            };
        }

        // Update timestamp immediately
        await userRef.child(lessonCooldownKey).set(now);


        const API_KEY = process.env.OPEN_ROUTER_KEY;
        if (!API_KEY) {
            return { statusCode: 500, body: JSON.stringify({ error: "OpenRouter API key missing" }) };
        }

        // OpenRouter model - bepul va tez
        const MODEL = "xiaomi/mimo-v2-flash:free";

        // --- Prompt Construction ---
        const prompt = `
SEN TA'LIM PLATFORMASI UCHUN TEST YARATUVCHI AIsan.

MAVZU: "${topic}"

QOIDALAR:
- 5 ta savol bo'lsin
- Savollar maktab darajasida
- Variantlar aniq va chalg'ituvchi bo'lmasin
- 1 ta to'g'ri javob

FORMAT (QAT'IY):
{
  "questions": [
    {
      "question": "Savol matni",
      "options": ["A", "B", "C", "D"],
      "correct": 0,
      "difficulty": "easy | medium | hard",
      "explanation": "Nima uchun shu javob to'g'ri"
    }
  ]
}

QO'SHIMCHA:
- difficulty real baholansin
- explanation qisqa va tushunarli bo'lsin
- HTML YO'Q
- Faqat JSON qaytar
`;

        // OpenRouter API call (OpenAI-compatible format)
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`,
                "HTTP-Referer": "https://eduplatform.netlify.app",
                "X-Title": "EduPlatform Test Generator"
            },
            body: JSON.stringify({
                model: MODEL,
                messages: [
                    { role: "system", content: "Sen ta'lim platformasi uchun test yaratuvchi AI san. Faqat JSON formatda javob ber." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 2000
            })
        });

        const data = await res.json();

        // OpenRouter response format
        const text = data?.choices?.[0]?.message?.content || "";

        if (!text) {
            throw new Error("AI responded with an empty body. Check API quota.");
        }

        // JSON ni tozalash (ba'zan markdown code block bilan keladi)
        let cleanText = text.trim();
        if (cleanText.startsWith('```json')) {
            cleanText = cleanText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleanText.startsWith('```')) {
            cleanText = cleanText.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }

        const json = JSON.parse(cleanText);

        if (!json.questions || !Array.isArray(json.questions)) {
            throw new Error("Invalid AI JSON format");
        }

        const validatedQuestions = json.questions.slice(0, 5).map(q => {
            // Robust Options Parsing (Handle Object vs Array)
            let options = q.options;
            if (options && typeof options === 'object' && !Array.isArray(options)) {
                options = Object.values(options);
            }
            if (!Array.isArray(options) || options.length !== 4) {
                options = ["A", "B", "C", "D"];
            }

            // Robust Correct Answer Parsing (Handle "A"/"B" string vs 0/1 number)
            let correct = q.correct;
            if (typeof correct === 'string') {
                const charCode = correct.toUpperCase().charCodeAt(0);
                if (charCode >= 65 && charCode <= 68) {
                    correct = charCode - 65;
                } else {
                    correct = 0;
                }
            } else if (typeof correct !== 'number') {
                correct = 0;
            }

            return {
                question: q.question || "Savol matni mavjud emas",
                options: options,
                correct: correct,
                difficulty: q.difficulty || "o'rtacha",
                explanation: q.explanation || "Tushuntirish yo'q"
            };
        });

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                topic: topic,
                questions: validatedQuestions,
                lessonId: lessonId || null,
                timestamp: Date.now()
            })
        };

    } catch (err) {
        console.error("AI handler error:", err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: err.message })
        };
    }
}
