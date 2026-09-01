export interface LandingResource {
  readonly title: string;
  readonly description: string;
}

export interface LandingStep {
  readonly number: number;
  readonly title: string;
  readonly description: string;
}

export const resources: readonly LandingResource[] = [
  {
    title: "Agenda centralizada",
    description:
      "Visualize serviços, profissionais e horários disponíveis em um único lugar.",
  },
  {
    title: "Confirmação flexível",
    description:
      "Cada profissional pode escolher entre confirmação automática ou manual.",
  },
  {
    title: "Faturamento por período",
    description:
      "Acompanhe quanto foi produzido por dia, semana, mês e profissional a partir dos atendimentos finalizados.",
  },
];

export const steps: readonly LandingStep[] = [
  {
    number: 1,
    title: "Configure o negócio",
    description:
      "Cadastre unidades, profissionais, serviços, preços e horários de atendimento.",
  },
  {
    number: 2,
    title: "Compartilhe a agenda",
    description:
      "Envie o link para o cliente escolher serviço, profissional e horário.",
  },
  {
    number: 3,
    title: "Acompanhe os resultados",
    description:
      "Finalize atendimentos e acompanhe o faturamento por dia, semana, mês e profissional.",
  },
];
