import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export type AuditAction = "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "STATUS_CHANGE";

/** Writes an AuditLog row for every mutation (spec §9/§7 module 12). Best-effort — never blocks the mutation it's logging. */
export async function writeAuditLog(params: {
  actorId: string | null;
  action: AuditAction;
  entity: string;
  entityId?: string | null;
  changes?: Prisma.InputJsonValue;
}) {
  try {
    const hdrs = await headers();
    const ipAddress =
      hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      hdrs.get("x-real-ip") ??
      null;

    await prisma.auditLog.create({
      data: {
        actorId: params.actorId,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId ?? null,
        changes: params.changes ?? undefined,
        ipAddress,
      },
    });
  } catch (error) {
    console.error("[audit] failed to write audit log", error);
  }
}
