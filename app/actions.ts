"use server";

import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";

const MODEL = "openai/gpt-5-mini";

const INSTRUCTIONS = `You extract the skill requirements from a job posting.

List every skill, technology, language, framework, tool, methodology or
qualification the posting asks for under two headings:

MUST HAVE
- the posting states it as required

NICE TO HAVE
- the posting states it as optional, preferred, a plus or a bonus

Rules:
- Name the skill only, in the posting's own wording, e.g. "TypeScript",
  "PostgreSQL", "Docker", "5 years backend experience". Never a full sentence.
- One skill per line, prefixed with "- ". No duplicates across both headings.
- Never invent a skill that is not in the posting.
- If the posting does not mark a skill as optional, it belongs under MUST HAVE.
- Answer with the two headings and their lines only. No other text.`;

export type AnalyseState = {
  text: string | null;
  error: string | null;
};

export async function analyseJobDescription(
  _previousState: AnalyseState,
  formData: FormData,
): Promise<AnalyseState> {
  const jobText = String(formData.get("jobDescription") ?? "").trim();

  if (!jobText) {
    return { text: null, error: "Paste a job description first." };
  }

  const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
  });

  try {
    const { text } = await generateText({
      model: openrouter(MODEL),
      instructions: INSTRUCTIONS,
      prompt: jobText,
    });

    return { text, error: null };
  } catch (error) {
    console.error("analyseJobDescription failed", error);
    return { text: null, error: "Could not analyse the job description." };
  }
}
