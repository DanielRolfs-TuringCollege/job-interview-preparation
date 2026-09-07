export function SkillsColumn({
  text,
  isPending,
}: {
  text: string | null;
  isPending: boolean;
}) {
  return (
    <div className="flex flex-col gap-4 overflow-auto p-6">
      <h2 className="text-lg font-semibold">Skills</h2>
      {isPending ? (
        <p className="text-sm text-muted-foreground">Analysing...</p>
      ) : (
        text && (
          <pre className="font-mono text-xs whitespace-pre-wrap">{text}</pre>
        )
      )}
    </div>
  );
}
