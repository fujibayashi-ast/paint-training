import { useEffect, useRef } from "react";
import {
  type CanvasInfo,
  getKindLog,
  type LabState,
} from "@/features/input-lab/lib/lab-state";

interface Props {
  lab: LabState;
  desynchronized: boolean;
  onReady: (info: CanvasInfo) => void;
}

interface PendingMove {
  kind: string;
  /** イベントの timeStamp */
  time: number;
  /** 接触中の線分（直前の点から今の点へ） */
  segments: { x0: number; y0: number; x1: number; y1: number; w: number }[];
}

type Point = { x: number; y: number };

/** 筆圧が取れない入力（指・マウス）は中間の太さで描く */
function lineWidth(pressure: number): number {
  return 1 + (pressure > 0 ? pressure : 0.5) * 7;
}

/**
 * 入力を取り、描き、計測するキャンバス。
 * 下のキャンバスに線を描き、上のキャンバスに予測点とホバーの位置を毎フレーム描き直す。
 * desynchronized はコンテキストの作成時にしか指定できないため、切り替えは親が key で作り直す。
 */
export function PointerCanvas({ lab, desynchronized, onReady }: Props) {
  const drawRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const draw = drawRef.current;
    const overlay = overlayRef.current;
    if (!draw || !overlay) return;
    const ctx = draw.getContext("2d", { desynchronized });
    const overlayCtx = overlay.getContext("2d");
    if (!ctx || !overlayCtx) return;

    onReady({
      requestedDesynchronized: desynchronized,
      actualDesynchronized: ctx.getContextAttributes().desynchronized,
    });

    let cssWidth = 0;
    let cssHeight = 0;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = draw.getBoundingClientRect();
      cssWidth = rect.width;
      cssHeight = rect.height;
      for (const [canvas, c] of [
        [draw, ctx],
        [overlay, overlayCtx],
      ] as const) {
        canvas.width = Math.round(rect.width * dpr);
        canvas.height = Math.round(rect.height * dpr);
        c.setTransform(dpr, 0, 0, dpr, 0, 0);
        c.lineCap = "round";
        c.lineJoin = "round";
      }
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(draw);

    const lastPoints = new Map<number, Point>();
    let pending: PendingMove[] = [];
    let hover: Point | null = null;

    const toPoint = (e: PointerEvent, rect: DOMRect): Point => ({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });

    const onDown = (e: PointerEvent) => {
      // ペンのドラッグで周囲のテキストが選択されたり、フォーカスが外れたりするのを防ぐ
      e.preventDefault();
      draw.setPointerCapture(e.pointerId);
      lastPoints.set(e.pointerId, toPoint(e, draw.getBoundingClientRect()));
    };

    const onMove = (e: PointerEvent) => {
      const rect = draw.getBoundingClientRect();
      const log = getKindLog(lab, e.pointerType);
      const hasCoalesced = typeof e.getCoalescedEvents === "function";
      const hasPredicted = typeof e.getPredictedEvents === "function";
      const coalesced = hasCoalesced ? e.getCoalescedEvents() : [];
      const predicted = hasPredicted ? e.getPredictedEvents() : [];
      // coalesced が空でも、イベント自体を 1 サンプルとして数える
      const samples = coalesced.length > 0 ? coalesced : [e];

      log.eventTimes.push(e.timeStamp);
      for (const s of samples) log.sampleTimes.push(s.timeStamp);
      if (hasCoalesced) log.coalescedCounts.push(coalesced.length);
      if (hasPredicted) log.predictedCounts.push(predicted.length);

      const touching = e.buttons !== 0;
      if (!touching) {
        log.hoverMoves++;
        if (e.tiltX !== 0 || e.tiltY !== 0) log.hoverMovesWithTilt++;
      }

      lab.latest = {
        pointerType: e.pointerType,
        buttons: e.buttons,
        pressure: e.pressure,
        tiltX: e.tiltX,
        tiltY: e.tiltY,
        altitudeAngle: e.altitudeAngle,
        azimuthAngle: e.azimuthAngle,
      };
      lab.predicted = touching ? predicted.map((p) => toPoint(p, rect)) : [];
      hover = touching ? null : toPoint(e, rect);

      const move: PendingMove = {
        kind: e.pointerType,
        time: e.timeStamp,
        segments: [],
      };
      if (touching) {
        let prev = lastPoints.get(e.pointerId);
        for (const s of samples) {
          const p = toPoint(s, rect);
          if (prev) {
            move.segments.push({
              x0: prev.x,
              y0: prev.y,
              x1: p.x,
              y1: p.y,
              w: lineWidth(s.pressure),
            });
          }
          prev = p;
        }
        if (prev) lastPoints.set(e.pointerId, prev);
      }
      pending.push(move);
    };

    const onEnd = (e: PointerEvent) => {
      lastPoints.delete(e.pointerId);
      lab.predicted = [];
    };

    const onLeave = () => {
      hover = null;
    };

    const preventMenu = (e: Event) => e.preventDefault();

    draw.addEventListener("pointerdown", onDown);
    draw.addEventListener("pointermove", onMove);
    draw.addEventListener("pointerup", onEnd);
    draw.addEventListener("pointercancel", onEnd);
    draw.addEventListener("pointerleave", onLeave);
    draw.addEventListener("contextmenu", preventMenu);

    let frame = 0;
    const tick = (now: number) => {
      lab.frameTimes.push(now);

      const moves = pending;
      pending = [];
      ctx.strokeStyle = "#18181b";
      for (const move of moves) {
        for (const s of move.segments) {
          ctx.lineWidth = s.w;
          ctx.beginPath();
          ctx.moveTo(s.x0, s.y0);
          ctx.lineTo(s.x1, s.y1);
          ctx.stroke();
        }
        // イベントが届いてから、この描画までの時間（画面に出るまでは含まない）
        getKindLog(lab, move.kind).latencies.push(
          performance.now() - move.time,
        );
      }

      overlayCtx.clearRect(0, 0, cssWidth, cssHeight);
      overlayCtx.fillStyle = "#f97316";
      for (const p of lab.predicted) {
        overlayCtx.beginPath();
        overlayCtx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
        overlayCtx.fill();
      }
      if (hover) {
        overlayCtx.strokeStyle = "#2563eb";
        overlayCtx.lineWidth = 1.5;
        overlayCtx.beginPath();
        overlayCtx.arc(hover.x, hover.y, 10, 0, Math.PI * 2);
        overlayCtx.stroke();
      }

      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      draw.removeEventListener("pointerdown", onDown);
      draw.removeEventListener("pointermove", onMove);
      draw.removeEventListener("pointerup", onEnd);
      draw.removeEventListener("pointercancel", onEnd);
      draw.removeEventListener("pointerleave", onLeave);
      draw.removeEventListener("contextmenu", preventMenu);
    };
  }, [lab, desynchronized, onReady]);

  const base =
    "absolute inset-0 size-full touch-none select-none [-webkit-touch-callout:none]";
  return (
    <div className="relative h-[50svh] min-h-64 overflow-hidden rounded-md border bg-white">
      <canvas ref={drawRef} className={base} />
      <canvas ref={overlayRef} className={`${base} pointer-events-none`} />
    </div>
  );
}
