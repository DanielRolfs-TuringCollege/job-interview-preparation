"use server";

import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";
import * as z from "zod";

import {
  DEFAULT_PROMPT_METHOD,
  GUARD_INSTRUCTIONS,
  isPromptMethod,
  JUDGE_INSTRUCTIONS,
  PROMPT_METHODS,
  QUESTIONS_INSTRUCTIONS,
} from "@/lib/prompts";

const MODEL = "openai/gpt-5-mini";

/**
 * How many skills a posting names is up to the posting, so neither list has a
 * length to check and both may be empty. What can be checked is that the two
 * lists stay apart: a skill in both would render as two tabs under the same
 * name, which the middle column can not tell apart.
 */
const SkillsSchema = z
  .object({
    mustHave: z.array(z.string().min(1)),
    niceToHave: z.array(z.string().min(1)),
  })
  .refine(
    (skills) =>
      new Set([...skills.mustHave, ...skills.niceToHave]).size ===
      skills.mustHave.length + skills.niceToHave.length,
    { error: "a skill appears in both groups" },
  );

export type Skills = z.infer<typeof SkillsSchema>;

export type AnalyseState = {
  raw: string | null;
  skills: Skills | null;
  error: string | null;
};

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

/**
 * A list that came back part broken is no basis for the questions, so the
 * answer is dropped as a whole and the raw output is left to look at.
 */
function parseSkills(raw: string): Skills | null {
  const parsed = SkillsSchema.safeParse(parseJsonObject(raw));

  return parsed.success ? parsed.data : null;
}

/**
 * The guard verdict. Only an explicit accept passes, so a judge that answers
 * with something the app cannot read refuses the text as well.
 */
function parseVerdict(raw: string): { accept: boolean; reason: string } {
  const parsed = parseJsonObject(raw);
  const accept = parsed?.accept === true;
  const reason = typeof parsed?.reason === "string" ? parsed.reason : "";

  return {
    accept,
    reason: accept
      ? ""
      : reason || "Nice try. Please insert a real job description instead.",
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
    /** The judge runs first - nothing is extracted from a text it refuses. */
    const { text: verdictText } = await generateText({
      model: openrouter(MODEL),
      instructions: GUARD_INSTRUCTIONS,
      prompt: jobText,
    });

    const verdict = parseVerdict(verdictText);

    if (!verdict.accept) {
      return { raw: null, skills: null, error: verdict.reason };
    }

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

/** The counts the questions prompt promises, and the quiz is built around. */
const QUESTION_COUNT = 3;
const OPTION_COUNT = 3;

/**
 * The counts are the part no type can state - "string[]" cannot say "three of
 * them" - so they are checked here instead. A whole "correctIndex" inside the
 * option count is what makes the question answerable: a fraction matches no
 * rendered option and would mark every answer wrong.
 */
const QuestionSchema = z.object({
  question: z.string().min(1),
  options: z.array(z.string().min(1)).length(OPTION_COUNT),
  correctIndex: z.int().min(0).max(OPTION_COUNT - 1),
  explanation: z.string().min(1),
});

const QuestionsSchema = z.object({
  questions: z.array(QuestionSchema).length(QUESTION_COUNT),
});

export type Question = z.infer<typeof QuestionSchema>;

export type QuestionsState = {
  raw: string | null;
  questions: Question[] | null;
  error: string | null;
};

/** A set that is short of a question, or carries a broken one, is dropped. */
function parseQuestions(raw: string): Question[] | null {
  const parsed = QuestionsSchema.safeParse(parseJsonObject(raw));

  return parsed.success ? parsed.data.questions : null;
}

export async function generateQuestions(
  _previousState: QuestionsState,
  formData: FormData,
): Promise<QuestionsState> {
  const jobText = String(formData.get("jobDescription") ?? "").trim();
  const skill = String(formData.get("skill") ?? "").trim();
  const level = String(formData.get("level") ?? "").trim();

  if (!skill || !level) {
    return {
      raw: null,
      questions: null,
      error: "Pick a skill and an experience level first.",
    };
  }

  /** Without the posting the questions are about the skill in the abstract. */
  if (!jobText) {
    return {
      raw: null,
      questions: null,
      error: "The job description is empty - paste it again.",
    };
  }

  const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
  });

  try {
    const { text } = await generateText({
      model: openrouter(MODEL),
      instructions: QUESTIONS_INSTRUCTIONS,
      prompt: `Job posting:\n${jobText}\n\nSkill: ${skill}\nExperience level: ${level}`,
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

/** The judge names the ability behind every question, so the reason is never empty. */
const VerdictSchema = z.object({
  relevant: z.boolean(),
  reason: z.string().min(1),
});

export type Verdict = z.infer<typeof VerdictSchema>;

export type JudgeState = {
  raw: string | null;
  verdicts: Verdict[] | null;
  error: string | null;
};

/**
 * The verdicts carry no index - they are matched to the questions by their
 * position, so a list that does not line up is dropped as a whole.
 */
function parseVerdicts(raw: string, count: number): Verdict[] | null {
  const parsed = z
    .object({ verdicts: z.array(VerdictSchema).length(count) })
    .safeParse(parseJsonObject(raw));

  return parsed.success ? parsed.data.verdicts : null;
}

/** The questions as the judge reads them, with the correct option marked. */
function formatQuestions(questions: Question[]): string {
  return questions
    .map((question, index) => {
      const options = question.options
        .map(
          (option, optionIndex) =>
            `  - ${option}${optionIndex === question.correctIndex ? " (marked correct)" : ""}`,
        )
        .join("\n");

      return `Question ${index + 1}: ${question.question}\n${options}`;
    })
    .join("\n\n");
}

export async function judgeQuestions(
  _previousState: JudgeState,
  formData: FormData,
): Promise<JudgeState> {
  const jobText = String(formData.get("jobDescription") ?? "").trim();
  const skill = String(formData.get("skill") ?? "").trim();
  const level = String(formData.get("level") ?? "").trim();
  const questions = parseQuestions(String(formData.get("questions") ?? ""));

  if (!jobText || !skill || !questions) {
    return {
      raw: null,
      verdicts: null,
      error: "Nothing to judge yet.",
    };
  }

  const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
  });

  try {
    const { text } = await generateText({
      model: openrouter(MODEL),
      instructions: JUDGE_INSTRUCTIONS,
      prompt: `Job posting:\n${jobText}\n\nSkill: ${skill}\nExperience level: ${level}\n\n${formatQuestions(questions)}`,
    });

    return {
      raw: text,
      verdicts: parseVerdicts(text, questions.length),
      error: null,
    };
  } catch (error) {
    console.error("judgeQuestions failed", error);
    return {
      raw: null,
      verdicts: null,
      error: "Could not judge the questions.",
    };
  }
}
