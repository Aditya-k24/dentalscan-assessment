"use client";

import React from "react";
import type { QualityTier } from "@/lib/utils/quality";

interface TierStyle {
  bg: string;
  border: string;
  text: string;
  dot: string;
  label: string;
}

const TIER_STYLE: Record<QualityTier, TierStyle> = {
  poor: {
    bg: "bg-red-950/60",
    border: "border-red-500/40",
    text: "text-red-300",
    dot: "bg-red-400",
    label: "Adjust Position",
  },
  fair: {
    bg: "bg-amber-950/60",
    border: "border-amber-500/40",
    text: "text-amber-300",
    dot: "bg-amber-400",
    label: "Almost Ready",
  },
  good: {
    bg: "bg-cyan-950/60",
    border: "border-brand-500/60",
    text: "text-brand-300",
    dot: "bg-brand-400",
    label: "Hold Steady",
  },
};

interface QualityBadgeProps {
  tier: QualityTier;
}

export default function QualityBadge({ tier }: QualityBadgeProps) {
  const s = TIER_STYLE[tier];

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={`Camera quality: ${s.label}`}
      className={`
        inline-flex items-center gap-2 px-3 py-1.5 rounded-full border
        backdrop-blur-md text-xs font-medium tracking-wide
        transition-all duration-500
        ${s.bg} ${s.border} ${s.text}
      `}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${s.dot} ${
          tier !== "good" ? "animate-pulse" : ""
        }`}
      />
      {s.label}
    </div>
  );
}
