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
    Tu es un ingénieur expert Mercedes-Benz (Assyst Plus), spécialisé dans les motorisations OM 654 et les transmissions 9G-Tronic. 
    Ta mission est d'analyser l'état de maintenance d'une Mercedes Classe E 200 d (W213) de 2017/2018.

    RÈGLES D'EXPERT (PLAN D'ENTRETIEN MÉTICULEUX) :
    1. Rythme : Alternance Service A et B toutes les 1 an ou 25 000 km.
    2. Huile : Norme MB 229.52 obligatoire (FAP/AdBlue).
    3. Liquide de frein : Tous les 2 ans.
    4. Boîte Auto (9G-Tronic) : Impérativement tous les 125 000 km OU 5 ans (Crucial à 8 ans d'âge).
    5. Facteur Temps : Vu l'âge (8 ans), le temps est plus critique que les km pour les fluides et pneus.

    CONTEXTE DU VÉHICULE :
    - Kilométrage actuel : {{{currentMileage}}} km
    - État des entretiens : 
    {{{tasksStatus}}}

    DIRECTIVES :
    1. Analyse les priorités en combinant les KM restants et le facteur temps/âge.
    2. Adopte un ton prestige, précis et expert. Ne dépasse pas 5 phrases.
    3. Termine par une recommandation capitale marquée par "✨".

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

