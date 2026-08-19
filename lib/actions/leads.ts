"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireApiAccess } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { runPublicFormGuards } from "@/lib/actions/public-form-guards";
import { sendEmail, leadNotificationEmail, autoresponderEmail } from "@/lib/email";
import {
  generalLeadSchema,
  quoteLeadSchema,
  partsLeadSchema,
  financeLeadSchema,
  updateLeadSchema,
  addLeadNoteSchema,
  type GeneralLeadInput,
  type QuoteLeadInput,
  type PartsLeadInput,
  type FinanceLeadInput,
} from "@/lib/validations/lead";
import type { ActionResult } from "@/lib/actions/models";

async function notifyLead(params: {
  type: string;
  fullName: string;
  phone: string;
  email?: string;
  message?: string;
  modelName?: string;
}) {
  const notifyTo = process.env.LEAD_NOTIFICATION_EMAIL;
  if (notifyTo) {
    const notification = leadNotificationEmail(params);
    await sendEmail({ to: notifyTo, ...notification });
  }
  if (params.email) {
    const autoresponse = autoresponderEmail({ fullName: params.fullName });
    await sendEmail({ to: params.email, ...autoresponse });
  }
}

export type SubmitLeadState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function submitGeneralLead(input: GeneralLeadInput): Promise<ActionResult> {
  const guard = await runPublicFormGuards({
    routeKey: "lead-general",
    honeypot: input.honeypot,
    phone: input.phone,
    turnstileToken: input.turnstileToken,
  });
  if (!guard.ok) return guard.silent ? { success: true, data: undefined } : { success: false, error: guard.error };

  const parsed = generalLeadSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const data = parsed.data;

  await prisma.lead.create({
    data: {
      type: "GENERAL",
      fullName: data.fullName,
      phone: data.phone,
      email: data.email,
      message: data.message,
      source: `contact-${data.department}`,
      pageUrl: data.pageUrl,
    },
  });

  await notifyLead({ type: "general enquiry", fullName: data.fullName, phone: data.phone, email: data.email, message: data.message });
  revalidatePath("/admin/leads");
  return { success: true, data: undefined };
}

export async function submitQuoteLead(input: QuoteLeadInput): Promise<ActionResult> {
  const guard = await runPublicFormGuards({
    routeKey: "lead-quote",
    honeypot: input.honeypot,
    phone: input.phone,
    turnstileToken: input.turnstileToken,
  });
  if (!guard.ok) return guard.silent ? { success: true, data: undefined } : { success: false, error: guard.error };

  const parsed = quoteLeadSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const data = parsed.data;
  const model = await prisma.model.findUnique({ where: { id: data.modelId } });

  await prisma.lead.create({
    data: {
      type: "QUOTE",
      fullName: data.fullName,
      phone: data.phone,
      email: data.email,
      message: data.message,
      modelId: data.modelId,
      source: data.source ?? "website",
      pageUrl: data.pageUrl,
    },
  });

  await notifyLead({ type: "quote request", fullName: data.fullName, phone: data.phone, email: data.email, modelName: model?.displayName });
  revalidatePath("/admin/leads");
  return { success: true, data: undefined };
}

export async function submitPartsLead(input: PartsLeadInput): Promise<ActionResult> {
  const guard = await runPublicFormGuards({
    routeKey: "lead-parts",
    honeypot: input.honeypot,
    phone: input.phone,
    turnstileToken: input.turnstileToken,
  });
  if (!guard.ok) return guard.silent ? { success: true, data: undefined } : { success: false, error: guard.error };

  const parsed = partsLeadSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const data = parsed.data;

  await prisma.lead.create({
    data: {
      type: "PARTS",
      fullName: data.fullName,
      phone: data.phone,
      email: data.email,
      message: `Part: ${data.partName}${data.partNumber ? ` (#${data.partNumber})` : ""} · Qty: ${data.quantity}${data.vin ? ` · VIN: ${data.vin}` : ""}`,
      source: "parts-page",
    },
  });

  await notifyLead({ type: "parts enquiry", fullName: data.fullName, phone: data.phone, email: data.email, message: data.partName });
  revalidatePath("/admin/leads");
  return { success: true, data: undefined };
}

export async function submitFinanceLead(input: FinanceLeadInput): Promise<ActionResult> {
  const guard = await runPublicFormGuards({
    routeKey: "lead-finance",
    honeypot: input.honeypot,
    phone: input.phone,
    turnstileToken: input.turnstileToken,
  });
  if (!guard.ok) return guard.silent ? { success: true, data: undefined } : { success: false, error: guard.error };

  const parsed = financeLeadSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Validation failed", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const data = parsed.data;

  await prisma.lead.create({
    data: {
      type: data.isFleetEnquiry ? "FLEET" : "FINANCE",
      fullName: data.fullName,
      phone: data.phone,
      email: data.email,
      message: data.message,
      source: data.isFleetEnquiry ? "fleet-page" : "finance-page",
    },
  });

  await notifyLead({ type: data.isFleetEnquiry ? "fleet enquiry" : "finance enquiry", fullName: data.fullName, phone: data.phone, email: data.email, message: data.message });
  revalidatePath("/admin/leads");
  return { success: true, data: undefined };
}

// --- Admin mutations ---

export async function updateLead(raw: unknown): Promise<ActionResult> {
  const user = await requireApiAccess("leads", "update");
  const parsed = updateLeadSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: "Validation failed" };

  const existing = await prisma.lead.findUnique({ where: { id: parsed.data.id } });
  if (!existing) {
    return { success: false, error: "This lead no longer exists — it may have been deleted. Refresh the page." };
  }

  await prisma.lead.update({
    where: { id: parsed.data.id },
    data: { status: parsed.data.status, assigneeId: parsed.data.assigneeId },
  });
  await writeAuditLog({ actorId: user.id, action: "UPDATE", entity: "Lead", entityId: parsed.data.id, changes: parsed.data });
  revalidatePath("/admin/leads");
  return { success: true, data: undefined };
}

export async function addLeadNote(raw: unknown): Promise<ActionResult> {
  const user = await requireApiAccess("leads", "update");
  const parsed = addLeadNoteSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: "Validation failed" };

  await prisma.leadNote.create({
    data: { leadId: parsed.data.leadId, authorId: user.id, body: parsed.data.body },
  });
  revalidatePath(`/admin/leads/${parsed.data.leadId}`);
  return { success: true, data: undefined };
}

export async function deleteLead(id: string): Promise<ActionResult> {
  const user = await requireApiAccess("leads", "delete");
  await prisma.lead.delete({ where: { id } });
  await writeAuditLog({ actorId: user.id, action: "DELETE", entity: "Lead", entityId: id });
  revalidatePath("/admin/leads");
  return { success: true, data: undefined };
}
