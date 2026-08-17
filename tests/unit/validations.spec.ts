import { describe, expect, it } from "vitest";
import { testDriveBookingSchema } from "@/lib/validations/test-drive";
import { generalLeadSchema } from "@/lib/validations/lead";
import { phoneSchema } from "@/lib/validations/common";

const validTestDrive = {
  fullName: "Achol Deng",
  phone: "+211920001234",
  email: "achol@example.com",
  consent: true as const,
  honeypot: "",
  modelId: "clx123",
  preferredDate: "2026-09-01",
  timeSlot: "10:00-11:00" as const,
  location: "Showroom - Juba Town" as const,
};

describe("testDriveBookingSchema", () => {
  it("accepts a valid payload", () => {
    const result = testDriveBookingSchema.safeParse(validTestDrive);
    expect(result.success).toBe(true);
  });

  it("rejects a missing full name", () => {
    const result = testDriveBookingSchema.safeParse({ ...validTestDrive, fullName: "" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid phone number", () => {
    const result = testDriveBookingSchema.safeParse({ ...validTestDrive, phone: "abc" });
    expect(result.success).toBe(false);
  });

  it("rejects when consent is not explicitly true", () => {
    const result = testDriveBookingSchema.safeParse({ ...validTestDrive, consent: false });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown time slot", () => {
    const result = testDriveBookingSchema.safeParse({ ...validTestDrive, timeSlot: "03:00-04:00" });
    expect(result.success).toBe(false);
  });

  it("flags a filled honeypot as invalid (would be caught server-side as spam)", () => {
    const result = testDriveBookingSchema.safeParse({ ...validTestDrive, honeypot: "http://spam.example" });
    expect(result.success).toBe(false);
  });
});

describe("generalLeadSchema", () => {
  it("accepts a valid general enquiry", () => {
    const result = generalLeadSchema.safeParse({
      fullName: "James Lual",
      phone: "+211920005678",
      consent: true,
      honeypot: "",
      message: "Interested in the S07 for fleet purchase.",
      department: "sales",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty message", () => {
    const result = generalLeadSchema.safeParse({
      fullName: "James Lual",
      phone: "+211920005678",
      consent: true,
      honeypot: "",
      message: "",
      department: "sales",
    });
    expect(result.success).toBe(false);
  });
});

describe("phoneSchema", () => {
  it("accepts +211 South Sudan numbers", () => {
    expect(phoneSchema.safeParse("+211 92 000 0000").success).toBe(true);
  });

  it("rejects too-short input", () => {
    expect(phoneSchema.safeParse("123").success).toBe(false);
  });
});
