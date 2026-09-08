/**
 * Zero shot: no examples, the rules alone have to carry the format.
 * Kept as the demo of the first attempt - the app uses FEW_SHOT_INSTRUCTIONS.
 */
export const ZERO_SHOT_INSTRUCTIONS = `You extract the skill requirements from a job posting.

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

/**
 * Few shot: the same rules, plus worked examples that show the exact JSON the
 * app parses.
 */
export const FEW_SHOT_INSTRUCTIONS = `You extract the skill requirements from a job posting.

Answer with one JSON object and nothing else. No markdown, no code fences, no
commentary. The object has exactly these two keys:

{"mustHave": string[], "niceToHave": string[]}

Rules:
- A skill is a technology, language, framework, tool, methodology or
  qualification the posting asks for.
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
{"mustHave":["React","TypeScript","REST APIs","fluent English","a structured way of working"],"niceToHave":["Figma","German language skills"]}`;
