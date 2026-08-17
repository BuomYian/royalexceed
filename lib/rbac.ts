import type { Role } from "@prisma/client";

export type Resource =
  | "models"
  | "inventory"
  | "leads"
  | "testDrives"
  | "serviceBookings"
  | "news"
  | "testimonials"
  | "media"
  | "settings"
  | "users"
  | "auditLog"
  | "dashboard";

export type Action = "read" | "create" | "update" | "delete";

const ALL: Action[] = ["read", "create", "update", "delete"];
const RW: Action[] = ["read", "create", "update"];
const R: Action[] = ["read"];

/**
 * Server-side permission matrix mirroring the roles table in spec §7. This is
 * consulted by every mutation (server action / route handler), not just used
 * to hide UI — see spec §7 "Enforce roles server-side" and acceptance
 * criterion "A sales user cannot access user management or delete models
 * (verified server-side, not just hidden)".
 */
const PERMISSIONS: Record<Role, Partial<Record<Resource, Action[]>>> = {
  SUPER_ADMIN: {
    dashboard: ALL,
    models: ALL,
    inventory: ALL,
    leads: ALL,
    testDrives: ALL,
    serviceBookings: ALL,
    news: ALL,
    testimonials: ALL,
    media: ALL,
    settings: ALL,
    users: ALL,
    auditLog: R,
  },
  ADMIN: {
    dashboard: ALL,
    models: ALL,
    inventory: ALL,
    leads: ALL,
    testDrives: ALL,
    serviceBookings: ALL,
    news: ALL,
    testimonials: ALL,
    media: ALL,
    settings: ALL,
    auditLog: R,
    // no `users` — user management is SUPER_ADMIN only
  },
  SALES: {
    dashboard: R,
    models: R, // read-only on models
    inventory: RW, // status updates (no delete)
    leads: ALL,
    testDrives: ALL,
  },
  SERVICE: {
    dashboard: R,
    serviceBookings: ALL,
  },
  EDITOR: {
    dashboard: R,
    news: ALL,
    testimonials: ALL,
    media: ALL,
  },
};

export function can(role: Role, resource: Resource, action: Action): boolean {
  return PERMISSIONS[role]?.[resource]?.includes(action) ?? false;
}

export class ForbiddenError extends Error {
  constructor(resource: Resource, action: Action) {
    super(`Role does not have "${action}" permission on "${resource}"`);
    this.name = "ForbiddenError";
  }
}

/** Throws (does not redirect) — for use inside Server Actions / route handlers. */
export function assertPermission(role: Role, resource: Resource, action: Action) {
  if (!can(role, resource, action)) {
    throw new ForbiddenError(resource, action);
  }
}
