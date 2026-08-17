import { z } from "zod";
import { baseLeadFieldsSchema } from "./common";

export const SERVICE_TYPES = [
  "Scheduled maintenance",
  "Oil & filter change",
  "Brake service",
  "Tyres & alignment",
  "AC service",
  "Diagnostics / warning light",
  "Bodywork / accident repair",
  "Other",
] as const;

export const serviceBookingSchema = baseLeadFieldsSchema.extend({
  vehicleModel: z.string().trim().min(1, "forms.requiredField").max(100),
  plateNumber: z.string().trim().max(30).optional(),
  vin: z.string().trim().max(50).optional(),
  mileageKm: z.coerce.number().int().min(0).max(2_000_000).optional(),
  serviceType: z.enum(SERVICE_TYPES),
  preferredDate: z.string().min(1, "forms.requiredField"),
  description: z.string().trim().max(2000).optional(),
});
export type ServiceBookingInput = z.infer<typeof serviceBookingSchema>;

export const updateServiceBookingSchema = z.object({
  id: z.string(),
  status: z
    .enum(["PENDING", "CONFIRMED", "RESCHEDULED", "COMPLETED", "CANCELLED", "NO_SHOW"])
    .optional(),
  assigneeId: z.string().uuid().nullable().optional(),
});
