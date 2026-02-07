// src/ai/flows/invoice-analysis.ts
'use server';
/**
 * @fileOverview Invoice analysis AI agent.
 *
 * - analyzeInvoice - A function that handles the invoice analysis process.
 * - AnalyzeInvoiceInput - The input type for the analyzeInvoice function.
 * - AnalyzeInvoiceOutput - The return type for the analyzeInvoice function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnalyzeInvoiceInputSchema = z.object({
  invoiceDataUri: z
    .string()
    .describe(
      "A photo of a invoice, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeInvoiceInput = z.infer<typeof AnalyzeInvoiceInputSchema>;

const AnalyzeInvoiceOutputSchema = z.object({
  analysis: z.string().describe('Detailed qualitative analysis of the document.'),
  date: z.string().describe('Document date (YYYY-MM-DD).'),
  amount: z.number().describe('Total amount including VAT (numeric value only).'),
  label: z.string().describe('Clear Short name for the expense (e.g. "Assurance Q1 2024", "Entretien 60k").'),
  type: z.enum(['Entretien', 'Taxe', 'Assurance', 'Réparation', 'Autre']).describe('Category of the document.'),
  isConform: z.boolean().describe('For maintenance, if it matches Mercedes 200d requirements (oil norms, parts). Set true for taxes/insurance if they look valid.'),
});
export type AnalyzeInvoiceOutput = z.infer<typeof AnalyzeInvoiceOutputSchema>;

import { AppError, AppErrorCode, logger } from '@/lib/error-handling';

export async function analyzeInvoice(input: AnalyzeInvoiceInput): Promise<AnalyzeInvoiceOutput> {
  const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new AppError(
      AppErrorCode.CONFIG_MISSING,
      "Clé API Google manquante sur le serveur. Veuillez ajouter GOOGLE_GENAI_API_KEY.",
      500,
      { component: 'invoice-analysis' }
    );
  }

  if (!ai) {
    throw new AppError(
      AppErrorCode.INTERNAL_ERROR,
      "Le service AI n'a pas pu s'initialiser. Vérifiez les logs serveur.",
      500,
      { component: 'invoice-analysis' }
    );
  }

  try {
    logger.info('Starting invoice analysis', { component: 'invoice-analysis', inputLength: input.invoiceDataUri.length });
    const result = await analyzeInvoiceFlow(input);
    logger.info('Invoice analysis completed', { component: 'invoice-analysis' });
    return result;
  } catch (error: any) {
    logger.error('AI Analysis Error', error, { component: 'invoice-analysis' });

    // Convert generic Genkit errors to AppErrors if possible
    throw AppError.fromError(error, AppErrorCode.AI_SERVICE_UNAVAILABLE);
  }
}

const prompt = ai.definePrompt({
  name: 'analyzeInvoicePrompt',
  input: { schema: AnalyzeInvoiceInputSchema },
  output: { schema: AnalyzeInvoiceOutputSchema },
  prompt: `Analyse ce document lié à une Mercedes E 200 d (Moteur OM 654, Boîte 9G-Tronic). 
Le document peut être une facture d'entretien, une assurance, une taxe ou une réparation.

En tant qu'expert Mercedes (Assyst Plus) :
1. Extrais la date précise et le montant total TTC.
2. Crée un libellé court (ex: "Entretien Service B", "Assurance 2024").
3. Identifie le type parmi : Entretien, Taxe, Assurance, Réparation, Autre.
4. **Vérification de Conformité (CRITIQUE)** :
   - Vidange moteur : L'huile **DOIT** être à la norme **MB 229.52**. Si l'intervalle affiché dépasse 15 000 km, signale que c'est trop long pour l'OM654.
   - Boîte 9G-Tronic : Vérifie la norme d'huile **MB 236.17** (le carter doit aussi être listé comme pièce remplacée).
   - AdBlue : Vérifie si un additif anti-cristallisant a été facturé.
   - Distribution : Si une mention de "bruit haut moteur" ou de "culbuteurs" apparaît, l'alerte doit être maximale.
5. Rédige une analyse qualitative courte (points positifs, conformité technique Mercedes, oublis éventuels).

Réponds en français avec précision technique.

Document: {{media url=invoiceDataUri}}`,
});

const analyzeInvoiceFlow = ai.defineFlow(
  {
    name: 'analyzeInvoiceFlow',
    inputSchema: AnalyzeInvoiceInputSchema,
    outputSchema: AnalyzeInvoiceOutputSchema,
  },
  async (input: AnalyzeInvoiceInput) => {
    const { output } = await prompt(input);
    if (!output) throw new Error("No output from invoice analysis");
    return output;
  }
);
