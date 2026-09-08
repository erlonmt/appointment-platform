import Link from "next/link";

type DashboardSection = "professionals" | "services";

interface DashboardNavigationProps {
  currentSection: DashboardSection;
}

const destinationBySection = {
  professionals: {
    href: "/dashboard/services",
    label: "Ver serviços →",
  },
  services: {
    href: "/dashboard/professionals",
    label: "Ver profissionais →",
  },
} satisfies Record<
  DashboardSection,
  {
    href: string;
    label: string;
  }
>;

export function DashboardNavigation({
  currentSection,
}: DashboardNavigationProps) {
  const destination = destinationBySection[currentSection];

  return (
    <nav className="flex items-center justify-between gap-4">
      <Link
        href="/"
        className="text-sm font-semibold text-cyan-400 transition hover:text-cyan-300"
      >
        ← Início
      </Link>

      <Link
        href={destination.href}
        className="text-sm font-semibold text-cyan-400 transition hover:text-cyan-300"
      >
        {destination.label}
      </Link>
    </nav>
  );
}
