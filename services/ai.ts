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

export const getCoachResponse = async (
    history: { role: "user" | "assistant"; text: string }[],
    message: string,
    mealContext?: string
): Promise<string> => {
    if (!API_KEY) throw new Error("Missing Google API Key");

    const systemPrompt = `You are a helpful, encouraging Keto diet coach speaking in Hebrew. Keep answers concise and motivating.
${mealContext ? `\nהנה המידע על הארוחות של המשתמש היום:\n${mealContext}\nהשתמש במידע הזה כדי לתת תשובות מותאמות אישית.` : ""}`;

    const contents: any[] = [];

    contents.push({
        role: "user",
        parts: [{ text: systemPrompt + "\n\nענה תמיד בעברית, בקצרה ובאופן מעודד." }],
    });
    contents.push({
        role: "model",
        parts: [{ text: "הבנתי! אני המאמן הקיטו שלך ואני כאן לעזור. איך אני יכול לעזור?" }],
    });

    for (const msg of history.slice(1)) {
        contents.push({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.text }],
        });
    }

    contents.push({
        role: "user",
        parts: [{ text: message }],
    });

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents }),
        }
    );

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("No response from Gemini");

    return text;
};

export type FoodNutrition = {
    name: string;
    name_hebrew: string;
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    fiber: number;
    sugar: number;
    serving_size: string;
    category: string;
};

export const searchFoodNutrition = async (foodName: string): Promise<FoodNutrition | null> => {
    try {
        const prompt = `You are a nutrition database. Find nutritional information for: "${foodName}"
        
Return ONLY a raw JSON object (no markdown, no backticks, no explanation) with this EXACT structure:
{
  "name": "English name",
  "name_hebrew": "Hebrew name",
  "calories": number (per 100g),
  "protein": number (grams per 100g),
  "fat": number (grams per 100g),
  "carbs": number (grams per 100g),
  "fiber": number (grams per 100g),
  "sugar": number (grams per 100g),
  "serving_size": "100g",
  "category": "Hebrew category (חלבון/ירקות/שומן/פירות/דגנים)"
}

If you don't know the exact values, provide your best estimate based on typical nutritional data.`;

        const content = await callGemini(prompt);
        
        // Clean up markdown if present
        const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
        
        const parsed = JSON.parse(cleanContent);
        
        // Validate required fields
        if (!parsed.name || typeof parsed.calories !== 'number') {
            throw new Error('Invalid response format');
        }
        
        return parsed;
    } catch (error) {
        console.error("Error searching food nutrition with AI:", error);
        return null;
    }
};

export type KetoSuggestion = {
    suggestions: string[];
    summary: string;
};

export const getKetoImprovementSuggestions = async (
    currentScore: number,
    totals: { calories: number; protein: number; fat: number; carbs: number },
    goals: { calories: number; protein: number; fat: number; carbs: number }
): Promise<KetoSuggestion> => {
    const prompt = `You are a helpful Keto diet coach. The user's current keto score today is ${currentScore}/10.

Their current intake today:
- קלוריות: ${totals.calories} / ${goals.calories}
- חלבון: ${totals.protein}g / ${goals.protein}g
- שומן: ${totals.fat}g / ${goals.fat}g
- פחמימות: ${totals.carbs}g / ${goals.carbs}g

Provide 3-4 specific, actionable suggestions in Hebrew to improve their keto score today.

Return ONLY a raw JSON object (no markdown, no backticks) with this structure:
{
  "summary": "Short encouraging Hebrew summary (1 sentence)",
  "suggestions": [
    "suggestion 1 in Hebrew",
    "suggestion 2 in Hebrew",
    "suggestion 3 in Hebrew"
  ]
}

Keep suggestions specific, positive, and actionable. Focus on what they can do right now or for their next meal.`;

    const content = await callGemini(prompt);
    const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(cleanContent);
};
