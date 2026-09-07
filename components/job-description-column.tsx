import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function JobDescriptionColumn() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <h2 className="text-lg font-semibold">Job description</h2>
      <Textarea
        className="field-sizing-fixed flex-1 resize-none"
        placeholder="Paste the full text of the job you will interview for..."
      />
      <Button className="self-start">Analyse</Button>
    </div>
  );
}
