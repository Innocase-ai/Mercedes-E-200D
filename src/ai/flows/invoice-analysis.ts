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

export async function analyzeInvoice(input: AnalyzeInvoiceInput): Promise<AnalyzeInvoiceOutput> {
  return analyzeInvoiceFlow(input);
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
   - Si c'est une vidange moteur : L'huile **DOIT** être à la norme **MB 229.52** (impératif pour OM 654).
   - Si c'est un entretien général : Vérifie si le liquide de frein (tous les 2 ans) ou la vidange de boîte 9G (tous les 5 ans) est mentionné si l'échéance temporelle semble proche (véhicule de 2017/2018).
5. Rédige une analyse qualitative courte (points positifs, oublis éventuels, conformité des pièces).

Réponds en français avec précision technique.

Document: {{media url=invoiceDataUri}}`,
});

const analyzeInvoiceFlow = ai.defineFlow(
  {
    name: 'analyzeInvoiceFlow',
    inputSchema: AnalyzeInvoiceInputSchema,
    outputSchema: AnalyzeInvoiceOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
