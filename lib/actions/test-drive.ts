"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireApiAccess } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { runPublicFormGuards } from "@/lib/actions/public-form-guards";
import { sendEmail, leadNotificationEmail, autoresponderEmail } from "@/lib/email";
import { nextReference } from "@/lib/sequence";
import {
  testDriveBookingSchema,
  updateTestDriveSchema,
  type TestDriveBookingInput,
} from "@/lib/validations/test-drive";
import type { ActionResult } from "@/lib/actions/models";

export async function submitTestDriveBooking(
  input: TestDriveBookingInput,
): Promise<ActionResult<{ reference: string }>> {
  const guard = await runPublicFormGuards({
    routeKey: "test-drive",
    honeypot: input.honeypot,
    phone: input.phone,
    turnstileToken: input.turnstileToken,
  });
  if (!guard.ok) {
    return guard.silent
      ? { success: true, data: { reference: "" } }
      : { success: false, error: guard.error };
  }

  const parsed = testDriveBookingSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const data = parsed.data;
  const model = data.modelId ? await prisma.model.findUnique({ where: { id: data.modelId } }) : null;
  const reference = await nextReference("TD");

  try {
    await prisma.testDriveBooking.create({
      data: {
        reference,
        fullName: data.fullName,
        phone: data.phone,
        email: data.email,
        modelId: data.modelId || null,
        preferredDate: new Date(`${data.preferredDate}T00:00:00.000Z`),
        timeSlot: data.timeSlot,
        location: data.location,
        notes: data.notes,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { success: false, error: "forms.slotTaken" };
    }
    throw error;
  }

  const notifyTo = process.env.LEAD_NOTIFICATION_EMAIL;
  if (notifyTo) {
    const notification = leadNotificationEmail({
      type: "test drive",
      fullName: data.fullName,
      phone: data.phone,
      email: data.email,
      modelName: model?.displayName,
      message: `${data.preferredDate} ${data.timeSlot} — ${data.location}`,
    });
    await sendEmail({ to: notifyTo, ...notification });
  }
  if (data.email) {
    const autoresponse = autoresponderEmail({ fullName: data.fullName, reference });
    await sendEmail({ to: data.email, ...autoresponse });
  }

  revalidatePath("/admin/test-drives");
  return { success: true, data: { reference } };
}

export async function updateTestDrive(raw: unknown): Promise<ActionResult> {
  const user = await requireApiAccess("testDrives", "update");
  const parsed = updateTestDriveSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: "Validation failed" };

  await prisma.testDriveBooking.update({
    where: { id: parsed.data.id },
    data: {
      status: parsed.data.status,
      assigneeId: parsed.data.assigneeId,
      preferredDate: parsed.data.preferredDate ? new Date(parsed.data.preferredDate) : undefined,
      timeSlot: parsed.data.timeSlot,
    },
  });
  await writeAuditLog({ actorId: user.id, action: "UPDATE", entity: "TestDriveBooking", entityId: parsed.data.id });
  revalidatePath("/admin/test-drives");
  return { success: true, data: undefined };
}
