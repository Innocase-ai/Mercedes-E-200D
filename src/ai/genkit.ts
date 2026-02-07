import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
console.log('[GENKIT DEBUG] Initializing Genkit...');
console.log('[GENKIT DEBUG] Environment Model:', 'googleai/gemini-2.5-flash');
console.log('[GENKIT DEBUG] API Key present?', !!apiKey);
if (apiKey) console.log('[GENKIT DEBUG] API Key length:', apiKey.length);
if (!apiKey) console.error('[GENKIT FATAL] No API Key found in environment variables (GOOGLE_GENAI_API_KEY, GOOGLE_API_KEY, GEMINI_API_KEY).');

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-flash',
});
