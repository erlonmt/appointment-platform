import Link from "next/link";
import { connection } from "next/server";

import { BookingFlow } from "@/components/booking/booking-flow";
import { DEMO_ORGANIZATION_ID, DEMO_UNIT_ID } from "@/config/demo";
import { listBookingProfessionalOptionsByUnit } from "@/data-access/booking";
import { listActiveServicesByOrganization } from "@/data-access/services";

export default async function BookingPage() {
  await connection();

  const [services, professionalOptions] = await Promise.all([
    listActiveServicesByOrganization(DEMO_ORGANIZATION_ID),
    listBookingProfessionalOptionsByUnit(DEMO_ORGANIZATION_ID, DEMO_UNIT_ID),
  ]);

  const bookableServiceIds = new Set(
    professionalOptions.map((professional) => professional.serviceId),
  );

  const servicesAvailableForBooking = services.filter((service) =>
    bookableServiceIds.has(service.id),
  );

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <section className="mx-auto max-w-5xl">
        <Link
          href="/"
          className="text-sm font-semibold text-cyan-400 transition hover:text-cyan-300"
        >
          ← Início
        </Link>

        <header className="mt-8">
          <p className="text-sm font-semibold tracking-[0.2em] text-cyan-400 uppercase">
            Agendamento online
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight">
            Agende seu atendimento
          </h1>

          <p className="mt-4 max-w-2xl text-slate-300">
            Escolha o serviço, a data e o horário. Depois, selecione um
            profissional disponível e confirme seus dados.
          </p>
        </header>

        <BookingFlow
          services={servicesAvailableForBooking}
          professionalOptions={professionalOptions}
        />
      </section>
    </main>
  );
}
