import type { LandingStep } from "@/data/landing-page";

interface StepCardProps {
  step: LandingStep;
}

export function StepCard({ step }: StepCardProps) {
  const formattedNumber = String(step.number).padStart(2, "0");

  return (
    <li className="border-l border-cyan-400/40 pl-6">
      <span
        aria-hidden="true"
        className="text-sm font-bold text-cyan-400"
      >
        {formattedNumber}
      </span>

      <h3 className="mt-4 text-xl font-semibold">{step.title}</h3>

      <p className="mt-3 leading-7 text-slate-300">{step.description}</p>
    </li>
  );
}
