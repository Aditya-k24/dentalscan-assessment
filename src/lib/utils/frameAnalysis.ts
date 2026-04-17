import type { QualityTier } from "./quality";

export interface FrameAnalysis {
  brightness: number; // 0–255 luminance of center region
  motion: number;     // 0–1 normalised pixel diff from previous frame
}

export interface FrameFeedback {
  message: string;
  tip: string;
}

export function analyseFrame(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  prevData: Uint8ClampedArray | null
): { analysis: FrameAnalysis; pixels: Uint8ClampedArray } {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return { analysis: { brightness: 128, motion: 0 }, pixels: new Uint8ClampedArray() };

  const w = canvas.width;   // 160
  const h = canvas.height;  // 120

  ctx.drawImage(video, 0, 0, w, h);
  const imageData = ctx.getImageData(0, 0, w, h);
  const pixels = imageData.data;

  // Brightness: sample the inner 40% of the frame (where face/teeth sit)
  const x1 = Math.floor(w * 0.3);
  const x2 = Math.floor(w * 0.7);
  const y1 = Math.floor(h * 0.25);
  const y2 = Math.floor(h * 0.75);

  let brightnessSum = 0;
  let brightnessCount = 0;

  for (let y = y1; y < y2; y += 3) {
    for (let x = x1; x < x2; x += 3) {
      const i = (y * w + x) * 4;
      const luma = pixels[i] * 0.299 + pixels[i + 1] * 0.587 + pixels[i + 2] * 0.114;
      brightnessSum += luma;
      brightnessCount++;
    }
  }

  const brightness = brightnessCount > 0 ? brightnessSum / brightnessCount : 128;

  // Motion: average absolute pixel diff across full frame
  let motionSum = 0;
  let motionCount = 0;

  if (prevData && prevData.length === pixels.length) {
    for (let i = 0; i < pixels.length; i += 16) {
      const diff =
        Math.abs(pixels[i] - prevData[i]) +
        Math.abs(pixels[i + 1] - prevData[i + 1]) +
        Math.abs(pixels[i + 2] - prevData[i + 2]);
      motionSum += diff;
      motionCount++;
    }
  }

  const motion =
    motionCount > 0 ? Math.min(1, motionSum / (motionCount * 765)) : 1;

  return { analysis: { brightness, motion }, pixels: new Uint8ClampedArray(pixels) };
}

export function computeTier(a: FrameAnalysis): QualityTier {
  if (a.brightness < 45 || a.brightness > 225 || a.motion > 0.18) return "poor";
  if (a.motion > 0.06 || a.brightness < 72) return "fair";
  return "good";
}

export function getContextualFeedback(
  tier: QualityTier,
  analysis: FrameAnalysis,
  stepInstruction: string,
  stepTip: string
): FrameFeedback {
  if (analysis.brightness < 45) {
    return {
      message: "Too dark — move to a brighter area",
      tip: "Natural light or indoor overhead lighting works best",
    };
  }
  if (analysis.brightness > 225) {
    return {
      message: "Too bright — avoid direct light",
      tip: "Try facing away from a window or bright lamp",
    };
  }
  if (analysis.motion > 0.18) {
    return {
      message: "Hold the phone steady",
      tip: "Rest your elbow on a surface to stabilise",
    };
  }
  if (analysis.motion > 0.06) {
    return {
      message: "Almost steady — keep holding still",
      tip: stepTip,
    };
  }
  if (tier === "good") {
    return {
      message: stepInstruction,
      tip: "✓ Ready — tap the button to capture",
    };
  }
  return { message: stepInstruction, tip: stepTip };
}
