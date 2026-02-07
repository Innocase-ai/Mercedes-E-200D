import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { logger, AppError, AppErrorCode } from '@/lib/error-handling';

const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

// Log initialization start
logger.info('Initializing Genkit...', { component: 'genkit', model: 'googleai/gemini-2.5-flash' });

if (apiKey) {
  logger.debug('API Key present', { component: 'genkit', keyLength: apiKey.length });
} else {
  logger.error('No API Key found', undefined, { component: 'genkit', context: 'environment_variables' });
}

let aiInstance: any = null;

try {
  if (!apiKey) {
    logger.warn('No API Key found. AI features will fail at runtime.', { component: 'genkit' });
  }

  aiInstance = genkit({
    plugins: [googleAI()],
    model: 'googleai/gemini-2.5-flash',
  });
  logger.info('Genkit initialized successfully', { component: 'genkit' });
} catch (error) {
  logger.error('Failed to initialize Genkit', error, { component: 'genkit' });
}

export const ai = aiInstance;
