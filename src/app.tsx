import { Button } from "@/components/ui/button";

export function App() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-2xl font-bold">イラスト練習（仮）</h1>
      <p className="text-muted-foreground">ビルドできています</p>
      <Button>ボタン</Button>
    </main>
  );
}
