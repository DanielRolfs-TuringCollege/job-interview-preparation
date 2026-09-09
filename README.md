### Interview Practice App

To demonstrate what I've learned in sprint one of the AI Engineering course I created this project.

## Info for the reviewer:

I chose the following optional tasks:

(medium) Implement at least two structured JSON output formats for the interview preparation:

- One of them extracting the skills
- One extracting the questions

(medium) Try to jailbreak (break into) your own application by trying to provide an invalid prompt, message, job file, etc. Provide the results of this experiment in an Excel sheet.

- My jailbreak attempts are listed in the jailbreaks.md
- The first two attempts were able to bypass my guard. The result was that cooking ingredients were listed as skills. The last version I was not able to bypass, also not with a prompt from another AI.
- I improved the guard so that none of these jailbreak prompts bypasses the guard anymore. To test it please check out previous commits.

(medium) Add a separate text field or another field to include the job description (the position) you are applying for and getting interview preparation for that particular position (RAG).

- The first input field is exactly that

(medium) Add at least one security guard to your app to prevent misuse. Design for usability.

- The guard sits before the skill extraction

(hard) Assess the performance of your prompt and/or model, via LLM-as-a-judge (Part 4) or other methods.

- The guard is an LLM-as-a-judge

## Getting Started

First, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
