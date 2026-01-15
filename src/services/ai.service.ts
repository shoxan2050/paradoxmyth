export const AiService = {
    async generateTest(topic: string, subjectId: string, lessonId: string, token: string, grade: number = 7, force: boolean = false) {
        // Note: In a production environment, this should be handled via a proxy or serverless function
        // to keep the API key secure. However, per the original project structure, it uses a Netlify function.
        // For the React migration, we'll implement the fetch call to the expected endpoint.

        try {
            const response = await fetch('/.netlify/functions/generateTest', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ topic, subjectId, lessonId, grade, force })
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.error || `AI error: ${response.status}`);
            }

            return await response.json();
        } catch (error: any) {
            console.error('AiService generateTest error:', error);
            throw error;
        }
    }
};
