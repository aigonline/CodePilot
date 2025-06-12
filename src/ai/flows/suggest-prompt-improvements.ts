// This file is machine-generated - edit at your own risk!

'use server';

/**
 * @fileOverview This file defines a Genkit flow that suggests improvements to a user's prompt
 * based on the generated code and the user's feedback.
 *
 * - suggestPromptImprovements - A function that takes the original prompt, generated code, and user feedback,
 *   and returns suggestions for improving the prompt.
 * - SuggestPromptImprovementsInput - The input type for the suggestPromptImprovements function.
 * - SuggestPromptImprovementsOutput - The return type for the suggestPromptImprovements function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestPromptImprovementsInputSchema = z.object({
  originalPrompt: z.string().describe('The original prompt provided by the user.'),
  generatedCode: z.string().describe('The code generated based on the original prompt.'),
  userFeedback: z.string().describe('The user feedback on the generated code.'),
});
export type SuggestPromptImprovementsInput = z.infer<typeof SuggestPromptImprovementsInputSchema>;

const SuggestPromptImprovementsOutputSchema = z.object({
  suggestedImprovements: z
    .array(z.string())
    .describe('An array of suggested improvements to the original prompt.'),
});
export type SuggestPromptImprovementsOutput = z.infer<typeof SuggestPromptImprovementsOutputSchema>;

export async function suggestPromptImprovements(
  input: SuggestPromptImprovementsInput
): Promise<SuggestPromptImprovementsOutput> {
  return suggestPromptImprovementsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestPromptImprovementsPrompt',
  input: {schema: SuggestPromptImprovementsInputSchema},
  output: {schema: SuggestPromptImprovementsOutputSchema},
  prompt: `You are an AI assistant designed to help users improve their code generation prompts.

  Based on the original prompt, the generated code, and the user's feedback, suggest specific improvements to the prompt.
  Provide the suggestions as a numbered list, focusing on how to make the prompt clearer, more specific, or more effective in generating the desired code.

  Original Prompt: {{{originalPrompt}}}
  Generated Code: {{{generatedCode}}}
  User Feedback: {{{userFeedback}}}

  Suggested Improvements:
  `,
});

const suggestPromptImprovementsFlow = ai.defineFlow(
  {
    name: 'suggestPromptImprovementsFlow',
    inputSchema: SuggestPromptImprovementsInputSchema,
    outputSchema: SuggestPromptImprovementsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
