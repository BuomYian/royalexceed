import { describe, expect, it } from "vitest";
import { can, assertPermission, ForbiddenError } from "@/lib/rbac";

describe("rbac", () => {
  it("grants SUPER_ADMIN every permission, including user management", () => {
    expect(can("SUPER_ADMIN", "users", "delete")).toBe(true);
    expect(can("SUPER_ADMIN", "models", "delete")).toBe(true);
  });

  it("denies ADMIN user management", () => {
    expect(can("ADMIN", "users", "read")).toBe(false);
    expect(can("ADMIN", "models", "delete")).toBe(true);
  });

  it("restricts SALES to read-only on models and no delete on inventory", () => {
    expect(can("SALES", "models", "read")).toBe(true);
    expect(can("SALES", "models", "delete")).toBe(false);
    expect(can("SALES", "models", "update")).toBe(false);
    expect(can("SALES", "inventory", "update")).toBe(true);
    expect(can("SALES", "inventory", "delete")).toBe(false);
    expect(can("SALES", "leads", "delete")).toBe(true);
  });

  it("restricts SERVICE to service bookings only", () => {
    expect(can("SERVICE", "serviceBookings", "update")).toBe(true);
    expect(can("SERVICE", "leads", "read")).toBe(false);
    expect(can("SERVICE", "models", "read")).toBe(false);
  });

  it("restricts EDITOR to news, testimonials, and media", () => {
    expect(can("EDITOR", "news", "update")).toBe(true);
    expect(can("EDITOR", "testimonials", "update")).toBe(true);
    expect(can("EDITOR", "media", "create")).toBe(true);
    expect(can("EDITOR", "inventory", "read")).toBe(false);
    expect(can("EDITOR", "users", "read")).toBe(false);
  });

  it("assertPermission throws ForbiddenError when denied", () => {
    expect(() => assertPermission("SALES", "models", "delete")).toThrow(ForbiddenError);
    expect(() => assertPermission("SUPER_ADMIN", "models", "delete")).not.toThrow();
  });
});
