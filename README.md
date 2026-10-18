# イラストを描く練習アプリ（仮）

本当の初心者がイラストを描けるようになるための練習アプリ。Web / PWA として動く。

## 特徴（予定）

* 段階的な練習
  0. 診断: 短い課題から弱点を特定し、練習を提案する
  1. 基礎練習: 線・図形・デッサン、トレースなど
  2. イラスト練習: 目・鼻などのパーツ単位、タッチや絵柄の違いをステップアップ式で
* ツールの使い方は、練習の中で「何を描く時に何を使うか」とあわせて学ぶ（ペンは 1 本から増やす）
* AI agent による採点・助言: 完成した絵だけでなく、描画中のストローク（筆圧・ぶれ・速度など）も見て助言する
* AI agent に質問できる環境

要件の詳細は [docs/requirements.md](docs/requirements.md)、構成は [docs/architecture.md](docs/architecture.md) を参照。

## 技術スタック

TypeScript / React / Vite / shadcn/ui / Tailwind CSS / bun / Biome

詳細は [CLAUDE.md](CLAUDE.md) を参照。

## Getting Started

前提: [bun](https://bun.sh/) をインストールしておく。

```bash
bun install      # 依存のインストール
bun run dev      # 開発サーバーを起動（通常は http://localhost:5173。使用中なら別のポートになる。起動時の表示を見る）
```

| コマンド | 内容 |
| --- | --- |
| `bun run dev` | 開発サーバーを起動する。Service Worker は無効 |
| `bun run build` | 型チェックのあと、`dist/` にビルドする |
| `bun run preview` | ビルドした成果物を配信する。PWA（Manifest・Service Worker）はここで確認する |
| `bun run lint` | Biome で lint とフォーマットの確認をする |
| `bun run format` | Biome で整形する |
| `bun run typecheck` | 型チェックをする |
| `bun test` | テストを実行する |

PWA の確認は `bun run build` → `bun run preview` で行い、ブラウザの開発者ツール（Application タブ）で Manifest と Service Worker を見る。

## 開発の進め方

Claude Code を前提としたワークフロー（Issue → プラン → 実装 → レビュー → PR）で進める。
詳細は [docs/claude/guide.md](docs/claude/guide.md) と [docs/claude/workflow.md](docs/claude/workflow.md) を参照。

ドキュメントの一覧は [docs/README.md](docs/README.md)。
