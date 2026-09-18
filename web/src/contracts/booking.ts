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

export interface CreateBookingRequest {
  serviceId: string;
  professionalId: string;
  startsAt: string;
  customer: BookingCustomerDetails;
  quotedPriceCents: number;
  quotedDurationMinutes: number;
}

export type BookingAvailabilityResponse =
  | { slots: BookingTimeSlot[]; error?: never }
  | { error: string; slots?: never };

export type BookingProfessionalsResponse =
  | { professionals: BookingProfessionalOption[]; error?: never }
  | { error: string; professionals?: never };

export type CreateBookingResponse =
  | { appointmentId: string; status: "confirmed"; error?: never }
  | { error: string; appointmentId?: never; status?: never };
