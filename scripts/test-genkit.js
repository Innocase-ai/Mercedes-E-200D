const { genkit } = require('genkit');
const { googleAI } = require('@genkit-ai/google-genai');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

async function testGenkit() {
    console.log("Testing Genkit initialization...");
    console.log("Model: googleai/gemini-2.5-flash");
    console.log("API Key present:", !!process.env.GOOGLE_GENAI_API_KEY);

    try {
        const ai = genkit({
            plugins: [googleAI()],
            model: 'googleai/gemini-2.5-flash',
        });

        console.log("Generating text...");
        const { text } = await ai.generate({
            prompt: 'Say hello',
        });
        console.log("Success:", text);
    } catch (error) {
        console.error("Genkit Error:", error);
    }
}

testGenkit();
