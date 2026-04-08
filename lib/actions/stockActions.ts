'use server';

export async function getStockAIInsight(symbol: string, companyName?: string): Promise<{ insight: string; error?: string }> {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return { insight: '', error: 'Gemini API key not configured.' };
    }

    const prompt = `You are a concise financial analyst. For the stock "${symbol}"${companyName ? ` (${companyName})` : ''}, provide a brief 3-4 sentence overview covering:
1. What the company does
2. Its recent market position / performance trend
3. Key factors investors should be aware of

Be factual, neutral, and professional. Do NOT use markdown formatting. Just plain text.`;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { maxOutputTokens: 200, temperature: 0.4 },
                }),
            }
        );

        if (!response.ok) {
            return { insight: '', error: `API error: ${response.statusText}` };
        }

        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
        return { insight: text.trim() };
    } catch (err) {
        return { insight: '', error: 'Failed to fetch AI insight.' };
    }
}
