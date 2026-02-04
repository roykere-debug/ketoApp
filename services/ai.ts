const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

export type FoodAnalysis = {
    name: string;
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    ketoScore: number; // 1-10
    explanation: string;
};

// Helper for Google Gemini Call
async function callGemini(prompt: string, imageBase64?: string) {
    if (!API_KEY) throw new Error("Missing Google API Key");

    const body: any = {
        contents: [{
            parts: [
                { text: prompt }
            ]
        }]
    };

    if (imageBase64) {
        body.contents[0].parts.push({
            inline_data: {
                mime_type: "image/jpeg",
                data: imageBase64
            }
        });
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("No response from Gemini");

    return text;
}

export const analyzeImage = async (base64Image: string): Promise<FoodAnalysis> => {
    if (!base64Image) throw new Error("No image provided");

    const prompt = `Analyze this food image for a Keto diet app. You MUST return ONLY a raw JSON object (no markdown formatting, no backticks).
  JSON structure:
  {
    "name": "Hebrew name of dish",
    "calories": number,
    "protein": number,
    "fat": number,
    "carbs": number,
    "ketoScore": number (1-10),
    "explanation": "Short Hebrew explanation"
  }`;

    const content = await callGemini(prompt, base64Image);

    // Clean up if Gemini adds markdown code blocks
    const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();

    return JSON.parse(cleanContent);
};

export const getCoachResponse = async (history: any[], message: string): Promise<string> => {
    const systemPrompt = "You are a helpful, encouraging Keto diet coach speaking in Hebrew. Keep answers concise and motivating.";

    // Gemini doesn't support system prompts in the basic 'generateContent' the same way as chat history in a simple REST call without formatting.
    // We'll append it to the prompt for simplicity.
    const fullPrompt = `${systemPrompt}\nUser: ${message}`;

    return await callGemini(fullPrompt);
}
