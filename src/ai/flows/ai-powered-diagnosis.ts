'use server';

/**
 * @fileOverview An AI-powered diagnosis flow for Mercedes-Benz vehicles, providing predictive maintenance insights.
 *
 * - getAiDiagnosis - A function that handles the AI-powered diagnosis process.
 * - AiDiagnosisInput - The input type for the getAiDiagnosis function.
 * - AiDiagnosisOutput - The return type for the getAiDiagnosis function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AiDiagnosisInputSchema = z.object({
  currentMileage: z.number().describe('The current mileage of the vehicle.'),
  tasksStatus: z.string().describe('The status of the maintenance tasks.'),
});
export type AiDiagnosisInput = z.infer<typeof AiDiagnosisInputSchema>;

const AiDiagnosisOutputSchema = z.object({
  diagnosis: z.string().describe('The AI-powered diagnosis of the vehicle.'),
});
export type AiDiagnosisOutput = z.infer<typeof AiDiagnosisOutputSchema>;

export async function getAiDiagnosis(input: AiDiagnosisInput): Promise<AiDiagnosisOutput> {
  return aiDiagnosisFlow(input);
}

const aiDiagnosisPrompt = ai.definePrompt({
  name: 'aiDiagnosisPrompt',
  input: { schema: AiDiagnosisInputSchema },
  output: { schema: AiDiagnosisOutputSchema },
  prompt: `
    Tu es un ingénieur expert Mercedes-Benz, spécialisé dans les motorisations OM 654 et les transmissions 9G-Tronic. 
    Ta mission est d'analyser l'état de maintenance d'une Mercedes Classe E (W213) de 2018.

    CONTEKTE DU VÉHICULE :
    - Kilométrage actuel : {{{currentMileage}}} km
    - État des entretiens : 
    {{{tasksStatus}}}

    DIRECTIVES :
    1. Analyse les risques spécifiques liés au moteur OM 654 (sensibilité des injecteurs, AdBlue) et à la boîte 9G-Tronic (importance de la vidange à 60k km).
    2. Adopte un ton très haut de gamme, professionnel et rassurant, mais direct sur les alertes de sécurité.
    3. Garde le diagnostic court (maximum 4 phrases).
    4. Termine par un conseil d'expert actionnable marqué par "✨".

    RÉPONSE EN FRANÇAIS :
  `,
});

const aiDiagnosisFlow = ai.defineFlow(
  {
    name: 'aiDiagnosisFlow',
    inputSchema: AiDiagnosisInputSchema,
    outputSchema: AiDiagnosisOutputSchema,
  },
  async input => {
    try {
      const { output } = await aiDiagnosisPrompt(input);
      if (!output) throw new Error("No output from diagnosis prompt");
      return output;
    } catch (error) {
      console.error("aiDiagnosisFlow Error:", error);
      return {
        diagnosis: "L'assistant expert a rencontré une difficulté technique. Veuillez vérifier vos données manuellement.",
      };
    }
  }
);

