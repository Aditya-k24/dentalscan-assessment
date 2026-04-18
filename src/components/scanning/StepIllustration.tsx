"use client";

import React from "react";

/* ─── Shared helpers ────────────────────────────────────────── */

interface TeethProps {
  upperOnly?: boolean;
  lowerOnly?: boolean;
  wide?: boolean;
}

function Teeth({ upperOnly, lowerOnly, wide }: TeethProps) {
  const w = wide ? 40 : 34;
  const x = 68 - w / 2;
  return (
    <>
      {!lowerOnly && (
        <>
          <rect x={x} y="84" width={w} height="9" rx="3" fill="white" />
          <line x1={x + w * 0.28} y1="84" x2={x + w * 0.28} y2="93" stroke="#cbd5e1" strokeWidth="0.7" />
          <line x1={x + w * 0.5}  y1="84" x2={x + w * 0.5}  y2="93" stroke="#cbd5e1" strokeWidth="0.7" />
          <line x1={x + w * 0.72} y1="84" x2={x + w * 0.72} y2="93" stroke="#cbd5e1" strokeWidth="0.7" />
        </>
      )}
      {!upperOnly && (
        <>
          <rect x={x + 2} y="93" width={w - 4} height="8" rx="2.5" fill="#e2e8f0" opacity="0.9" />
          <line x1={x + 2 + (w - 4) * 0.3} y1="93" x2={x + 2 + (w - 4) * 0.3} y2="101" stroke="#cbd5e1" strokeWidth="0.7" />
          <line x1={x + 2 + (w - 4) * 0.5} y1="93" x2={x + 2 + (w - 4) * 0.5} y2="101" stroke="#cbd5e1" strokeWidth="0.7" />
          <line x1={x + 2 + (w - 4) * 0.7} y1="93" x2={x + 2 + (w - 4) * 0.7} y2="101" stroke="#cbd5e1" strokeWidth="0.7" />
        </>
      )}
    </>
  );
}

function GuideOval({ wide, upper }: { wide?: boolean; upper?: boolean }) {
  return (
    <ellipse
      cx="68" cy={upper ? 92 : 94}
      rx={wide ? 26 : 22} ry={upper ? 10 : 13}
      fill="none" stroke="#06b6d4" strokeWidth="1.5"
      strokeDasharray="4 3" opacity="0.8"
    />
  );
}

/* ─── Per-step illustrations ────────────────────────────────── */

function FrontView() {
  return (
    <svg viewBox="0 0 136 160" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <style>{`
        @keyframes mouth-pulse {
          0%,100% { transform: scaleY(1); transform-origin: 68px 84px; transform-box: fill-box; }
          50%      { transform: scaleY(1.12); transform-origin: 68px 84px; transform-box: fill-box; }
        }
        .mouth-anim { animation: mouth-pulse 1.8s ease-in-out infinite; }
      `}</style>
      <ellipse cx="68" cy="74" rx="46" ry="58" fill="#111827" stroke="#06b6d4" strokeWidth="2" />
      <g className="mouth-anim">
        <path d="M47 82 Q68 104 89 82" fill="#050d1a" />
        <path d="M47 82 L89 82" stroke="#475569" strokeWidth="1" />
        <Teeth />
        <GuideOval />
        <path d="M47 82 Q58 79 68 82 Q78 79 89 82" fill="none" stroke="#64748b" strokeWidth="1.5" />
      </g>
      <text x="68" y="152" textAnchor="middle" fill="#64748b" fontSize="9.5" fontFamily="sans-serif">Bite gently — show both rows</text>
    </svg>
  );
}

function LeftSideView() {
  return (
    <svg viewBox="0 0 136 160" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <style>{`
        @keyframes turn-left {
          0%,40%,100% { transform: rotate(0deg); transform-origin: 68px 74px; transform-box: fill-box; }
          20%          { transform: rotate(-14deg); transform-origin: 68px 74px; transform-box: fill-box; }
        }
        .turn-anim { animation: turn-left 2s ease-in-out infinite; }
        @keyframes arrow-left {
          0%,100% { transform: translateX(0); }
          50%      { transform: translateX(-5px); }
        }
      `}</style>
      <g className="turn-anim">
        <ellipse cx="68" cy="74" rx="46" ry="58" fill="#111827" stroke="#06b6d4" strokeWidth="2" />
        <path d="M47 82 Q68 102 89 82" fill="#050d1a" />
        <path d="M47 82 L89 82" stroke="#475569" strokeWidth="1" />
        <rect x="51" y="84" width="34" height="9" rx="3" fill="white" />
        <line x1="61" y1="84" x2="61" y2="93" stroke="#cbd5e1" strokeWidth="0.7" />
        <line x1="68" y1="84" x2="68" y2="93" stroke="#cbd5e1" strokeWidth="0.7" />
        <line x1="75" y1="84" x2="75" y2="93" stroke="#cbd5e1" strokeWidth="0.7" />
        <rect x="53" y="93" width="30" height="8" rx="2.5" fill="#e2e8f0" opacity="0.9" />
        <GuideOval />
        <path d="M47 82 Q58 79 68 82 Q78 79 89 82" fill="none" stroke="#64748b" strokeWidth="1.5" />
      </g>
      <g style={{ animation: "arrow-left 1.4s ease-in-out infinite" }}>
        <path d="M22 124 L10 114 L22 104" fill="none" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="10" y1="114" x2="36" y2="114" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round" />
      </g>
      <text x="68" y="152" textAnchor="middle" fill="#64748b" fontSize="9.5" fontFamily="sans-serif">Turn left · pull left cheek back</text>
    </svg>
  );
}

function RightSideView() {
  return (
    <svg viewBox="0 0 136 160" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <style>{`
        @keyframes turn-right {
          0%,40%,100% { transform: rotate(0deg); transform-origin: 68px 74px; transform-box: fill-box; }
          20%          { transform: rotate(14deg); transform-origin: 68px 74px; transform-box: fill-box; }
        }
        .turn-anim { animation: turn-right 2s ease-in-out infinite; }
        @keyframes arrow-right {
          0%,100% { transform: translateX(0); }
          50%      { transform: translateX(5px); }
        }
      `}</style>
      <g className="turn-anim">
        <ellipse cx="68" cy="74" rx="46" ry="58" fill="#111827" stroke="#06b6d4" strokeWidth="2" />
        <path d="M47 82 Q68 102 89 82" fill="#050d1a" />
        <path d="M47 82 L89 82" stroke="#475569" strokeWidth="1" />
        <rect x="51" y="84" width="34" height="9" rx="3" fill="white" />
        <line x1="61" y1="84" x2="61" y2="93" stroke="#cbd5e1" strokeWidth="0.7" />
        <line x1="68" y1="84" x2="68" y2="93" stroke="#cbd5e1" strokeWidth="0.7" />
        <line x1="75" y1="84" x2="75" y2="93" stroke="#cbd5e1" strokeWidth="0.7" />
        <rect x="53" y="93" width="30" height="8" rx="2.5" fill="#e2e8f0" opacity="0.9" />
        <GuideOval />
        <path d="M47 82 Q58 79 68 82 Q78 79 89 82" fill="none" stroke="#64748b" strokeWidth="1.5" />
      </g>
      <g style={{ animation: "arrow-right 1.4s ease-in-out infinite" }}>
        <path d="M114 124 L126 114 L114 104" fill="none" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="126" y1="114" x2="100" y2="114" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round" />
      </g>
      <text x="68" y="152" textAnchor="middle" fill="#64748b" fontSize="9.5" fontFamily="sans-serif">Turn right · pull right cheek back</text>
    </svg>
  );
}

function UpperTeethView() {
  return (
    <svg viewBox="0 0 136 160" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <style>{`
        @keyframes open-wide-upper {
          0%,40%,100% { transform: scaleY(1); transform-origin: 68px 84px; transform-box: fill-box; }
          20%          { transform: scaleY(1.2); transform-origin: 68px 84px; transform-box: fill-box; }
        }
        .upper-anim { animation: open-wide-upper 1.8s ease-in-out infinite; }
        @keyframes arrow-down {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(4px); }
        }
      `}</style>
      <ellipse cx="68" cy="74" rx="46" ry="58" fill="#111827" stroke="#06b6d4" strokeWidth="2" />
      <g className="upper-anim">
        <path d="M44 82 Q68 112 92 82" fill="#050d1a" />
        <path d="M44 82 L92 82" stroke="#475569" strokeWidth="1" />
        <Teeth upperOnly wide />
        <GuideOval wide upper />
        <path d="M44 82 Q56 77 68 82 Q80 77 92 82" fill="none" stroke="#64748b" strokeWidth="1.5" />
      </g>
      <g style={{ animation: "arrow-down 1.4s ease-in-out infinite" }}>
        <text x="68" y="148" textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="sans-serif">tilt phone ↓</text>
      </g>
      <text x="68" y="158" textAnchor="middle" fill="#64748b" fontSize="9.5" fontFamily="sans-serif">Curl upper lip up · show full arch</text>
    </svg>
  );
}

function LowerTeethView() {
  return (
    <svg viewBox="0 0 136 165" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <style>{`
        @keyframes open-wide-lower {
          0%,40%,100% { transform: scaleY(1); transform-origin: 68px 84px; transform-box: fill-box; }
          20%          { transform: scaleY(1.2); transform-origin: 68px 84px; transform-box: fill-box; }
        }
        .lower-anim { animation: open-wide-lower 1.8s ease-in-out infinite; }
        @keyframes arrow-up {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-4px); }
        }
      `}</style>
      <ellipse cx="68" cy="74" rx="46" ry="58" fill="#111827" stroke="#06b6d4" strokeWidth="2" />
      <g className="lower-anim">
        <path d="M44 82 Q68 112 92 82" fill="#050d1a" />
        <path d="M44 82 L92 82" stroke="#475569" strokeWidth="1" />
        <Teeth lowerOnly wide />
        <GuideOval wide />
        <path d="M44 82 Q56 87 68 82 Q80 87 92 82" fill="none" stroke="#64748b" strokeWidth="1.5" />
      </g>
      <g style={{ animation: "arrow-up 1.4s ease-in-out infinite" }}>
        <text x="68" y="148" textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="sans-serif">tilt phone ↑</text>
      </g>
      <text x="68" y="160" textAnchor="middle" fill="#64748b" fontSize="9.5" fontFamily="sans-serif">Pull lower lip down · show full arch</text>
    </svg>
  );
}

/* ─── Public component ──────────────────────────────────────── */

const ILLUSTRATIONS = [FrontView, LeftSideView, RightSideView, UpperTeethView, LowerTeethView];

interface StepIllustrationProps {
  step: number;
  className?: string;
}

export default function StepIllustration({ step, className = "" }: StepIllustrationProps) {
  const Component = ILLUSTRATIONS[step] ?? FrontView;
  return <div className={className}><Component /></div>;
}
