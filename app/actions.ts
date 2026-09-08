"use server";

import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";

import {
  DEFAULT_PROMPT_METHOD,
  isPromptMethod,
  PROMPT_METHODS,
  QUESTIONS_INSTRUCTIONS,
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
function parseJsonObject(raw: string): Record<string, unknown> | null {
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

    return parsed as Record<string, unknown>;
  }

  return null;
}

function parseSkills(raw: string): Skills | null {
  const parsed = parseJsonObject(raw);

  if (!parsed) {
    return null;
  }

  return {
    mustHave: toSkillList(parsed.mustHave),
    niceToHave: toSkillList(parsed.niceToHave),
  };
}

export async function analyseJobDescription(
  _previousState: AnalyseState,
  formData: FormData,
): Promise<AnalyseState> {
  const jobText = String(formData.get("jobDescription") ?? "").trim();
  const method = String(formData.get("promptMethod") ?? "");

  if (!jobText) {
    return { raw: null, skills: null, error: "Paste a job description first." };
  }

  const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
  });

  try {
    const { text } = await generateText({
      model: openrouter(MODEL),
      instructions:
        PROMPT_METHODS[isPromptMethod(method) ? method : DEFAULT_PROMPT_METHOD]
          .instructions,
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

export type Question = {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export type QuestionsState = {
  raw: string | null;
  questions: Question[] | null;
  error: string | null;
};

function toQuestion(value: unknown): Question | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const { question, options, correctIndex, explanation } = value as Record<
    string,
    unknown
  >;

  if (typeof question !== "string" || typeof explanation !== "string") {
    return null;
  }

  if (
    !Array.isArray(options) ||
    !options.every((option) => typeof option === "string")
  ) {
    return null;
  }

  /** A question whose correct option is not in the list can not be answered. */
  if (
    typeof correctIndex !== "number" ||
    correctIndex < 0 ||
    correctIndex >= options.length
  ) {
    return null;
  }

  return { question, options, correctIndex, explanation };
}

function parseQuestions(raw: string): Question[] | null {
  const parsed = parseJsonObject(raw);

  if (!parsed || !Array.isArray(parsed.questions)) {
    return null;
  }

  const questions = parsed.questions
    .map(toQuestion)
    .filter((question): question is Question => question !== null);

  return questions.length > 0 ? questions : null;
}

export async function generateQuestions(
  _previousState: QuestionsState,
  formData: FormData,
): Promise<QuestionsState> {
  const skill = String(formData.get("skill") ?? "").trim();
  const level = String(formData.get("level") ?? "").trim();

  if (!skill || !level) {
    return {
      raw: null,
      questions: null,
      error: "Pick a skill and an experience level first.",
    };
  }

  const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
  });

  try {
    const { text } = await generateText({
      model: openrouter(MODEL),
      instructions: QUESTIONS_INSTRUCTIONS,
      prompt: `Skill: ${skill}\nExperience level: ${level}`,
    });

    return { raw: text, questions: parseQuestions(text), error: null };
  } catch (error) {
    console.error("generateQuestions failed", error);
    return {
      raw: null,
      questions: null,
      error: "Could not generate the questions.",
    };
  }
}
