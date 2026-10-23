import { lazy, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { useHash } from "@/hooks/use-hash";

// 入力検証ページは開発用。開発サーバーと lab モードのビルドにだけ含め、通常のビルドからは取り除く
// （条件はビルド時に定数へ置き換わり、分岐ごと消える）
const InputLabPage =
  import.meta.env.DEV || import.meta.env.MODE === "lab"
    ? lazy(() =>
        import("@/pages/input-lab-page").then((m) => ({
          default: m.InputLabPage,
        })),
      )
    : null;

export function App() {
  const hash = useHash();

  if (InputLabPage && hash === "#input-lab") {
    return (
      <Suspense fallback={null}>
        <InputLabPage />
      </Suspense>
    );
  }

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-2xl font-bold">イラスト練習（仮）</h1>
      <p className="text-muted-foreground">ビルドできています</p>
      <Button>ボタン</Button>
      {InputLabPage && (
        <a href="#input-lab" className="text-sm underline">
          入力検証ページ（開発用）
        </a>
      )}
    </main>
  );
}
