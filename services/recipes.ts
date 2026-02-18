const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

export type Recipe = {
    id: string;
    title: string;
    ingredients: string[];
    instructions: string;
    ketoScore: number;
    nutrition: {
        calories: number;
        protein: number;
        fat: number;
        carbs: number;
    };
    imagePrompt?: string;
};

async function callGemini(prompt: string) {
    if (!API_KEY) throw new Error("Missing Google API Key");

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            }),
        }
    );

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("No response from Gemini");

    return text;
}

export const suggestRecipes = async (ingredients: string[]): Promise<Recipe[]> => {
    if (ingredients.length === 0) return [];

    try {
        const ingredientsList = ingredients.join(", ");
        
        const prompt = `You are a Keto diet recipe expert. Based on these ingredients: ${ingredientsList}

Generate 3-5 creative Keto-friendly recipes that use some or all of these ingredients. Each recipe should be realistic and practical.

Return ONLY a raw JSON array (no markdown, no backticks) with this EXACT structure:
[
  {
    "id": "unique-id-1",
    "title": "שם המתכון בעברית",
    "ingredients": ["רשימת", "מרכיבים", "בעברית"],
    "instructions": "הוראות הכנה מפורטות בעברית (2-3 משפטים)",
    "ketoScore": number (1-10, based on how keto-friendly it is),
    "nutrition": {
      "calories": number (estimated calories per serving),
      "protein": number (grams of protein per serving),
      "fat": number (grams of fat per serving),
      "carbs": number (grams of carbs per serving)
    },
    "imagePrompt": "detailed English description of the dish appearance for image generation (be specific about colors, plating, garnish)"
  }
]

Important:
- All text fields (title, ingredients, instructions) MUST be in Hebrew
- Use realistic ingredient combinations
- Instructions should be clear and concise (2-3 sentences)
- ketoScore should reflect actual keto-friendliness (high fat, low carb = high score)
- Nutrition values should be realistic estimates for a single serving
- imagePrompt should be in English and describe the visual appearance of the dish in detail
- Try to use the ingredients provided by the user
- Each recipe should be different and creative`;

        const content = await callGemini(prompt);
        
        // Clean up if Gemini adds markdown code blocks
        const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
        
        const recipes = JSON.parse(cleanContent);
        
        // Validate the response
        if (!Array.isArray(recipes)) {
            throw new Error('Invalid response format');
        }
        
        return recipes;
    } catch (error) {
        console.error("Error generating recipes with AI:", error);
        
        // Return fallback recipes with the user's ingredients mentioned
        return [
            {
                id: "fallback-1",
                title: `מתכון קיטו עם ${ingredients[0] || 'מרכיבים'}`,
                ingredients: ingredients.slice(0, 3),
                instructions: "לא הצלחנו לייצר מתכון מותאם. נסה שוב או בדוק את חיבור האינטרנט.",
                ketoScore: 8,
                nutrition: {
                    calories: 0,
                    protein: 0,
                    fat: 0,
                    carbs: 0,
                },
            }
        ];
    }
};

// Generate image for recipe using Google Imagen (via Gemini API)
export const generateRecipeImage = async (imagePrompt: string): Promise<string | null> => {
    if (!API_KEY) return null;
    
    try {
        // Using Gemini's image generation capability
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${API_KEY}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `Generate a realistic, appetizing photo of: ${imagePrompt}. Professional food photography style, natural lighting, white plate, garnished beautifully.`
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.9,
                    }
                }),
            }
        );

        const data = await response.json();
        
        // Extract base64 image if available
        const imagePart = data.candidates?.[0]?.content?.parts?.find(
            (part: any) => part.inlineData?.mimeType?.startsWith('image/')
        );
        
        if (imagePart?.inlineData?.data) {
            return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
        }
        
        return null;
    } catch (error) {
        console.error("Error generating recipe image:", error);
        return null;
    }
};
