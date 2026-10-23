import type { KindSummary } from "@/features/input-lab/lib/pointer-stats";
import { fmt } from "@/lib/format";

const ROWS: [string, (s: KindSummary) => string][] = [
  ["イベントの頻度（Hz）", (s) => fmt(s.eventHz)],
  ["サンプルの頻度（Hz）", (s) => fmt(s.sampleHz)],
  [
    "coalesced の数（平均 / 最大）",
    (s) =>
      s.coalesced.count === 0
        ? "—"
        : `${fmt(s.coalesced.mean)} / ${s.coalesced.max}`,
  ],
  [
    "predicted の数（平均 / 最大）",
    (s) =>
      s.predicted.count === 0
        ? "—"
        : `${fmt(s.predicted.mean)} / ${s.predicted.max}`,
  ],
  [
    "遅延の下限の目安 ms（平均 / p95）",
    (s) =>
      s.latency.count === 0
        ? "—"
        : `${fmt(s.latency.mean)} / ${fmt(s.latency.p95)}`,
  ],
  ["ホバーの pointermove 数", (s) => String(s.hoverMoves)],
  ["うち tilt が 0 以外", (s) => String(s.hoverMovesWithTilt)],
];

/** 入力の種類（pointerType）ごとの集計表 */
export function KindTable({
  summaries,
}: {
  summaries: [string, KindSummary][];
}) {
  if (summaries.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        まだ入力がありません。キャンバスを指・Apple Pencil でなぞる
      </p>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b">
            <th className="py-1 pr-4 font-medium">pointerType</th>
            {summaries.map(([kind]) => (
              <th key={kind} className="py-1 pr-4 font-mono font-medium">
                {kind}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map(([label, value]) => (
            <tr key={label} className="border-b last:border-0">
              <td className="py-1 pr-4 text-muted-foreground">{label}</td>
              {summaries.map(([kind, s]) => (
                <td key={kind} className="py-1 pr-4 font-mono">
                  {value(s)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
