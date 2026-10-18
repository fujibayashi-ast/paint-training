import { useEffect, useReducer, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  createLabState,
  type LabState,
  type LatestInput,
  resetLabState,
} from "./lab-state";
import { type CanvasInfo, PointerCanvas } from "./pointer-canvas";
import {
  intervals,
  type KindSummary,
  summarize,
  summarizeKind,
} from "./pointer-stats";
import { displayMode, PwaChecks } from "./pwa-checks";

/** 画面に反映する間隔（ms）。イベントごとに再描画しない */
const REFRESH_MS = 500;

function detectFeatures() {
  const proto = PointerEvent.prototype;
  return {
    getCoalescedEvents: typeof proto.getCoalescedEvents === "function",
    getPredictedEvents: typeof proto.getPredictedEvents === "function",
    altitudeAngle: "altitudeAngle" in proto,
    azimuthAngle: "azimuthAngle" in proto,
  };
}

function fmt(value: number | null | undefined, digits = 1): string {
  return value == null ? "—" : value.toFixed(digits);
}

function buildReport(
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

function LatestTable({ latest }: { latest: LatestInput | null }) {
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
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="contents">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="font-mono">{value}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}

function KindTable({ summaries }: { summaries: [string, KindSummary][] }) {
  const rows: [string, (s: KindSummary) => string][] = [
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
          {rows.map(([label, value]) => (
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

/** 入力・遅延・PWA を実機で測る使い捨てのページ（開発専用） */
export function InputLabPage() {
  const [lab] = useState(createLabState);
  const [desynchronized, setDesynchronized] = useState(false);
  const [canvasKey, setCanvasKey] = useState(0);
  const [info, setInfo] = useState<CanvasInfo | null>(null);
  const [copyResult, setCopyResult] = useState("");
  const [reportText, setReportText] = useState("");
  const [, refresh] = useReducer((n: number) => n + 1, 0);

  useEffect(() => {
    const id = window.setInterval(refresh, REFRESH_MS);
    return () => window.clearInterval(id);
  }, []);

  const features = detectFeatures();
  const summaries = [...lab.kinds].map(([kind, log]): [string, KindSummary] => [
    kind,
    summarizeKind(log),
  ]);
  const frame = summarize(intervals(lab.frameTimes));

  const copy = async () => {
    const text = JSON.stringify(buildReport(lab, info), null, 2);
    setReportText(text);
    try {
      await navigator.clipboard.writeText(text);
      setCopyResult("コピーしました");
    } catch {
      setCopyResult("コピーできませんでした。下のテキストを選択してコピーする");
    }
  };

  return (
    <main className="mx-auto flex max-w-3xl select-none flex-col gap-4 p-4">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold">入力検証（開発用）</h1>
        <a href="#top" className="text-sm underline">
          トップへ
        </a>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={desynchronized ? "default" : "outline"}
          size="sm"
          onClick={() => {
            setDesynchronized((v) => !v);
            setCanvasKey((k) => k + 1);
          }}
        >
          desynchronized: {desynchronized ? "ON" : "OFF"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCanvasKey((k) => k + 1)}
        >
          キャンバスを消す
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            resetLabState(lab);
            refresh();
          }}
        >
          計測をリセット
        </Button>
        <Button size="sm" onClick={copy}>
          結果をコピー
        </Button>
        {copyResult && (
          <span className="text-muted-foreground text-xs">{copyResult}</span>
        )}
      </div>

      <PointerCanvas
        key={canvasKey}
        lab={lab}
        desynchronized={desynchronized}
        onReady={setInfo}
      />
      <p className="text-muted-foreground text-xs">
        黒: 描いた線 / 橙: 予測点（getPredictedEvents） / 青い輪:
        ホバー中の位置。desynchronized
        を切り替えたら「計測をリセット」してから測る
      </p>

      <LatestTable latest={lab.latest} />

      <section className="space-y-2">
        <h2 className="font-semibold">入力の種類ごとの集計</h2>
        <KindTable summaries={summaries} />
        <p className="text-muted-foreground text-xs">
          遅延は「イベントの timeStamp から、描いた rAF の時刻まで」の差。
          画面に表示されるまでは含まないため、下限の目安。
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">環境</h2>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
          {(
            [
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
                frame.count === 0
                  ? "—"
                  : `${fmt(frame.mean)} / ${fmt(frame.max)}`,
              ],
            ] as [string, string][]
          ).map(([label, value]) => (
            <div key={label} className="contents">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="font-mono">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <PwaChecks />

      {reportText && (
        <textarea
          readOnly
          value={reportText}
          className="h-48 w-full select-text rounded-md border p-2 font-mono text-xs"
        />
      )}
    </main>
  );
}
