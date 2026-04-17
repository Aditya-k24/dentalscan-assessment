"use client";

import React from "react";
import type { QualityTier } from "@/lib/utils/quality";

const TIER_COLOR: Record<QualityTier, string> = {
  poor: "#ef4444",
  fair: "#f59e0b",
  good: "#06b6d4",
};

const TIER_GLOW: Record<QualityTier, string> = {
  poor: "rgba(239,68,68,0.25)",
  fair: "rgba(245,158,11,0.25)",
  good: "rgba(6,182,212,0.35)",
};

interface GuidanceOverlayProps {
  tier: QualityTier;
}

export default function GuidanceOverlay({ tier }: GuidanceOverlayProps) {
  const color = TIER_COLOR[tier];
  const glow = TIER_GLOW[tier];

  return (
    <div
      className="absolute inset-0 pointer-events-none flex items-center justify-center"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 200 260"
        className="w-[78%] h-[88%]"
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: `drop-shadow(0 0 12px ${glow})`, transition: "filter 0.5s ease" }}
      >
        {/* Outer face oval */}
        <ellipse
          cx="100"
          cy="122"
          rx="82"
          ry="108"
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeDasharray={tier === "poor" ? "8 5" : "none"}
          style={{ transition: "stroke 0.4s ease, stroke-dasharray 0.5s ease" }}
        />

        {/* Pulsing outer ring — only when good */}
        {tier === "good" && (
          <ellipse
            cx="100"
            cy="122"
            rx="82"
            ry="108"
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            opacity="0.4"
            style={{ animation: "ring-pulse 2s ease-in-out infinite" }}
          />
        )}

        {/* Corner alignment ticks */}
        {[
          [100, 12, 100, 24],
          [100, 220, 100, 232],
          [16, 122, 28, 122],
          [172, 122, 184, 122],
        ].map(([x1, y1, x2, y2], i) => (
          <line
            key={i}
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.7"
            style={{ transition: "stroke 0.4s ease" }}
          />
        ))}

        {/* Mouth region guide */}
        <ellipse
          cx="100"
          cy="162"
          rx="36"
          ry="14"
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          opacity={tier === "poor" ? 0.25 : 0.5}
          strokeDasharray="4 3"
          style={{ transition: "stroke 0.4s ease, opacity 0.4s ease" }}
        />

        {/* Center crosshair dot */}
        <circle
          cx="100"
          cy="162"
          r="2"
          fill={color}
          opacity={tier === "poor" ? 0.2 : 0.5}
          style={{ transition: "fill 0.4s ease, opacity 0.4s ease" }}
        />
      </svg>

      <style>{`
        @keyframes ring-pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); transform-origin: center; transform-box: fill-box; }
          50% { opacity: 0.05; transform: scale(1.06); transform-origin: center; transform-box: fill-box; }
        }
      `}</style>
    </div>
  );
}
