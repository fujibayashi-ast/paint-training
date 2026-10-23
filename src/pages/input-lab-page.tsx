import { useEffect, useReducer, useState } from "react";
import { Button } from "@/components/ui/button";
import { EnvironmentTable } from "@/features/input-lab/components/environment-table";
import { KindTable } from "@/features/input-lab/components/kind-table";
import { LatestTable } from "@/features/input-lab/components/latest-table";
import { PointerCanvas } from "@/features/input-lab/components/pointer-canvas";
import { PwaChecks } from "@/features/input-lab/components/pwa-checks";
import {
  type CanvasInfo,
  createLabState,
  resetLabState,
} from "@/features/input-lab/lib/lab-state";
import {
  intervals,
  type KindSummary,
  summarize,
  summarizeKind,
} from "@/features/input-lab/lib/pointer-stats";
import { buildReport, detectFeatures } from "@/features/input-lab/lib/report";

/** 画面に反映する間隔（ms）。イベントごとに再描画しない */
const REFRESH_MS = 500;

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

  const summaries = [...lab.kinds].map(([kind, log]): [string, KindSummary] => [
    kind,
    summarizeKind(log),
  ]);

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

      <EnvironmentTable
        features={detectFeatures()}
        info={info}
        frame={summarize(intervals(lab.frameTimes))}
      />

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
