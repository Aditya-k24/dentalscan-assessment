import { describe, it, expect } from "vitest";
import { scanCompletedSchema } from "@/lib/validations/notify";
import { createMessageSchema } from "@/lib/validations/messaging";

describe("scanCompletedSchema", () => {
  it("accepts a valid completed request", () => {
    const result = scanCompletedSchema.safeParse({
      scanId: "abc123",
      status: "completed",
      userId: "user-1",
    });
    expect(result.success).toBe(true);
  });

  it("rejects non-completed status", () => {
    const result = scanCompletedSchema.safeParse({
      scanId: "abc123",
      status: "pending",
      userId: "user-1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing scanId", () => {
    const result = scanCompletedSchema.safeParse({
      status: "completed",
      userId: "user-1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing userId", () => {
    const result = scanCompletedSchema.safeParse({
      scanId: "abc123",
      status: "completed",
    });
    expect(result.success).toBe(false);
  });
});

describe("createMessageSchema", () => {
  it("accepts valid message", () => {
    const result = createMessageSchema.safeParse({
      scanId: "scan-1",
      patientId: "patient-1",
      clinicId: "clinic-1",
      sender: "patient",
      content: "Hello doctor!",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty content", () => {
    const result = createMessageSchema.safeParse({
      scanId: "scan-1",
      patientId: "patient-1",
      clinicId: "clinic-1",
      sender: "patient",
      content: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const contentIssue = result.error.issues.find((i) => i.path.includes("content"));
      expect(contentIssue).toBeDefined();
    }
  });

  it("rejects invalid sender", () => {
    const result = createMessageSchema.safeParse({
      scanId: "scan-1",
      patientId: "patient-1",
      clinicId: "clinic-1",
      sender: "admin",
      content: "Hello",
    });
    expect(result.success).toBe(false);
  });

  it("rejects content over 1000 chars", () => {
    const result = createMessageSchema.safeParse({
      scanId: "scan-1",
      patientId: "patient-1",
      clinicId: "clinic-1",
      sender: "patient",
      content: "a".repeat(1001),
    });
    expect(result.success).toBe(false);
  });
});
