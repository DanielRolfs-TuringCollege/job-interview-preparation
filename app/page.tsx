"use client";

import { useActionState, useState } from "react";

import { analyseJobDescription } from "@/app/actions";
import { JobDescriptionColumn } from "@/components/job-description-column";
import { PracticeColumn } from "@/components/practice-column";
import { SkillsColumn } from "@/components/skills-column";
import { Tabs, TabsContent } from "@/components/ui/tabs";

export default function Home() {
  const [jobDescription, setJobDescription] = useState("");
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [state, formAction, isPending] = useActionState(analyseJobDescription, {
    raw: null,
    skills: null,
    error: null,
  });

  return (
    <Tabs
      orientation="vertical"
      value={selectedSkill}
      onValueChange={(value) =>
        setSelectedSkill(typeof value === "string" ? value : null)
      }
      className="grid min-h-0 flex-1 grid-cols-1 gap-0 divide-y divide-border md:grid-cols-3 md:divide-x md:divide-y-0"
    >
      <JobDescriptionColumn
        action={formAction}
        onSubmit={() => setSelectedSkill(null)}
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
      <div className="min-h-0 overflow-auto">
        {selectedSkill && (
          <TabsContent key={selectedSkill} value={selectedSkill}>
            <PracticeColumn
              skill={selectedSkill}
              jobDescription={jobDescription}
            />
          </TabsContent>
        )}
      </div>
    </Tabs>
  );
}
