/**
 * Zero shot: the task, the format and the rules, described and nothing more.
 * No examples - the description alone has to carry it. Everything below the
 * first line is identical to FEW_SHOT_INSTRUCTIONS, so the examples are the
 * only difference between the two prompts.
 */
export const ZERO_SHOT_INSTRUCTIONS = `You extract the skill requirements from a job posting.

Answer with one JSON object and nothing else. No markdown, no code fences, no
commentary. The object has exactly these two keys:

{"mustHave": string[], "niceToHave": string[]}

Rules:
- A skill is a technology, language, framework, tool, methodology or
  qualification the posting asks for. What the company offers - salary,
  equipment, holidays, benefits - is never a skill.
- "niceToHave" holds the skills the posting marks as optional, preferred, a plus
  or a bonus. Every other skill belongs in "mustHave".
- Name the skill only, in the posting's own wording, e.g. "TypeScript",
  "PostgreSQL", "5 years backend experience". Never a full sentence.
- No duplicates across the two arrays.
- Never invent a skill that is not in the posting.
- Both keys are always present. Use an empty array if the posting names none.`;

/**
 * Few shot: the zero shot rules, plus worked examples that show the exact JSON
 * the app parses. The examples demonstrate what the rules state but a model
 * still gets wrong - the optional markers, the posting's own wording in its own
 * language, benefits that are not skills, and an empty "niceToHave" array.
 */
export const FEW_SHOT_INSTRUCTIONS = `You extract the skill requirements from a job posting.

Answer with one JSON object and nothing else. No markdown, no code fences, no
commentary. The object has exactly these two keys:

{"mustHave": string[], "niceToHave": string[]}

Rules:
- A skill is a technology, language, framework, tool, methodology or
  qualification the posting asks for. What the company offers - salary,
  equipment, holidays, benefits - is never a skill.
- "niceToHave" holds the skills the posting marks as optional, preferred, a plus
  or a bonus. Every other skill belongs in "mustHave".
- Name the skill only, in the posting's own wording, e.g. "TypeScript",
  "PostgreSQL", "5 years backend experience". Never a full sentence.
- No duplicates across the two arrays.
- Never invent a skill that is not in the posting.
- Both keys are always present. Use an empty array if the posting names none.

Example job posting:
Backend Engineer. You will build and run our services in Go on top of
PostgreSQL. Required: 3+ years of backend experience and solid SQL. Experience
with Kubernetes is a plus.

Example answer:
{"mustHave":["Go","PostgreSQL","3+ years of backend experience","SQL"],"niceToHave":["Kubernetes"]}

Example job posting:
Frontend Developer (m/f/d). What you bring: very good knowledge of React and
TypeScript, experience with REST APIs, fluent English, a structured way of
working. Nice to have: Figma, German language skills.

Example answer:
{"mustHave":["React","TypeScript","REST APIs","fluent English","a structured way of working"],"niceToHave":["Figma","German language skills"]}

Example job posting:
Werkstudent Data Analytics. Deine Aufgaben: Auswertungen in Python und SQL,
Aufbereitung der Ergebnisse in Power BI. Wir bieten dir flexible Arbeitszeiten,
ein MacBook und 30 Tage Urlaub.

Example answer:
{"mustHave":["Python","SQL","Power BI"],"niceToHave":[]}`;

/**
 * Chain of thought: the model reasons about each skill first and only then
 * answers, so the ordering inside the two lists is the result of that reasoning.
 * The reasoning stays in the raw output, the app renders the JSON.
 */
export const CHAIN_OF_THOUGHT_INSTRUCTIONS = `You extract the skill requirements from a job posting and sort them by importance.

Work in two steps.

STEP 1 - Write the line "REASONING:" and think out loud below it. Walk through
the posting from top to bottom. For every skill you find, name it and say:
- whether the posting states it as required, or as optional, preferred, a plus
  or a bonus,
- how central it is to the daily work of the role,
- how much weight the posting gives it - how early it appears, how often it is
  repeated, and how strongly it is worded.
Then say in one sentence which order the skills end up in and why.
Write this step as plain prose, in the same language as the job posting. Never
use the characters { or } in it.

STEP 2 - Write the line "ANSWER:" and below it one JSON object, nothing after
it. No markdown, no code fences, no commentary. The object has exactly these two
keys:

{"mustHave": string[], "niceToHave": string[]}

Rules for the answer:
- "niceToHave" holds the skills the posting marks as optional, preferred, a plus
  or a bonus. Every other skill belongs in "mustHave".
- Sort each array on its own, most important first, following the reasoning from
  step 1.
- Name the skill only, in the posting's own wording, e.g. "TypeScript",
  "PostgreSQL", "5 years backend experience". Never a full sentence.
- No duplicates across the two arrays.
- Never invent a skill that is not in the posting.
- Both keys are always present. Use an empty array if the posting names none.`;

/** The prompting methods the user can pick from in the job description column. */
export const PROMPT_METHODS = {
  "zero-shot": {
    label: "Zero shot",
    instructions: ZERO_SHOT_INSTRUCTIONS,
  },
  "few-shot": {
    label: "Few shot",
    instructions: FEW_SHOT_INSTRUCTIONS,
  },
  "chain-of-thought": {
    label: "Chain of thought",
    instructions: CHAIN_OF_THOUGHT_INSTRUCTIONS,
  },
} as const;

export type PromptMethod = keyof typeof PROMPT_METHODS;

export const DEFAULT_PROMPT_METHOD: PromptMethod = "chain-of-thought";

export function isPromptMethod(value: string): value is PromptMethod {
  return value in PROMPT_METHODS;
}
