"use client";

import { useState } from "react";

import type { Question } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldSet, FieldLegend } from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

function QuestionResult({
  question,
  answer,
}: {
  question: Question;
  answer: number;
}) {
  if (answer === question.correctIndex) {
    return <p className="text-sm font-medium">Correct</p>;
  }

  return (
    <div className="flex flex-col gap-1">
      <p className="text-sm font-medium text-destructive">
        Wrong - correct is: {question.options[question.correctIndex]}
      </p>
      <p className="text-sm text-muted-foreground">{question.explanation}</p>
    </div>
  );
}

export function QuestionList({ questions }: { questions: Question[] }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const allAnswered = questions.every(
    (_question, index) => answers[index] !== undefined,
  );

  return (
    <div className="flex flex-col gap-6">
      {questions.map((question, questionIndex) => (
        <FieldSet key={questionIndex}>
          <FieldLegend variant="label">
            {questionIndex + 1}. {question.question}
          </FieldLegend>
          <RadioGroup
            value={answers[questionIndex] ?? null}
            onValueChange={(value) =>
              setAnswers((previous) => ({
                ...previous,
                [questionIndex]: Number(value),
              }))
            }
            disabled={submitted}
          >
            {question.options.map((option, optionIndex) => (
              <Field key={optionIndex} orientation="horizontal">
                <RadioGroupItem
                  id={`q${questionIndex}-o${optionIndex}`}
                  value={optionIndex}
                />
                <FieldLabel
                  htmlFor={`q${questionIndex}-o${optionIndex}`}
                  className="font-normal"
                >
                  {option}
                </FieldLabel>
              </Field>
            ))}
          </RadioGroup>
          {submitted && (
            <QuestionResult
              question={question}
              answer={answers[questionIndex]}
            />
          )}
        </FieldSet>
      ))}
      {!submitted && (
        <Button
          type="button"
          className="self-end"
          disabled={!allAnswered}
          onClick={() => setSubmitted(true)}
        >
          Submit
        </Button>
      )}
    </div>
  );
}
