"use client";

import { useState } from "react";

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

  return (
    <div className="flex min-h-0 flex-col gap-4 p-6">
      <h2 className="text-lg font-semibold">{skill}</h2>
      <FieldSet>
        <FieldLegend variant="label">Experience level</FieldLegend>
        <RadioGroup
          value={level}
          onValueChange={(value) => setLevel(String(value))}
        >
          {EXPERIENCE_LEVELS.map(({ value, label }) => (
            <Field key={value} orientation="horizontal">
              <RadioGroupItem id={`${skill}-${value}`} value={value} />
              <FieldLabel htmlFor={`${skill}-${value}`} className="font-normal">
                {label}
              </FieldLabel>
            </Field>
          ))}
        </RadioGroup>
      </FieldSet>
      <Button type="button" className="self-end">
        Generate questions
      </Button>
    </div>
  );
}
