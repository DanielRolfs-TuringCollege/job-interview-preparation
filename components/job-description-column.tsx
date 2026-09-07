import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function JobDescriptionColumn({
  action,
  isPending,
  error,
}: {
  action: (formData: FormData) => void;
  isPending: boolean;
  error: string | null;
}) {
  return (
    <form action={action} className="flex flex-col gap-4 p-6">
      <h2 className="text-lg font-semibold">Job description</h2>
      <Textarea
        name="jobDescription"
        className="field-sizing-fixed flex-1 resize-none"
        placeholder="Paste the full text of the job you will interview for..."
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button className="self-start" type="submit" disabled={isPending}>
        {isPending ? "Analysing..." : "Analyse"}
      </Button>
    </form>
  );
}
