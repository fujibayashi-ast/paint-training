import { DefinitionList } from "./definition-list";
import { fmt } from "./format";
import type { CanvasInfo } from "./pointer-canvas";
import type { Summary } from "./pointer-stats";
import type { Features } from "./report";

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
