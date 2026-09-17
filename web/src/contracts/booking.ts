import type { ConfirmationMode } from "./professionals";

export interface BookingTimeSlot {
  startsAt: string;
  localDate: string;
  localStartTime: string;
  availableProfessionals: number;
}

export interface BookingProfessionalOption {
  serviceId: string;
  professionalId: string;
  professionalName: string;
  confirmationMode: ConfirmationMode;
  priceCents: number;
  durationMinutes: number;
  bufferMinutes: number;
}

export interface BookingCustomerDetails {
  name: string;
  phone: string;
  email: string | null;
}
