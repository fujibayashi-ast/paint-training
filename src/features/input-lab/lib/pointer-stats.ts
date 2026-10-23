// 入力検証ページの集計。DOM に依存しない純粋関数だけを置く。

/** ペンの上げ下げなど、連続していない区間を除くための間隔の上限（ms） */
const MAX_GAP_MS = 100;

export interface Summary {
  count: number;
  mean: number;
  p95: number;
  max: number;
}

/** 1 種類の入力（pointerType）ごとのログ */
export interface KindLog {
  /** pointermove イベントの timeStamp */
  eventTimes: number[];
  /** coalesced を含めたサンプルの timeStamp */
  sampleTimes: number[];
  coalescedCounts: number[];
  predictedCounts: number[];
  /** イベントの timeStamp から、描いた rAF の時刻までの差（ms） */
  latencies: number[];
  /** 接触していない pointermove の数（ペンのホバー） */
  hoverMoves: number;
  /** ホバー中に tilt が 0 以外だった数 */
  hoverMovesWithTilt: number;
}

export interface KindSummary {
  eventHz: number | null;
  sampleHz: number | null;
  coalesced: Summary;
  predicted: Summary;
  latency: Summary;
  hoverMoves: number;
  hoverMovesWithTilt: number;
}

export function createKindLog(): KindLog {
  return {
    eventTimes: [],
    sampleTimes: [],
    coalescedCounts: [],
    predictedCounts: [],
    latencies: [],
    hoverMoves: 0,
    hoverMovesWithTilt: 0,
  };
}

export function summarize(values: number[]): Summary {
  if (values.length === 0) {
    return { count: 0, mean: 0, p95: 0, max: 0 };
  }
  const sorted = [...values].sort((a, b) => a - b);
  const sum = sorted.reduce((acc, v) => acc + v, 0);
  // nearest-rank 法
  const rank = Math.ceil(sorted.length * 0.95) - 1;
  return {
    count: sorted.length,
    mean: sum / sorted.length,
    p95: sorted[rank] ?? 0,
    max: sorted[sorted.length - 1] ?? 0,
  };
}

/** 隣り合う時刻の差。0 以下と、間隔が広すぎる区間は除く */
export function intervals(times: number[], maxGap = MAX_GAP_MS): number[] {
  const result: number[] = [];
  for (let i = 1; i < times.length; i++) {
    const diff = (times[i] ?? 0) - (times[i - 1] ?? 0);
    if (diff > 0 && diff <= maxGap) {
      result.push(diff);
    }
  }
  return result;
}

/** 時刻の列から頻度（Hz）を出す。間隔が取れなければ null */
export function rateHz(times: number[], maxGap = MAX_GAP_MS): number | null {
  const { count, mean } = summarize(intervals(times, maxGap));
  return count === 0 ? null : 1000 / mean;
}

export function summarizeKind(log: KindLog): KindSummary {
  return {
    eventHz: rateHz(log.eventTimes),
    sampleHz: rateHz(log.sampleTimes),
    coalesced: summarize(log.coalescedCounts),
    predicted: summarize(log.predictedCounts),
    latency: summarize(log.latencies),
    hoverMoves: log.hoverMoves,
    hoverMovesWithTilt: log.hoverMovesWithTilt,
  };
}
