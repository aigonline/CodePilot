
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

    // Destructure both stream and response from ai.generateStream
    const {stream: genkitStream, response: genkitResponsePromise} = ai.generateStream({
      prompt: rawCodeStreamingPrompt,
      input: genkitInput,
      config: {
        // Adjust safety settings if needed for code generation
        // safetySettings: [
        //   { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        // ],
      }
    });

    const readableWebStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of genkitStream) {
            if (chunk.text) {
              controller.enqueue(encoder.encode(chunk.text));
            }
          }
          // Await the Genkit response promise after the stream is consumed
          // This ensures any errors from the overall Genkit operation are caught.
          await genkitResponsePromise;
          controller.close(); // Close the stream successfully
        } catch (err) {
          console.error('Error during Genkit stream processing or finalization:', err);
          // Propagate the error to the stream consumer (client)
          controller.error(err);
        }
      },
    });

    return new Response(readableWebStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
      },
    });

  } catch (error: any) { // Catches errors from request.json() or initial ai.generateStream setup
    console.error('Error in generate-code-stream handler (pre-stream setup):', error);
    return NextResponse.json({error: error.message || 'Failed to initiate code stream.'}, {status: 500});
  }
}
