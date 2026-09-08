import { ChevronRight } from "lucide-react";
import { Fragment } from "react";

import type { Skills } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

function SkillGroup({ title, skills }: { title: string; skills: string[] }) {
  if (skills.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-1">
      <h3 className="px-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {title}
      </h3>
      <div className="flex flex-col">
        {skills.map((skill, index) => (
          <Fragment key={skill}>
            {index > 0 && <Separator />}
            <TabsTrigger
              value={skill}
              className="h-auto flex-none justify-between rounded-none px-2 py-2 text-left font-normal break-words whitespace-normal hover:bg-muted/50"
            >
              {skill}
              <ChevronRight className="text-muted-foreground" />
            </TabsTrigger>
          </Fragment>
        ))}
      </div>
    </div>
  );
}

export function SkillsColumn({
  skills,
  raw,
  isPending,
}: {
  skills: Skills | null;
  raw: string | null;
  isPending: boolean;
}) {
  return (
    <div className="flex min-h-0 flex-col gap-4 p-6">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Skills</h2>
        {raw && (
          <Popover>
            <PopoverTrigger
              render={
                <Button variant="outline" size="sm" disabled={isPending} />
              }
            >
              Raw LLM Output
            </PopoverTrigger>
            <PopoverContent align="end" className="w-96">
              <pre className="max-h-96 overflow-auto font-mono text-xs whitespace-pre-wrap">
                {raw}
              </pre>
            </PopoverContent>
          </Popover>
        )}
      </div>
      <div className="min-h-0 flex-1 overflow-auto">
        {isPending ? (
          <p className="text-sm text-muted-foreground">Analysing...</p>
        ) : skills ? (
          <TabsList
            variant="line"
            className="w-full items-stretch justify-start gap-4 p-0 text-left"
          >
            <SkillGroup title="Must have" skills={skills.mustHave} />
            <SkillGroup title="Nice to have" skills={skills.niceToHave} />
          </TabsList>
        ) : (
          raw && (
            <p className="text-sm text-destructive">
              The skill list can not be rendered because the raw LLM output does
              not provide a valid JSON.
            </p>
          )
        )}
      </div>
    </div>
  );
}
