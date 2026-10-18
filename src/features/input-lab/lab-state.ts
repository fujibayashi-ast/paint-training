import { createKindLog, type KindLog } from "./pointer-stats";

/** 最新のイベントの値。プロパティが無い環境では undefined */
export interface LatestInput {
  pointerType: string;
  buttons: number;
  pressure: number;
  tiltX: number | undefined;
  tiltY: number | undefined;
  altitudeAngle: number | undefined;
  azimuthAngle: number | undefined;
}

/**
 * 検証ページの可変の状態。イベントごとに React を再描画しないよう、
 * ref に持たせて書き換え、画面は一定間隔で読み取る。
 */
export interface LabState {
  kinds: Map<string, KindLog>;
  /** requestAnimationFrame の時刻 */
  frameTimes: number[];
  latest: LatestInput | null;
  /** 最新のイベントの予測点（キャンバス上の CSS 座標） */
  predicted: { x: number; y: number }[];
}

export function createLabState(): LabState {
  return { kinds: new Map(), frameTimes: [], latest: null, predicted: [] };
}

export function getKindLog(state: LabState, kind: string): KindLog {
  let log = state.kinds.get(kind);
  if (!log) {
    log = createKindLog();
    state.kinds.set(kind, log);
  }
  return log;
}

export function resetLabState(state: LabState): void {
  state.kinds.clear();
  state.frameTimes.length = 0;
  state.latest = null;
  state.predicted.length = 0;
}
