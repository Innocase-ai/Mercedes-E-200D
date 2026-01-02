// src/ai/flows/invoice-analysis.ts
'use server';
/**
 * @fileOverview Invoice analysis AI agent.
 *
 * - analyzeInvoice - A function that handles the invoice analysis process.
 * - AnalyzeInvoiceInput - The input type for the analyzeInvoice function.
 * - AnalyzeInvoiceOutput - The return type for the analyzeInvoice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeInvoiceInputSchema = z.object({
  invoiceDataUri: z
    .string()
    .describe(
      "A photo of a invoice, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeInvoiceInput = z.infer<typeof AnalyzeInvoiceInputSchema>;

const AnalyzeInvoiceOutputSchema = z.object({
  analysis: z.string().describe('The analysis of the invoice.'),
});
export type AnalyzeInvoiceOutput = z.infer<typeof AnalyzeInvoiceOutputSchema>;

export async function analyzeInvoice(input: AnalyzeInvoiceInput): Promise<AnalyzeInvoiceOutput> {
  return analyzeInvoiceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeInvoicePrompt',
  input: {schema: AnalyzeInvoiceInputSchema},
  output: {schema: AnalyzeInvoiceOutputSchema},
  prompt: `Analyse cette facture d'entretien pour une Mercedes E 200 d (Moteur OM 654). 
En tant qu'expert Mercedes et gestionnaire de production rigoureux, identifie :
1. Les travaux effectués et les pièces remplacées.
2. Vérifie la conformité de l'huile moteur (doit être norme MB 229.51 ou 229.52).
3. Compare les tarifs (pièces et main-d'œuvre) avec le marché belge (Soignies/Hainaut).
4. Donne un avis constructif : la facture est-elle honnête ? Quelque chose a-t-il été oublié ?
Réponds en français, avec un ton pro et honnête.

Facture: {{media url=invoiceDataUri}}`,
});

const analyzeInvoiceFlow = ai.defineFlow(
  {
    name: 'analyzeInvoiceFlow',
    inputSchema: AnalyzeInvoiceInputSchema,
    outputSchema: AnalyzeInvoiceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
