"use client";

import { useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DEFAULT_PROMPT_METHOD,
  PROMPT_METHODS,
  type PromptMethod,
} from "@/lib/prompts";

const labels = Object.fromEntries(
  Object.entries(PROMPT_METHODS).map(([value, method]) => [
    value,
    method.label,
  ]),
);

export function PromptMethodSelect() {
  const [method, setMethod] = useState<PromptMethod>(DEFAULT_PROMPT_METHOD);

  return (
    <Select
      name="promptMethod"
      items={labels}
      value={method}
      onValueChange={(value) => {
        if (value) {
          setMethod(value);
        }
      }}
    >
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">Prompting method</span>
        <SelectTrigger size="sm">
          <SelectValue />
        </SelectTrigger>
      </div>
      <SelectContent align="start">
        {Object.entries(PROMPT_METHODS).map(
          ([value, { label, instructions }]) => (
            <Tooltip key={value}>
              <TooltipTrigger render={<SelectItem value={value} />}>
                {label}
              </TooltipTrigger>
              <TooltipContent
                side="right"
                align="start"
                className="max-w-[min(36rem,90vw)] items-start"
              >
                <pre className="max-h-[60vh] overflow-auto font-mono text-[11px] whitespace-pre-wrap">
                  {instructions}
                </pre>
              </TooltipContent>
            </Tooltip>
          ),
        )}
      </SelectContent>
    </Select>
  );
}
