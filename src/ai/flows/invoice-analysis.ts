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
  prompt: `Analyse ce document lié à une Mercedes E 200 d (W213, Moteur OM 654). 
Le document peut être une facture d'entretien, une preuve d'assurance, une taxe de circulation ou une réparation.

En tant qu'expert Mercedes et gestionnaire financier rigoureux :
1. Extrais la date précise du document.
2. Extrais le montant total TTC.
3. Crée un libellé court et clair.
4. Identifie le type de dépense.
5. Si c'est un entretien : vérifie la conformité (Huile MB 229.51/52, filtres, etc.). Si c'est autre chose, vérifie si le document semble légitime pour ce véhicule.
6. Rédige une analyse qualitative courte expliquant les points clés.

Réponds en français.

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
