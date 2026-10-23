import { DefinitionList } from "@/components/definition-list";
import type { LatestInput } from "@/features/input-lab/lib/lab-state";
import { fmt } from "@/lib/format";

/** 最新のイベントの値 */
export function LatestTable({ latest }: { latest: LatestInput | null }) {
  const rows: [string, string][] = latest
    ? [
        ["pointerType", latest.pointerType],
        ["buttons", String(latest.buttons)],
        ["pressure", fmt(latest.pressure, 3)],
        ["tiltX / tiltY", `${fmt(latest.tiltX, 0)} / ${fmt(latest.tiltY, 0)}`],
        [
          "altitudeAngle / azimuthAngle",
          `${fmt(latest.altitudeAngle, 3)} / ${fmt(latest.azimuthAngle, 3)}`,
        ],
      ]
    : [];
  return (
    <section className="space-y-2">
      <h2 className="font-semibold">最新のイベント</h2>
      {rows.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          キャンバスに触れると表示される
        </p>
      ) : (
        <DefinitionList rows={rows} />
      )}
    </section>
  );
}
