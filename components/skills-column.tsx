import type { Skills } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

function SkillGroup({ title, skills }: { title: string; skills: string[] }) {
  if (skills.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-1">
      <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {title}
      </h3>
      <ul className="flex flex-col divide-y divide-border">
        {skills.map((skill) => (
          <li key={skill} className="py-1.5 text-sm">
            {skill}
          </li>
        ))}
      </ul>
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
          <div className="flex flex-col gap-4">
            <SkillGroup title="Must have" skills={skills.mustHave} />
            <SkillGroup title="Nice to have" skills={skills.niceToHave} />
          </div>
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
