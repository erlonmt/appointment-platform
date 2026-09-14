"use client";

import { ErrorScreen } from "@/components/shared/error-screen";

interface BookingErrorProps {
  error: Error & { digest?: string };
  retry: () => void;
}

export default function BookingError({ retry }: BookingErrorProps) {
  return (
    <ErrorScreen
      title="Não foi possível carregar o agendamento"
      onRetry={retry}
    />
  );
}
