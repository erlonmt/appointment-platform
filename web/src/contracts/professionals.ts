export type ConfirmationMode = "automatic" | "manual";

export interface ProfessionalSummary {
  id: string;
  name: string;
  confirmationMode: ConfirmationMode;
  services: string[];
}
