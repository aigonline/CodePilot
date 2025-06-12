// @/app/actions.ts
"use server";

import { generateCode, type GenerateCodeInput } from "@/ai/flows/generate-code-from-prompt";
import { z } from "zod";

const GenerateCodeActionInputSchema = z.object({
  prompt: z.string().min(1, "Prompt cannot be empty."),
  language: z.string().min(1, "Language must be selected."),
});

export type GenerateCodeActionInput = z.infer<typeof GenerateCodeActionInputSchema>;

export interface GenerateCodeActionState {
  code?: string;
  error?: string;
  inputErrors?: Partial<Record<keyof GenerateCodeActionInput, string>>;
}

export async function generateCodeAction(
  prevState: GenerateCodeActionState | null,
  formData: FormData
): Promise<GenerateCodeActionState> {
  const prompt = formData.get("prompt") as string;
  const language = formData.get("language") as string;

  const validatedFields = GenerateCodeActionInputSchema.safeParse({
    prompt,
    language,
  });

  if (!validatedFields.success) {
    return {
      inputErrors: validatedFields.error.flatten().fieldErrors,
      error: "Invalid input.",
    };
  }

  try {
    const genkitInput: GenerateCodeInput = {
      prompt: validatedFields.data.prompt,
      language: validatedFields.data.language,
    };
    const result = await generateCode(genkitInput);
    if (result && result.code) {
      return { code: result.code };
    } else {
      return { error: "Failed to generate code. The AI returned an unexpected response." };
    }
  } catch (e: any) {
    console.error("Error generating code:", e);
    return { error: e.message || "An unexpected error occurred while generating code." };
  }
}
