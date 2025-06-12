
// src/app/api/generate-code-stream/route.ts
import {ai} from '@/ai/genkit';
import {rawCodeStreamingPrompt, type GenerateCodeInput} from '@/ai/flows/generate-code-from-prompt';
import {NextResponse} from 'next/server';

export const runtime = 'edge'; // Prefer edge runtime for streaming

export async function POST(request: Request) {
  try {
    const {prompt, language} = (await request.json()) as GenerateCodeInput;

    if (!prompt || !language) {
      return NextResponse.json({error: 'Prompt and language are required.'}, {status: 400});
    }

    const genkitInput: GenerateCodeInput = {prompt, language};

    const {stream} = ai.generateStream({
      prompt: rawCodeStreamingPrompt,
      input: genkitInput,
      config: {
        // Adjust safety settings if needed for code generation
        // safetySettings: [
        //   { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        // ],
      }
    });

    const readableStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of stream) {
            if (chunk.text) {
              controller.enqueue(encoder.encode(chunk.text));
            }
          }
        } catch (error) {
          console.error('Error during stream processing:', error);
          controller.error(error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error: any) {
    console.error('Error in generate-code-stream handler:', error);
    return NextResponse.json({error: error.message || 'Failed to generate code stream.'}, {status: 500});
  }
}
