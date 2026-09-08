"use client";

import { useActionState, useState } from "react";

import { generateQuestions } from "@/app/actions";
import { QuestionList } from "@/components/question-list";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldSet, FieldLegend } from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const EXPERIENCE_LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export function PracticeColumn({ skill }: { skill: string }) {
  const [level, setLevel] = useState("intermediate");
  const [state, formAction, isPending] = useActionState(generateQuestions, {
    raw: null,
    questions: null,
    error: null,
  });

  return (
    <div className="flex min-h-0 flex-col gap-6 p-6">
      <h2 className="text-lg font-semibold">{skill}</h2>
      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="skill" value={skill} />
        <FieldSet>
          <FieldLegend variant="label">Experience level</FieldLegend>
          <RadioGroup
            name="level"
            value={level}
            onValueChange={(value) => setLevel(String(value))}
          >
            {EXPERIENCE_LEVELS.map(({ value, label }) => (
              <Field key={value} orientation="horizontal">
                <RadioGroupItem id={`${skill}-${value}`} value={value} />
                <FieldLabel
                  htmlFor={`${skill}-${value}`}
                  className="font-normal"
                >
                  {label}
                </FieldLabel>
              </Field>
            ))}
          </RadioGroup>
        </FieldSet>
        {state.error && (
          <p className="text-sm text-destructive">{state.error}</p>
        )}
        <Button type="submit" className="self-end" disabled={isPending}>
          {isPending ? "Generating..." : "Generate questions"}
        </Button>
      </form>
      {!isPending &&
        (state.questions ? (
          /** A new generation starts over, so the old answers are dropped. */
          <QuestionList key={state.raw} questions={state.questions} />
        ) : (
          state.raw && (
            <p className="text-sm text-destructive">
              The questions can not be rendered because the raw LLM output does
              not provide a valid JSON.
            </p>
          )
        ))}
    </div>
  );
}
