"use client";

import { useActionState, useState } from "react";

import { judgeQuestions, type Question, type Verdict } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldSet, FieldLegend } from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

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

/** The judge's verdict on one question - green when it is relevant, red when not. */
function QuestionVerdict({ verdict }: { verdict: Verdict }) {
  return (
    <p
      className={cn(
        "text-sm",
        verdict.relevant
          ? "text-green-600 dark:text-green-400"
          : "text-destructive",
      )}
    >
      <span className="font-medium">
        {verdict.relevant ? "Relevant" : "Not relevant"}
      </span>{" "}
      - {verdict.reason}
    </p>
  );
}

export function QuestionList({
  questions,
  jobDescription,
  skill,
  level,
}: {
  questions: Question[];
  jobDescription: string;
  skill: string;
  level: string;
}) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [judgeState, judgeAction, isJudging] = useActionState(judgeQuestions, {
    raw: null,
    verdicts: null,
    error: null,
  });

  const allAnswered = questions.every(
    (_question, index) => answers[index] !== undefined,
  );

  const verdicts = isJudging ? null : judgeState.verdicts;

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
          {verdicts && <QuestionVerdict verdict={verdicts[questionIndex]} />}
        </FieldSet>
      ))}
      {judgeState.error && (
        <p className="text-sm text-destructive">{judgeState.error}</p>
      )}
      {!isJudging && !judgeState.verdicts && judgeState.raw && (
        <p className="text-sm text-destructive">
          The judgement can not be rendered because the raw LLM output does not
          provide a valid JSON.
        </p>
      )}
      <form action={judgeAction} className="flex items-center justify-between">
        <input type="hidden" name="jobDescription" value={jobDescription} />
        <input type="hidden" name="skill" value={skill} />
        <input type="hidden" name="level" value={level} />
        <input
          type="hidden"
          name="questions"
          value={JSON.stringify({ questions })}
        />
        <Button type="submit" variant="outline" disabled={isJudging}>
          {isJudging ? "Judging..." : "Judge questions"}
        </Button>
        {!submitted && (
          <Button
            type="button"
            disabled={!allAnswered}
            onClick={() => setSubmitted(true)}
          >
            Submit
          </Button>
        )}
      </form>
    </div>
  );
}
