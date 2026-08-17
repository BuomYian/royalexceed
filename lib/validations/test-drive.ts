import { z } from "zod";
import { baseLeadFieldsSchema } from "./common";

export const TIME_SLOTS = [
  "09:00-10:00",
  "10:00-11:00",
  "11:00-12:00",
  "13:00-14:00",
  "14:00-15:00",
  "15:00-16:00",
  "16:00-17:00",
] as const;

export const testDriveBookingSchema = baseLeadFieldsSchema.extend({
  modelId: z.string().min(1, "forms.requiredField"),
  preferredDate: z
    .string()
    .min(1, "forms.requiredField")
    // date-only string (yyyy-mm-dd) — normalized here so the DB's
    // @@unique([preferredDate, timeSlot]) constraint actually catches
    // double-bookings regardless of time-of-day the form was submitted.
    .refine((v) => !Number.isNaN(Date.parse(v)), "forms.requiredField")
    .transform((v) => new Date(`${v}T00:00:00.000Z`).toISOString().slice(0, 10)),
  timeSlot: z.enum(TIME_SLOTS),
  location: z.enum(["Showroom - Juba Town", "Office visit"]).default("Showroom - Juba Town"),
  notes: z.string().trim().max(1000).optional(),
});
export type TestDriveBookingInput = z.infer<typeof testDriveBookingSchema>;

export const bookingStatusSchema = z.enum([
  "PENDING",
  "CONFIRMED",
  "RESCHEDULED",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
]);

export const updateTestDriveSchema = z.object({
  id: z.string(),
  status: bookingStatusSchema.optional(),
  assigneeId: z.string().uuid().nullable().optional(),
  preferredDate: z.string().optional(),
  timeSlot: z.enum(TIME_SLOTS).optional(),
});
