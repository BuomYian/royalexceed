"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireApiAccess } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { testimonialInputSchema, type TestimonialInput } from "@/lib/validations/testimonial";
import type { ActionResult } from "@/lib/actions/models";

export async function createTestimonial(raw: TestimonialInput): Promise<ActionResult<{ id: string }>> {
  const user = await requireApiAccess("testimonials", "create");
  const parsed = testimonialInputSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors };

  const testimonial = await prisma.testimonial.create({ data: parsed.data });
  await writeAuditLog({ actorId: user.id, action: "CREATE", entity: "Testimonial", entityId: testimonial.id });
  revalidatePath("/admin/testimonials");
  revalidateTag("testimonials", "max");
  return { success: true, data: { id: testimonial.id } };
}

export async function updateTestimonial(raw: TestimonialInput): Promise<ActionResult> {
  const user = await requireApiAccess("testimonials", "update");
  if (!raw.id) return { success: false, error: "Missing id" };
  const parsed = testimonialInputSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors };

  await prisma.testimonial.update({ where: { id: raw.id }, data: parsed.data });
  await writeAuditLog({ actorId: user.id, action: "UPDATE", entity: "Testimonial", entityId: raw.id });
  revalidatePath("/admin/testimonials");
  revalidateTag("testimonials", "max");
  return { success: true, data: undefined };
}

export async function toggleTestimonialApproval(id: string, isApproved: boolean): Promise<ActionResult> {
  const user = await requireApiAccess("testimonials", "update");
  await prisma.testimonial.update({ where: { id }, data: { isApproved } });
  await writeAuditLog({ actorId: user.id, action: "UPDATE", entity: "Testimonial", entityId: id, changes: { isApproved } });
  revalidatePath("/admin/testimonials");
  revalidateTag("testimonials", "max");
  return { success: true, data: undefined };
}

export async function deleteTestimonial(id: string): Promise<ActionResult> {
  const user = await requireApiAccess("testimonials", "delete");
  await prisma.testimonial.delete({ where: { id } });
  await writeAuditLog({ actorId: user.id, action: "DELETE", entity: "Testimonial", entityId: id });
  revalidatePath("/admin/testimonials");
  revalidateTag("testimonials", "max");
  return { success: true, data: undefined };
}
