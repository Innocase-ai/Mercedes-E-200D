'use server';

/**
 * @fileOverview Text-to-speech flow for generating maintenance alerts.
 *
 * - speakMaintenanceAlerts - A function that generates and returns a WAV audio data URI of a spoken maintenance alert.
 * - SpeakMaintenanceAlertsInput - The input type for the speakMaintenanceAlerts function, a string.
 * - SpeakMaintenanceAlertsOutput - The return type for the speakMaintenanceAlerts function, an audio WAV data URI.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';

const SpeakMaintenanceAlertsInputSchema = z.string().describe('The text to be converted to speech.');
export type SpeakMaintenanceAlertsInput = z.infer<typeof SpeakMaintenanceAlertsInputSchema>;

const SpeakMaintenanceAlertsOutputSchema = z.object({
  media: z.string().describe('The audio WAV data URI.'),
});
export type SpeakMaintenanceAlertsOutput = z.infer<typeof SpeakMaintenanceAlertsOutputSchema>;

export async function speakMaintenanceAlerts(input: SpeakMaintenanceAlertsInput): Promise<SpeakMaintenanceAlertsOutput> {
  return speakMaintenanceAlertsFlow(input);
}

const speakMaintenanceAlertsFlow = ai.defineFlow(
  {
    name: 'speakMaintenanceAlertsFlow',
    inputSchema: SpeakMaintenanceAlertsInputSchema,
    outputSchema: SpeakMaintenanceAlertsOutputSchema,
  },
  async (query) => {
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
      prompt: `Say warmly in French: ${query}`,
    });
    if (!media) {
      throw new Error('no media returned');
    }
    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );
    return {
      media: 'data:audio/wav;base64,' + (await toWav(audioBuffer)),
    };
  }
);

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs = [] as any[];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}
