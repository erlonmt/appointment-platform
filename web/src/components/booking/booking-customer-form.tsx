"use client";

import { useState } from "react";
import type { SubmitEvent } from "react";

export interface BookingCustomerDetails {
  name: string;
  phone: string;
  email: string | null;
}

interface BookingCustomerFormProps {
  initialValues?: BookingCustomerDetails | null;
  onReview: (customerDetails: BookingCustomerDetails) => void;
}

export function BookingCustomerForm({
  initialValues,
  onReview,
}: BookingCustomerFormProps) {
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);

    const name = String(formData.get("name") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();

    if (!name || !phone) {
      setError("Informe seu nome e telefone.");
      return;
    }

    onReview({
      name,
      phone,
      email: email || null,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      onChange={() => setError(null)}
      className="mt-8 space-y-5"
    >
      <div>
        <label
          htmlFor="booking-customer-name"
          className="block text-sm font-semibold text-slate-200"
        >
          Nome
        </label>

        <input
          id="booking-customer-name"
          name="name"
          type="text"
          autoComplete="name"
          required
          defaultValue={initialValues?.name ?? ""}
          className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
        />
      </div>

      <div>
        <label
          htmlFor="booking-customer-phone"
          className="block text-sm font-semibold text-slate-200"
        >
          Telefone
        </label>

        <input
          id="booking-customer-phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          required
          defaultValue={initialValues?.phone ?? ""}
          className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
        />
      </div>

      <div>
        <label
          htmlFor="booking-customer-email"
          className="block text-sm font-semibold text-slate-200"
        >
          E-mail (opcional)
        </label>

        <input
          id="booking-customer-email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={initialValues?.email ?? ""}
          className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
        />
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-xl border border-red-800 bg-red-950/40 p-4 text-red-200"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        className="rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
      >
        Revisar agendamento
      </button>
    </form>
  );
}
