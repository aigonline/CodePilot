
'use server';
/**
 * @fileOverview Generates code snippets based on user prompts in a specified language.
 * Includes both non-streaming and streaming capabilities.
 *
 * - generateCode - A function that takes a prompt and language and returns generated code (non-streaming).
 * - GenerateCodeInput - The input type for the generateCode function.
 * - GenerateCodeOutput - The return type for the generateCode function.
 * - rawCodeStreamingPrompt - A Genkit prompt optimized for streaming raw code.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCodeInputSchema = z.object({
  prompt: z.string().describe('The prompt to generate code from.'),
  language: z.string().describe('The programming language for the generated code.'),
});
export type GenerateCodeInput = z.infer<typeof GenerateCodeInputSchema>;

const GenerateCodeOutputSchema = z.object({
  code: z.string().describe('The generated code snippet.'),
});
export type GenerateCodeOutput = z.infer<typeof GenerateCodeOutputSchema>;

// Non-streaming prompt
const generateCodePrompt = ai.definePrompt({
  name: 'generateCodePrompt',
  input: {schema: GenerateCodeInputSchema},
  output: {schema: GenerateCodeOutputSchema},
  prompt: `You are an expert software developer who specializes in generating code snippets from user prompts.

  Generate code based on the following prompt in the specified language.  Return only the code and nothing else.

  Language: {{{language}}}
  Prompt: {{{prompt}}}`,
});

// Non-streaming flow
const generateCodeFlow = ai.defineFlow(
  {
    name: 'generateCodeFlow',
    inputSchema: GenerateCodeInputSchema,
    outputSchema: GenerateCodeOutputSchema,
  },
  async input => {
    const {output} = await generateCodePrompt(input);
    return output!;
  }
);

// Exported non-streaming function (can be used by server actions if needed)
export async function generateCode(input: GenerateCodeInput): Promise<GenerateCodeOutput> {
  return generateCodeFlow(input);
}

// Streaming-optimized prompt
export const rawCodeStreamingPrompt = ai.definePrompt({
  name: 'rawCodeStreamingPrompt',
  input: {schema: GenerateCodeInputSchema},
  // No output schema here as we stream raw text from the model for code
  prompt: `You are an expert software developer who specializes in generating code snippets from user prompts.

  Generate code based on the following prompt in the specified language.
  Return ONLY the raw code. Do not include any markdown formatting like \`\`\`language ... \`\`\` or explanations.
  Just the code itself.

  Language: {{{language}}}
  Prompt: {{{prompt}}}`,
});
