"use client";

import { useActionState, useState } from "react";

import { analyseJobDescription } from "@/app/actions";
import { JobDescriptionColumn } from "@/components/job-description-column";
import { SkillsColumn } from "@/components/skills-column";

export default function Home() {
  const [jobDescription, setJobDescription] = useState("");
  const [state, formAction, isPending] = useActionState(analyseJobDescription, {
    raw: null,
    skills: null,
    error: null,
  });

  return (
    <main className="grid min-h-0 flex-1 grid-cols-1 divide-y divide-border md:grid-cols-[1fr_240px_1fr] md:divide-x md:divide-y-0">
      <JobDescriptionColumn
        action={formAction}
        value={jobDescription}
        onValueChange={setJobDescription}
        isPending={isPending}
        error={state.error}
      />
      <SkillsColumn
        skills={state.skills}
        raw={state.raw}
        isPending={isPending}
      />
      <div className="p-6" />
    </main>
  );
}
