"use client";

import { useActionState } from "react";

import { analyseJobDescription } from "@/app/actions";
import { JobDescriptionColumn } from "@/components/job-description-column";
import { SkillsColumn } from "@/components/skills-column";

export default function Home() {
  const [state, formAction, isPending] = useActionState(analyseJobDescription, {
    text: null,
    error: null,
  });

  return (
    <main className="grid flex-1 grid-cols-1 divide-y divide-border md:grid-cols-[1fr_240px_1fr] md:divide-x md:divide-y-0">
      <JobDescriptionColumn
        action={formAction}
        isPending={isPending}
        error={state.error}
      />
      <SkillsColumn text={state.text} isPending={isPending} />
      <div className="p-6" />
    </main>
  );
}
