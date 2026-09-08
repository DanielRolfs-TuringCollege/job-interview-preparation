"use server";

import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";

import {
  CHAIN_OF_THOUGHT_INSTRUCTIONS,
  FEW_SHOT_INSTRUCTIONS,
  ZERO_SHOT_INSTRUCTIONS,
} from "@/lib/prompts";

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

/**
 * The model is told to answer with bare JSON, but may wrap it in prose - the
 * chain of thought prompt puts a whole reasoning block in front of it. Walk the
 * "{" from right to left until one of them parses against the last "}".
 */
function parseSkills(raw: string): Skills | null {
  const end = raw.lastIndexOf("}");

  for (let start = end - 1; start >= 0; start--) {
    if (raw[start] !== "{") {
      continue;
    }

    let parsed: unknown;

    try {
      parsed = JSON.parse(raw.slice(start, end + 1));
    } catch {
      continue;
    }

    if (typeof parsed !== "object" || parsed === null) {
      return null;
    }

    const { mustHave, niceToHave } = parsed as Record<string, unknown>;

    return {
      mustHave: toSkillList(mustHave),
      niceToHave: toSkillList(niceToHave),
    };
  }

  return null;
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
      instructions: CHAIN_OF_THOUGHT_INSTRUCTIONS, // Exchange for other prompt in prompts.ts
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
