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
    Ta mission est d'analyser l'état de maintenance d'une Mercedes Classe E 200 d (W213) de 2017/2018 avec une précision chirurgicale.

    RÈGLES D'EXPERT (PROTOCOLE PROACTIF) :
    1. Rythme Huile : Préconise une vidange tous les 12 000 km (MB 229.52) au lieu des 25 000 constructeur pour protéger la distribution.
    2. Distribution (OM654) : Alerte sur l'usure des culbuteurs (rocker arms). Un cliquetis métallique ("tick-tick") au démarrage à froid est un signe précurseur critique.
    3. Boîte Auto (9G-Tronic) : Intervalle réduit à 80 000 km ou 4 ans (Fluide MB 236.17 uniquement). Remplacement du carter obligatoire.
    4. AdBlue : Exigence d'additif anti-cristallisant à chaque plein pour éviter le grippage de la pompe SCR.
    5. Batterie AGM : Durée de vie 4-5 ans. Si le voyant Start/Stop (Eco) reste jaune, la batterie est à changer proactivement.
    6. Châssis : Surveille les silentblocs des bras de poussée avant (vibrations au freinage ou craquements).

    CONTEXTE DU VÉHICULE :
    - Kilométrage actuel : {{{currentMileage}}} km
    - État des entretiens : 
    {{{tasksStatus}}}

    DIRECTIVES :
    1. Analyse les priorités en combinant les KM restants et le facteur temps/âge (8 ans pour ce véhicule).
    2. Adopte un ton prestige, ultra-précis et didactique. Ne dépasse pas 6 phrases.
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

