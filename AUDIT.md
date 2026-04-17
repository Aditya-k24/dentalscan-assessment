# DentalScan AI — Technical & UX Audit

## Overview

Hands-on audit of [dentalscan.us](https://www.dentalscan.us) after completing a full 5-angle Discovery Scan (Left, Right, Center, Upper, Lower) via the Live Demo flow on both desktop and mobile.

---

## UX Observations

**Overlay is buried, not the first thing you see.** The visual guidance circle exists inside the camera view, but the onboarding flow doesn't draw attention to it before capture begins. First-time users start clicking without understanding how to use the frame — the overlay should be introduced with a brief "align your teeth here" callout before the camera activates.

**Instructions are easy to miss.** Real-time guidance appears in the top-right corner of the viewport — a peripheral location that patients look at least while trying to frame their teeth. Moving instructions to the bottom center (closer to the mouth and the capture button) would reduce the eye-travel needed to read and act.

**Five captures takes too long.** The pause between shots felt longer than necessary — there is no visible countdown or confirmation animation after each capture, so it's unclear whether the app registered the image or is still processing. A brief shutter flash and thumbnail update after each shot would make the cadence feel faster and more responsive.

**Post-scan experience is strong.** After completing all 5 images the flow correctly navigated to a results report. The AI analysis output is clear and the HIPAA-compliant badge builds trust. Registering for a demo and receiving a link worked seamlessly.

**Mobile felt smooth.** Camera permissions, framing, and capture all worked without friction on mobile — the strongest part of the current experience.

---

## Technical Risks

**No stability gate before capture.** The shutter fires immediately on tap with no motion-blur guard. On mobile, micro-movement during the press produces blurry frames that silently degrade AI analysis quality.

**Image quality is silent.** There is no red/amber/green feedback to tell the patient whether their framing is good before they shoot. A stability heuristic surfaced as a color-coded indicator would reduce re-submissions.

**Top-right instruction placement on mobile.** On smaller screens the top-right corner is often obscured by the front camera notch or status bar, making the real-time guidance invisible on certain devices.

---

*Word count: ~290*
