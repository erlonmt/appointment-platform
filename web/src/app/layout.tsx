import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Appointment Platform",
  description: "Agendamentos simples para negócios de serviços",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
