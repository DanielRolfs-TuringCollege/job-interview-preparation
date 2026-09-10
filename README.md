# Interview Practice App

To demonstrate what I've learned in sprint one of the AI Engineering course I created this project.

## Info for the reviewer:

I chose the following optional tasks:

(medium) Implement at least two structured JSON output formats for the interview preparation:

- One of them extracting the skills ([app/actions.ts:24](app/actions.ts#L24))
- One extracting the questions ([app/actions.ts:169](app/actions.ts#L169))

(medium) Try to jailbreak (break into) your own application by trying to provide an invalid prompt, message, job file, etc. Provide the results of this experiment in an Excel sheet.

- My jailbreak attempts are listed in [JAILBREAKS.md](JAILBREAKS.md)
- The first two attempts were able to bypass my guard. The result was that cooking ingredients were listed as skills. As that's simple to imagine I did not provide an Excel sheet.
- I improved the guard so that none of these jailbreak prompts bypasses the guard anymore.

(medium) Add a separate text field or another field to include the job description (the position) you are applying for and getting interview preparation for that particular position (RAG).

- The first input field is used for direct context injection to prepare for an interview for this position, but no database is built for RAG usage. So this requirement is not fully met.

(medium) Add at least one security guard to your app to prevent misuse. Design for usability.

- The guard sits before the skill extraction: its prompt is in
  [lib/prompts.ts:341](lib/prompts.ts#L341) and it runs first in
  [app/actions.ts:118](app/actions.ts#L118)

(hard) Assess the performance of your prompt and/or model, via LLM-as-a-judge (Part 4) or other methods.

- The ***judge questions*** button ([components/question-list.tsx:135](components/question-list.tsx#L135))
  in the practice column is LLM-as-a-judge: it
  sends the job posting, the skill, the experience level and the generated
  questions to the model and gets one verdict per question back
  ([lib/prompts.ts:428](lib/prompts.ts#L428)).
  I did not optimize the question generation prompt
  ([lib/prompts.ts:272](lib/prompts.ts#L272)) on purpose so
  it creates not so good questions, especially for skills like "very good English". That way the judge can spot those questions.

### Developer-only features

Two things in the UI exist to show and inspect the prompting work, not to help a
candidate practice. In a public app both would be hidden behind a developer flag
and never shown to an end user:

- the **prompting method select** ([components/prompt-method-select.tsx](components/prompt-method-select.tsx))
  in the job description column - an end user
  has no reason to choose how the extraction is prompted, they just want the
  skills
- the **Judge questions** button ([components/question-list.tsx:135](components/question-list.tsx#L135))
  in the practice column - the verdicts assess
  the app's own prompt, and telling a user that the question they are about to
  answer is not relevant is worse than not generating it in the first place

The **Raw LLM Output** popover ([components/skills-column.tsx:56](components/skills-column.tsx#L56))
in the skills column falls in the same category.

## Getting Started

The app calls the model through OpenRouter, so it needs an API key. Copy
[.env.example](.env.example) to `.env` and put your key in it:

```bash
cp .env.example .env
```

Then install the dependencies and run the development server:

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Core concepts

### Prompting techniques

All five are implemented in [lib/prompts.ts](lib/prompts.ts) and switchable in
the UI, so the same job posting can be extracted with each of them:

- **[Zero shot](lib/prompts.ts#L23)** — task, format and rules described, no examples. The
  description alone has to carry it.
- **[Few shot](lib/prompts.ts#L50)** — the same rules plus worked examples that show the exact JSON
  the app parses. Examples teach what rules state but models still get wrong.
- **[Chain of thought](lib/prompts.ts#L100)** — the model reasons about each requirement first and
  answers afterwards. Better on judgement calls, but the answer is buried in
  prose, so the parser has to find the JSON.
- **[Least to most](lib/prompts.ts#L140)** — the task is broken into ordered sub-steps (find the
  requirements → split must/nice → name them) and each step builds on the
  previous one.
- **[Self refinement](lib/prompts.ts#L190)** — the model drafts an answer, critiques it against the
  rules, then emits the corrected version.

### LLM settings

- **Temperature** — randomness of the next-token pick. Low (0–0.3) gives
  repeatable, conservative output and is what extraction and guard decisions
  want; high (0.8+) gives variety, which suits question generation.
- **Top-p / top-k** — the other side of the same knob: instead of flattening
  the distribution they cut it off, either at a cumulative probability (top-p)
  or at a fixed number of candidates (top-k). Normally you tune one of these or
  temperature, not both.
- **Max tokens** — hard cap on the *output* length. Too low truncates
  mid-JSON, which is a parse error and not a model error.
- **Seed** — makes sampling reproducible for a fixed prompt.
  When a model generates text, it doesn't just pick the single most likely next token.
  It picks from a probability distribution, and that pick is random —
  which is why the same request can give different answers each time.
  The seed controls that randomness. It sets the initial state of the random number generator,
  so the same sequence of "random" numbers is used on each run
- **Frequency penalty** - discourages repeating the same words and phrases.
- **Presence penalty** - encourages introducing new concepts.

This app leaves the sampling settings at the provider defaults; the strictness
comes from the prompts and from the parsers rejecting anything malformed.

### Roles

- **System** (`instructions` in the AI SDK call in [app/actions.ts:121](app/actions.ts#L121))
  — standing rules and persona for the whole call. Highest trust, set by the
  developer, not by the end user.
- **User** — the request being answered. Here it is the pasted job description
  or `Skill: … / Experience level: …`. Lowest trust: it comes from outside, so
  the guard treats it strictly as data.
- **Assistant** — the model's own turns. Sent back in a multi-turn
  conversation as history, and can be pre-filled to steer a reply's format.

Keeping user text in the user role and rules in the system role is what makes
the injection defence possible at all — a posting that claims to be a system
message is still just user data.

### Output types

- **Free text** — prose. Fine for humans, unusable for a program.
- **Structured output (JSON)** — a fixed shape the app can parse and render.
  This app uses four ([app/actions.ts](app/actions.ts)):
  `{"mustHave": string[], "niceToHave": string[]}` for the
  skills, `{"questions": [{question, options, correctIndex, explanation}]}`
  for the quiz, `{"accept": boolean, "reason": string}` for the guard
  verdict and `{"verdicts": [{relevant, reason}]}` for the question judge.
- **Enum** — one value out of a closed set. The guard's
  `accept` boolean is the smallest form of this.
- **Other modalities** — images, audio, speech.

## What is missing / next steps

I did not finish the original plan from [CLAUDE.md](CLAUDE.md): the beginner
introduction before the questions is not implemented, wrong answers show the
question's short explanation ([components/question-list.tsx:11](components/question-list.tsx#L11))
but no link to a source for further reading, and the **Continue learning** step
is missing.

The project could be improved by:

- extended explanations plus links to further resources for every wrongly
  answered question, so the user can deep dive into the topic
- generating follow-up questions from the wrong answers, to drill into the
  user's weak areas instead of asking a fresh random set
- making the developer features visible for developers only
