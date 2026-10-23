import { describe, expect, test } from "bun:test";
import {
  createKindLog,
  intervals,
  rateHz,
  summarize,
  summarizeKind,
} from "./pointer-stats";

describe("summarize", () => {
  test("空配列は 0 を返す", () => {
    expect(summarize([])).toEqual({ count: 0, mean: 0, p95: 0, max: 0 });
  });

  test("平均・p95・最大を出す", () => {
    const values = Array.from({ length: 100 }, (_, i) => i + 1);
    expect(summarize(values)).toEqual({
      count: 100,
      mean: 50.5,
      p95: 95,
      max: 100,
    });
  });

  test("要素が 1 つなら、その値になる", () => {
    expect(summarize([7])).toEqual({ count: 1, mean: 7, p95: 7, max: 7 });
  });
});

describe("intervals", () => {
  test("隣り合う時刻の差を返す", () => {
    expect(intervals([0, 5, 10, 20])).toEqual([5, 5, 10]);
  });

  test("同時刻と、間隔が広すぎる区間（ペンの上げ下げ）は除く", () => {
    expect(intervals([0, 0, 5, 500, 505])).toEqual([5, 5]);
  });
});

describe("rateHz", () => {
  test("5ms 間隔なら 200Hz", () => {
    expect(rateHz([0, 5, 10, 15, 20])).toBeCloseTo(200);
  });

  test("間隔が取れなければ null", () => {
    expect(rateHz([])).toBeNull();
    expect(rateHz([10])).toBeNull();
    expect(rateHz([0, 500])).toBeNull();
  });
});

describe("summarizeKind", () => {
  test("イベントの頻度と、coalesced を含めた頻度を分けて出す", () => {
    const log = createKindLog();
    // 16ms ごとにイベントが届き、1 回に 3 サンプルが含まれる
    log.eventTimes.push(0, 16, 32, 48);
    log.sampleTimes.push(0, 4, 8, 12, 16, 20, 24, 28, 32);
    log.coalescedCounts.push(3, 3, 3, 3);
    log.latencies.push(8, 10, 12, 30);
    log.hoverMoves = 5;
    log.hoverMovesWithTilt = 0;

    const s = summarizeKind(log);
    expect(s.eventHz).toBeCloseTo(62.5);
    expect(s.sampleHz).toBeCloseTo(250);
    expect(s.coalesced).toEqual({ count: 4, mean: 3, p95: 3, max: 3 });
    expect(s.predicted.count).toBe(0);
    expect(s.latency.max).toBe(30);
    expect(s.hoverMoves).toBe(5);
    expect(s.hoverMovesWithTilt).toBe(0);
  });
});
