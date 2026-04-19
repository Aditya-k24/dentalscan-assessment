"use client";

import React, { useEffect, useRef, useState } from "react";
import StepIllustration from "@/components/scanning/StepIllustration";

const STEP_META = [
  {
    label: "Front View",
    headline: "Show your front teeth",
    detail: "Face the camera straight on. Bite gently and keep both upper and lower teeth inside the oval guide.",
  },
  {
    label: "Left Side",
    headline: "Show your left molars",
    detail: "Turn your head slightly left. Use a finger to pull your left cheek back so back teeth are visible.",
  },
  {
    label: "Right Side",
    headline: "Show your right molars",
    detail: "Turn your head slightly right. Pull your right cheek back so back teeth are visible inside the oval.",
  },
  {
    label: "Upper Arch",
    headline: "Show your upper teeth",
    detail: "Open wide and curl your upper lip up to expose the full arch. Tilt the phone slightly downward.",
  },
  {
    label: "Lower Arch",
    headline: "Show your lower teeth",
    detail: "Open wide and pull your lower lip down to expose the full arch. Tilt the phone slightly upward.",
  },
];

const AUTO_DISMISS_MS = 2000;

interface StepPreviewProps {
  step: number;
  onDismiss: () => void;
}

export default function StepPreview({ step, onDismiss }: StepPreviewProps) {
  const [progress, setProgress] = useState(0);
  const meta = STEP_META[step] ?? STEP_META[0];

  // Keep a stable ref so the RAF closure always calls the latest onDismiss
  // without being listed as a dep (which would restart the timer every re-render)
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  // Track the LATEST scheduled RAF id so cleanup actually cancels it
  const rafIdRef = useRef(0);

  useEffect(() => {
    setProgress(0);
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const pct = Math.min(elapsed / AUTO_DISMISS_MS, 1);
      setProgress(pct);
      if (pct < 1) {
        rafIdRef.current = requestAnimationFrame(tick);
      } else {
        onDismissRef.current();
      }
    }

    rafIdRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafIdRef.current);
  }, [step]); // only restart when the step changes, not on every parent re-render

  return (
    <div
      className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#030b18]/96 backdrop-blur-sm animate-fade-in"
      onClick={onDismiss}
      role="dialog"
      aria-label={`Step ${step + 1} of 5: ${meta.label}`}
    >
      {/* Step pill */}
      <div className="flex items-center gap-2 mb-5">
        <span className="w-6 h-6 rounded-full bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-[11px] font-bold text-brand-400">
          {step + 1}
        </span>
        <span className="text-xs font-semibold text-brand-400 uppercase tracking-widest">{meta.label}</span>
      </div>

      {/* Illustration */}
      <div className="w-44 h-52 flex items-center justify-center">
        <StepIllustration step={step} className="w-full h-full" />
      </div>

      {/* Text */}
      <div className="mt-5 px-8 text-center flex flex-col gap-2">
        <h3 className="text-lg font-bold text-white">{meta.headline}</h3>
        <p className="text-sm text-slate-400 leading-relaxed">{meta.detail}</p>
      </div>

      {/* Tap-to-skip hint */}
      <p className="mt-5 text-xs text-slate-600">Tap anywhere to continue</p>

      {/* Auto-dismiss progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-800">
        <div
          className="h-full bg-gradient-to-r from-brand-500 to-sky-400 transition-none"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
}
