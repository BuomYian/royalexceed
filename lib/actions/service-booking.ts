"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireApiAccess } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { runPublicFormGuards } from "@/lib/actions/public-form-guards";
import { sendEmail, leadNotificationEmail, autoresponderEmail } from "@/lib/email";
import { nextReference } from "@/lib/sequence";
import {
  serviceBookingSchema,
  updateServiceBookingSchema,
  type ServiceBookingInput,
} from "@/lib/validations/service-booking";
import type { ActionResult } from "@/lib/actions/models";

export async function submitServiceBooking(
  input: ServiceBookingInput,
): Promise<ActionResult<{ reference: string }>> {
  const guard = await runPublicFormGuards({
    routeKey: "service-booking",
    honeypot: input.honeypot,
    phone: input.phone,
    turnstileToken: input.turnstileToken,
  });
  if (!guard.ok) {
    return guard.silent
      ? { success: true, data: { reference: "" } }
      : { success: false, error: guard.error };
  }

  const parsed = serviceBookingSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const data = parsed.data;
  const reference = await nextReference("SV");

  await prisma.serviceBooking.create({
    data: {
      reference,
      fullName: data.fullName,
      phone: data.phone,
      email: data.email,
      vehicleModel: data.vehicleModel,
      plateNumber: data.plateNumber,
      vin: data.vin,
      mileageKm: data.mileageKm,
      serviceType: data.serviceType,
      preferredDate: new Date(`${data.preferredDate}T00:00:00.000Z`),
      description: data.description,
    },
  });

  const notifyTo = process.env.LEAD_NOTIFICATION_EMAIL;
  if (notifyTo) {
    const notification = leadNotificationEmail({
      type: "service booking",
      fullName: data.fullName,
      phone: data.phone,
      email: data.email,
      message: `${data.serviceType} — ${data.vehicleModel} on ${data.preferredDate}`,
    });
    await sendEmail({ to: notifyTo, ...notification });
  }
  if (data.email) {
    const autoresponse = autoresponderEmail({ fullName: data.fullName, reference });
    await sendEmail({ to: data.email, ...autoresponse });
  }

  revalidatePath("/admin/service-bookings");
  return { success: true, data: { reference } };
}

export async function updateServiceBooking(raw: unknown): Promise<ActionResult> {
  const user = await requireApiAccess("serviceBookings", "update");
  const parsed = updateServiceBookingSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: "Validation failed" };

  await prisma.serviceBooking.update({
    where: { id: parsed.data.id },
    data: { status: parsed.data.status, assigneeId: parsed.data.assigneeId },
  });
  await writeAuditLog({ actorId: user.id, action: "UPDATE", entity: "ServiceBooking", entityId: parsed.data.id });
  revalidatePath("/admin/service-bookings");
  return { success: true, data: undefined };
}
