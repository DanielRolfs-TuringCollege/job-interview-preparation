import { JobDescriptionColumn } from "@/components/job-description-column";

export default function Home() {
  return (
    <main className="grid flex-1 grid-cols-1 divide-y divide-border md:grid-cols-[1fr_240px_1fr] md:divide-x md:divide-y-0">
      <JobDescriptionColumn />
      <div className="p-6" />
      <div className="p-6" />
    </main>
  );
}
