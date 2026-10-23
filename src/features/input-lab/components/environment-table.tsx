import { DefinitionList } from "@/components/definition-list";
import type { CanvasInfo } from "@/features/input-lab/lib/lab-state";
import type { Summary } from "@/features/input-lab/lib/pointer-stats";
import type { Features } from "@/features/input-lab/lib/report";
import { fmt } from "@/lib/format";

interface Props {
  features: Features;
  info: CanvasInfo | null;
  /** requestAnimationFrame の間隔（ms） */
  frame: Summary;
}

/** 使える API と、キャンバスの設定 */
export function EnvironmentTable({ features, info, frame }: Props) {
  const rows: [string, string][] = [
    ["getCoalescedEvents", String(features.getCoalescedEvents)],
    ["getPredictedEvents", String(features.getPredictedEvents)],
    ["altitudeAngle", String(features.altitudeAngle)],
    ["azimuthAngle", String(features.azimuthAngle)],
    [
      "desynchronized（指定 / 実際）",
      info
        ? `${info.requestedDesynchronized} / ${String(info.actualDesynchronized ?? "不明")}`
        : "…",
    ],
    [
      "フレーム間隔 ms（平均 / 最大）",
      frame.count === 0 ? "—" : `${fmt(frame.mean)} / ${fmt(frame.max)}`,
    ],
  ];
  return (
    <section className="space-y-2">
      <h2 className="font-semibold">環境</h2>
      <DefinitionList rows={rows} />
    </section>
  );
}
