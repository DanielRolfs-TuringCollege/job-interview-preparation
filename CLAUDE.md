@AGENTS.md

Following is a rough plan of what i plan to build step by step.

Instruction for AI: Only do what i tell you to do, no extra librarys or tooling. Do not anticipate what else could be done: build exactly what i asked for, nothing on top of it. No unasked-for suggestions of what could be improved or added next. Keep it is simple as possible with. Components should be created when it makes sense. If you miss something ask me. When there are dependencies to install tell me and i want to install them manually, as they bring a lot of code with them and i want to know where all the code comes from. This also covers new shadcn components: never run the install yourself. Give me the exact command, stop, and wait. I run it, commit it, and tell you to continue. Meanwhile build everything that does not depend on the missing code.

## 1. Product concept

Three columns, left to right, mirroring the user's mental flow:

```
┌─────────────────────┬──────────────────────┬─────────────────────────────┐
│ LEFT                │ MIDDLE               │ RIGHT                       │
│ Job description     │ Extracted skills     │ Practice panel              │
│                     │ (vertical tabs)      │                             │
│ ┌─────────────────┐ │  MUST HAVE           │  Experience level           │
│ │ Paste the full  │ │  ▸ TypeScript        │  ( ) Beginner               │
│ │ text of the job │ │  ▸ React             │  (•) Intermediate           │
│ │ you will inter- │ │  ▸ PostgreSQL        │  ( ) Advanced               │
│ │ view for...     │ │                      │  ─────────────────────────  │
│ │                 │ │  NICE TO HAVE        │  Introduction (beginner)    │
│ │                 │ │  ▸ Docker            │  Q1 ( ) A ( ) B ( ) C       │
│ └─────────────────┘ │  ▸ GraphQL           │  ... 3 questions            │
│ [ Analyse ]         │                      │  [ Submit ]                 │
│                     │                      │  → explanations for wrong   │
│                     │                      │  [ Continue learning ]      │
└─────────────────────┴──────────────────────┴─────────────────────────────┘
```

### User flow

1. Paste a job description on the left, press **Analyse**.
2. A guard checks the text really is a job posting. If not, the request is refused.
3. Skills are extracted into strict JSON, split into must-have and nice-to-have.
4. Skills render as vertical tabs in the middle.
5. Clicking a skill opens the right column. Pick an experience level.
6. The app generates an introduction (beginner only) plus 3 multiple-choice
   questions with 3 options each based on the selected skill and experience level.
7. On submit, every **wrong** answer gets an explanation of at most 2 sentences
   with a link to a source for further reading. Correct answers are just marked correct.
8. **Continue learning** generates 3 new questions that dig deeper into the topics
   answered wrong, and introduces new ground for the topics already mastered.
