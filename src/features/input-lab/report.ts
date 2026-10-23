import { displayMode } from "./display-mode";
import type { LabState } from "./lab-state";
import type { CanvasInfo } from "./pointer-canvas";
import {
  intervals,
  type KindSummary,
  summarize,
  summarizeKind,
} from "./pointer-stats";

/** 実行時に、使える API を検出する */
export function detectFeatures() {
  const proto = PointerEvent.prototype;
  return {
    getCoalescedEvents: typeof proto.getCoalescedEvents === "function",
    getPredictedEvents: typeof proto.getPredictedEvents === "function",
    altitudeAngle: "altitudeAngle" in proto,
    azimuthAngle: "azimuthAngle" in proto,
  };
}

export type Features = ReturnType<typeof detectFeatures>;

/** 結果をコピーするときの JSON（docs に反映する材料） */
export function buildReport(
  lab: LabState,
  info: CanvasInfo | null,
): Record<string, unknown> {
  const kinds: Record<string, KindSummary> = {};
  for (const [kind, log] of lab.kinds) kinds[kind] = summarizeKind(log);
  return {
    measuredAt: new Date().toISOString(),
    userAgent: navigator.userAgent,
    devicePixelRatio: window.devicePixelRatio,
    secureContext: window.isSecureContext,
    displayMode: displayMode(),
    desynchronized: info,
    features: detectFeatures(),
    frameIntervalMs: summarize(intervals(lab.frameTimes)),
    kinds,
    latest: lab.latest,
  };
}
