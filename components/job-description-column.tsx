import { PromptMethodSelect } from "@/components/prompt-method-select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function JobDescriptionColumn({
  action,
  value,
  onValueChange,
  isPending,
  error,
}: {
  action: (formData: FormData) => void;
  value: string;
  onValueChange: (value: string) => void;
  isPending: boolean;
  error: string | null;
}) {
  return (
    <form action={action} className="flex min-h-0 flex-col gap-4 p-6">
      <h2 className="text-lg font-semibold">Job description</h2>
      <Textarea
        name="jobDescription"
        className="field-sizing-fixed min-h-0 flex-1 resize-none"
        placeholder="Paste the full text of the job you will interview for..."
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex items-end justify-between gap-2">
        <PromptMethodSelect />
        <Button type="submit" disabled={isPending}>
          {isPending ? "Analysing..." : "Analyse"}
        </Button>
      </div>
    </form>
  );
}
