"use server";

import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";

import { FEW_SHOT_INSTRUCTIONS, ZERO_SHOT_INSTRUCTIONS } from "@/lib/prompts";

const MODEL = "openai/gpt-5-mini";

export type Skills = {
  mustHave: string[];
  niceToHave: string[];
};

export type AnalyseState = {
  raw: string | null;
  skills: Skills | null;
  error: string | null;
};

function toSkillList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

/** The model is told to answer with bare JSON, but may still wrap it in prose. */
function parseSkills(raw: string): Skills | null {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");

  if (start === -1 || end <= start) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(raw.slice(start, end + 1));

    if (typeof parsed !== "object" || parsed === null) {
      return null;
    }

    const { mustHave, niceToHave } = parsed as Record<string, unknown>;

    return {
      mustHave: toSkillList(mustHave),
      niceToHave: toSkillList(niceToHave),
    };
  } catch {
    return null;
  }
}

export async function analyseJobDescription(
  _previousState: AnalyseState,
  formData: FormData,
): Promise<AnalyseState> {
  const jobText = String(formData.get("jobDescription") ?? "").trim();

  if (!jobText) {
    return { raw: null, skills: null, error: "Paste a job description first." };
  }

  const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
  });

  try {
    const { text } = await generateText({
      model: openrouter(MODEL),
      instructions: FEW_SHOT_INSTRUCTIONS, // Exchange for other prompt in prompts.ts
      prompt: jobText,
    });

    const skills = parseSkills(text);

    return { raw: text, skills, error: null };
  } catch (error) {
    console.error("analyseJobDescription failed", error);
    return {
      raw: null,
      skills: null,
      error: "Could not analyse the job description.",
    };
  }
}
