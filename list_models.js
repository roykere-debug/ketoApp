require('dotenv').config();

const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

if (!API_KEY) {
    console.error("No API Key found in .env");
    process.exit(1);
}

async function listModels() {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
        const data = await response.json();

        if (data.error) {
            console.error("Error listing models:", data.error.message);
        } else {
            console.log("Available Models:");
            const generateModels = data.models.filter(m => m.supportedGenerationMethods.includes("generateContent"));
            generateModels.forEach(m => console.log(`- ${m.name}`));
        }
    } catch (error) {
        console.error("Request failed:", error);
    }
}

listModels();
