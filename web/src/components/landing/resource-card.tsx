import type { LandingResource } from "@/data/landing-page";

interface ResourceCardProps {
  resource: LandingResource;
}

export function ResourceCard({ resource }: ResourceCardProps) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <h3 className="text-lg font-semibold">{resource.title}</h3>

      <p className="mt-3 leading-7 text-slate-300">{resource.description}</p>
    </article>
  );
}
