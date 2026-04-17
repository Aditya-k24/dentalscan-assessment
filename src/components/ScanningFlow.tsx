"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Camera, CheckCircle2, AlertCircle } from "lucide-react";
import GuidanceOverlay from "@/components/scanning/GuidanceOverlay";
import QualityBadge from "@/components/scanning/QualityBadge";
import StepPreview from "@/components/scanning/StepPreview";
import { type QualityTier } from "@/lib/utils/quality";
import { analyseFrame, computeTier, getContextualFeedback } from "@/lib/utils/frameAnalysis";

const VIEWS = [
  {
    label: "Front View",
    instruction: "Face the camera, bite gently together, and show your upper and lower front teeth.",
    tip: "Keep your lips relaxed — teeth should be centered inside the oval.",
  },
  {
    label: "Left Side",
    instruction: "Turn your head slightly left and gently pull your left cheek back with a finger.",
    tip: "Your left molars should be visible — keep teeth inside the oval.",
  },
  {
    label: "Right Side",
    instruction: "Turn your head slightly right and gently pull your right cheek back with a finger.",
    tip: "Your right molars should be visible — keep teeth inside the oval.",
  },
  {
    label: "Upper Teeth",
    instruction: "Open wide, curl your upper lip up, and tilt the phone slightly downward.",
    tip: "Try to show all upper teeth from molar to molar in one shot.",
  },
  {
    label: "Lower Teeth",
    instruction: "Open wide, pull your lower lip down, and tilt the phone slightly upward.",
    tip: "Try to show all lower teeth from molar to molar in one shot.",
  },
] as const;

// Off-screen canvas for frame analysis (small = fast)
const ANALYSIS_W = 160;
const ANALYSIS_H = 120;
const ANALYSIS_INTERVAL_MS = 120; // ~8 fps analysis

export default function ScanningFlow() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const scanIdRef = useRef<string | null>(null);
  const rafRef = useRef<number | null>(null);
  const analysisCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const prevPixelsRef = useRef<Uint8ClampedArray | null>(null);
  const lastAnalysisRef = useRef<number>(0);

  const [camReady, setCamReady] = useState(false);
  const [camError, setCamError] = useState(false);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [qualityTier, setQualityTier] = useState<QualityTier>("poor");
  const [feedback, setFeedback] = useState<{ message: string; tip: string }>({ message: VIEWS[0].instruction, tip: VIEWS[0].tip });
  const [uploading, setUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  // Create scan record
  useEffect(() => {
    fetch("/api/scan", { method: "POST" })
      .then((r) => r.json())
      .then((data: { scanId?: string }) => { if (data.scanId) scanIdRef.current = data.scanId; })
      .catch(() => {});
  }, []);

  // Init camera
  useEffect(() => {
    let stream: MediaStream | null = null;
    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCamReady(true);
        }
      } catch { setCamError(true); }
    }
    startCamera();
    return () => { stream?.getTracks().forEach((t) => t.stop()); };
  }, []);

  // Frame analysis loop — drives quality tier and contextual feedback
  useEffect(() => {
    if (!camReady || currentStep >= 5) return;

    // Reuse one off-screen canvas for the lifetime of the effect
    if (!analysisCanvasRef.current) {
      const c = document.createElement("canvas");
      c.width = ANALYSIS_W;
      c.height = ANALYSIS_H;
      analysisCanvasRef.current = c;
    }

    // Reset previous frame on step change so motion doesn't spike
    prevPixelsRef.current = null;

    const view = VIEWS[currentStep];

    function loop(timestamp: number) {
      rafRef.current = requestAnimationFrame(loop);

      if (timestamp - lastAnalysisRef.current < ANALYSIS_INTERVAL_MS) return;
      lastAnalysisRef.current = timestamp;

      const video = videoRef.current;
      const canvas = analysisCanvasRef.current;
      if (!video || !canvas || video.readyState < 2) return;

      const { analysis, pixels } = analyseFrame(video, canvas, prevPixelsRef.current);
      prevPixelsRef.current = pixels;

      const tier = computeTier(analysis);
      setQualityTier(tier);
      setFeedback(getContextualFeedback(tier, analysis, view.instruction, view.tip));
    }

    rafRef.current = requestAnimationFrame(loop);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [camReady, currentStep]);

  const handleScanComplete = useCallback(async () => {
    setUploading(true);
    const scanId = scanIdRef.current;
    if (!scanId) { setUploading(false); return; }
    try {
      await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scanId, status: "completed", userId: "patient-1",
          title: "Scan Completed",
          message: "A new dental scan is ready for review.",
        }),
      });
    } catch { /* non-fatal */ }
    finally { setUploading(false); }
    router.push(`/results/${scanId}`);
  }, [router]);

  const handleCapture = useCallback(() => {
    const video = videoRef.current;
    if (!video || qualityTier === "poor") return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      setCapturedImages((prev) => [...prev, url]);
      setCurrentStep((prev) => {
        const next = prev + 1;
        if (next < 5) setShowPreview(true);
        if (next === 5) handleScanComplete();
        return next;
      });
    }, "image/jpeg", 0.85);
  }, [qualityTier, handleScanComplete]);

  const isCaptureLocked = qualityTier === "poor";
  const isComplete = currentStep >= 5;
  const isReady = qualityTier === "good";

  return (
    <div className="flex flex-col bg-[#030b18] min-h-screen text-white select-none">

      {/* ── Header ── */}
      <header className="flex items-center justify-between px-5 py-3.5 bg-[#070f1f]/95 border-b border-white/5 backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-brand-gradient flex items-center justify-center shadow-brand-sm">
            <span className="text-white text-[11px] font-bold tracking-tight">DS</span>
          </div>
          <span className="font-semibold text-sm text-slate-100 tracking-tight">DentalScan AI</span>
        </div>
        {!isComplete && (
          <div className="flex items-center gap-1.5" aria-label={`Step ${currentStep + 1} of 5`}>
            {VIEWS.map((_, i) => (
              <div key={i} className={`rounded-full transition-all duration-400 ${
                i < currentStep ? "w-5 h-1.5 bg-brand-500"
                : i === currentStep ? "w-5 h-1.5 bg-white"
                : "w-1.5 h-1.5 bg-slate-700"
              }`} />
            ))}
          </div>
        )}
      </header>

      {/* ── Progress bar ── */}
      <div className="h-px bg-slate-800/60 w-full">
        <div
          className="h-full bg-gradient-to-r from-brand-500 to-sky-400 transition-all duration-500 ease-out"
          style={{ width: `${(currentStep / 5) * 100}%` }}
        />
      </div>

      {/* ── Camera Viewport ── */}
      <div className="relative w-full max-w-md mx-auto aspect-[3/4] bg-black overflow-hidden flex items-center justify-center">

        {isComplete ? (
          <div className="flex flex-col items-center gap-4 p-10 animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-brand-500/15 border border-brand-500/30 flex items-center justify-center">
              <CheckCircle2 size={40} className="text-brand-400" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold text-white">Scan Complete</h2>
              <p className="text-slate-400 text-sm mt-1.5">
                {uploading ? "Uploading your results…" : "Redirecting to your results…"}
              </p>
            </div>
            {uploading && <div className="w-6 h-6 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />}
          </div>

        ) : camError ? (
          <div className="flex flex-col items-center gap-3 p-8 text-center animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-red-950/50 border border-red-500/30 flex items-center justify-center">
              <AlertCircle size={28} className="text-red-400" />
            </div>
            <div>
              <p className="font-semibold text-red-300">Camera access denied</p>
              <p className="text-slate-500 text-sm mt-1">Allow camera access in your browser settings and refresh.</p>
            </div>
          </div>

        ) : (
          <>
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />

            {/* Vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_40%,_rgba(3,11,24,0.55)_100%)] pointer-events-none" />

            <GuidanceOverlay tier={qualityTier} />

            {/* Quality badge */}
            <div className="absolute top-4 left-0 right-0 flex justify-center">
              <QualityBadge tier={qualityTier} />
            </div>

            {/* Step label */}
            <div className="absolute top-14 left-0 right-0 flex justify-center">
              <span className="text-[11px] font-medium text-white/60 tracking-widest uppercase">
                {currentStep + 1}&nbsp;/&nbsp;5 &nbsp;·&nbsp; {VIEWS[currentStep].label}
              </span>
            </div>

            {/* Step preview demo — shown on step start */}
            {showPreview && (
              <StepPreview step={currentStep} onDismiss={() => setShowPreview(false)} />
            )}

            {/* Instruction glass card */}
            <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 pt-12 bg-gradient-to-t from-[#030b18]/95 via-[#030b18]/60 to-transparent">
              <div className={`border backdrop-blur-sm rounded-2xl px-4 py-3.5 flex flex-col gap-1 transition-colors duration-300 ${
                isReady
                  ? "bg-brand-500/10 border-brand-500/30"
                  : "bg-white/5 border-white/10"
              }`}>
                <p className="text-sm font-semibold leading-snug text-white">
                  {feedback.message}
                </p>
                <p className={`text-[12px] leading-snug transition-colors duration-300 ${
                  isReady ? "text-brand-300 font-medium" : "text-slate-400"
                }`}>
                  {feedback.tip}
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Capture button ── */}
      <div className="py-8 flex justify-center items-center min-h-[120px]">
        {!isComplete && !camError && (
          <button
            onClick={handleCapture}
            disabled={isCaptureLocked}
            aria-label={isCaptureLocked ? "Position yourself correctly to capture" : `Capture ${VIEWS[currentStep].label}`}
            className="relative flex items-center justify-center transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 rounded-full"
          >
            {!isCaptureLocked && (
              <span className="absolute w-[88px] h-[88px] rounded-full border-2 border-brand-400/50 animate-ring-pulse" />
            )}
            <span className={`w-[72px] h-[72px] rounded-full border-[3px] flex items-center justify-center transition-all duration-300 ${
              isCaptureLocked
                ? "border-slate-700 bg-slate-800/60 opacity-40"
                : "border-white bg-white shadow-lg active:scale-90"
            }`}>
              <Camera size={26} className={isCaptureLocked ? "text-slate-600" : "text-slate-900"} />
            </span>
          </button>
        )}
      </div>

      {/* ── Thumbnail strip ── */}
      {!isComplete && (
        <div className="flex gap-2 px-4 pb-6 overflow-x-auto w-full max-w-md mx-auto" role="list" aria-label="Captured views">
          {VIEWS.map((v, i) => (
            <div key={i} role="listitem" className="flex flex-col items-center gap-1.5 shrink-0">
              <div className={`w-14 h-[72px] rounded-xl overflow-hidden border transition-all duration-300 ${
                i < currentStep ? "border-brand-500/60 ring-1 ring-brand-500/30"
                : i === currentStep ? "border-white/40 ring-1 ring-white/20"
                : "border-slate-800"
              }`}>
                {capturedImages[i] ? (
                  <img src={capturedImages[i]} alt={v.label} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                    <span className={`text-xs font-semibold ${i === currentStep ? "text-white/60" : "text-slate-700"}`}>
                      {i + 1}
                    </span>
                  </div>
                )}
              </div>
              <span className={`text-[10px] font-medium leading-none transition-colors ${
                i < currentStep ? "text-brand-400"
                : i === currentStep ? "text-white/70"
                : "text-slate-700"
              }`}>
                {v.label.split(" ")[0]}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
