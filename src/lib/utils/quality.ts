export type QualityTier = "poor" | "fair" | "good";

export interface QualityTierConfig {
  color: string;
  label: string;
  ringClass: string;
}

export const QUALITY_TIER_CONFIG: Record<QualityTier, QualityTierConfig> = {
  poor: { color: "#ef4444", label: "Adjust Position", ringClass: "stroke-red-500" },
  fair: { color: "#f59e0b", label: "Almost Ready", ringClass: "stroke-amber-400" },
  good: { color: "#22c55e", label: "Hold Steady", ringClass: "stroke-green-500" },
};

export function nextTier(current: QualityTier): QualityTier {
  if (current === "poor") return "fair";
  if (current === "fair") return "good";
  return "good";
}
