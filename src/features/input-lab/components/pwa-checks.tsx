import { useCallback, useEffect, useState } from "react";
import { DefinitionList } from "@/components/definition-list";
import { Button } from "@/components/ui/button";
import { displayMode } from "@/features/input-lab/lib/display-mode";
import { readStamp, writeStamp } from "@/features/input-lab/lib/idb-probe";

interface Checks {
  swRegistered: boolean;
  swController: boolean;
  persisted: string;
  usage: string;
  stamp: string;
}

const MB = 1024 * 1024;

async function collect(): Promise<Checks> {
  const reg = await navigator.serviceWorker?.getRegistration();
  const persisted = navigator.storage?.persisted
    ? String(await navigator.storage.persisted())
    : "API なし";
  const estimate = navigator.storage?.estimate
    ? await navigator.storage.estimate()
    : null;
  let stamp: string;
  try {
    stamp = (await readStamp()) ?? "（まだ書いていない）";
  } catch (error) {
    stamp = `読み込みに失敗: ${String(error)}`;
  }
  return {
    swRegistered: reg !== undefined,
    swController: navigator.serviceWorker?.controller != null,
    persisted,
    usage: estimate
      ? `${((estimate.usage ?? 0) / MB).toFixed(1)} MB / ${((estimate.quota ?? 0) / MB).toFixed(0)} MB`
      : "API なし",
    stamp,
  };
}

/** PWA として動くか（SW・IndexedDB・永続化）を確かめる */
export function PwaChecks() {
  const [checks, setChecks] = useState<Checks | null>(null);
  const [persistResult, setPersistResult] = useState("（未実行）");
  const [message, setMessage] = useState("");

  const refresh = useCallback(() => {
    collect().then(setChecks, (e) => setMessage(String(e)));
  }, []);
  useEffect(refresh, [refresh]);

  const write = async () => {
    try {
      await writeStamp(new Date().toLocaleString("ja-JP"));
      setMessage("");
    } catch (e) {
      setMessage(`書き込みに失敗: ${String(e)}`);
    }
    refresh();
  };

  const persist = async () => {
    if (!navigator.storage?.persist) {
      setPersistResult("API なし");
      return;
    }
    setPersistResult(String(await navigator.storage.persist()));
    refresh();
  };

  const rows: [string, string][] = [
    ["安全なコンテキスト（HTTPS）", String(window.isSecureContext)],
    ["表示モード", displayMode()],
    ["Service Worker 登録", checks ? String(checks.swRegistered) : "…"],
    ["Service Worker が制御中", checks ? String(checks.swController) : "…"],
    ["storage.persisted()", checks?.persisted ?? "…"],
    ["storage.persist() の結果", persistResult],
    ["ストレージ使用量 / 上限", checks?.usage ?? "…"],
    ["IndexedDB に最後に書いた時刻", checks?.stamp ?? "…"],
  ];

  return (
    <section className="space-y-2">
      <h2 className="font-semibold">PWA</h2>
      <DefinitionList rows={rows} />
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={write}>
          IndexedDB に書く
        </Button>
        <Button variant="outline" size="sm" onClick={persist}>
          persist() を実行
        </Button>
        <Button variant="outline" size="sm" onClick={refresh}>
          再読み込み
        </Button>
      </div>
      {message && <p className="text-destructive text-sm">{message}</p>}
      <p className="text-muted-foreground text-xs">
        Service Worker は <code>bun run dev</code> では登録されない。
        <code>build:lab</code> → <code>preview:ipad</code> で確かめる。
      </p>
    </section>
  );
}
