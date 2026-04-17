import { describe, it, expect } from "vitest";
import { nextTier, QUALITY_TIER_CONFIG } from "@/lib/utils/quality";

describe("nextTier", () => {
  it("advances poor to fair", () => {
    expect(nextTier("poor")).toBe("fair");
  });

  it("advances fair to good", () => {
    expect(nextTier("fair")).toBe("good");
  });

  it("stays at good", () => {
    expect(nextTier("good")).toBe("good");
  });
});

describe("QUALITY_TIER_CONFIG", () => {
  it("has config for all tiers", () => {
    expect(QUALITY_TIER_CONFIG.poor).toBeDefined();
    expect(QUALITY_TIER_CONFIG.fair).toBeDefined();
    expect(QUALITY_TIER_CONFIG.good).toBeDefined();
  });

  it("each tier has a label and color", () => {
    for (const tier of ["poor", "fair", "good"] as const) {
      expect(QUALITY_TIER_CONFIG[tier].label).toBeTruthy();
      expect(QUALITY_TIER_CONFIG[tier].color).toMatch(/^#/);
    }
  });
});
