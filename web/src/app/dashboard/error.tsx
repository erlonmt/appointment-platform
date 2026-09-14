"use client";

import { ErrorScreen } from "@/components/shared/error-screen";

interface DashboardErrorProps {
  error: Error & { digest?: string };
  retry: () => void;
}

export default function DashboardError({ retry }: DashboardErrorProps) {
  return (
    <ErrorScreen title="Não foi possível carregar o painel" onRetry={retry} />
  );
}
