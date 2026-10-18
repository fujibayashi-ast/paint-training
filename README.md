# イラストを描く練習アプリ（仮）

本当の初心者がイラストを描けるようになるための練習アプリ。Web / PWA として動く。

## 特徴（予定）

* 段階的な練習
  1. 基礎練習: 線・図形・デッサン、トレースなど
  2. イラスト練習: 目・鼻などのパーツ単位、タッチや絵柄の違いをステップアップ式で
  3. ツール説明・練習: ペンなど各ツールを「何を描く時に何を使うか」で学ぶ
* AI agent による採点・助言: 完成した絵だけでなく、描画中のストローク（筆圧・ぶれ・速度など）も見て助言する
* AI agent に質問できる環境

要件の詳細は [docs/requirements.md](docs/requirements.md)、構成は [docs/architecture.md](docs/architecture.md) を参照。

## 技術スタック

TypeScript / React / Vite / shadcn/ui / Tailwind CSS / bun / Biome

詳細は [CLAUDE.md](CLAUDE.md) を参照。

## Getting Started

アプリの実装はこれから。土台ができた時点でインストール・起動手順をここに追記する。

## 開発の進め方

Claude Code を前提としたワークフロー（Issue → プラン → 実装 → レビュー → PR）で進める。
詳細は [docs/claude/guide.md](docs/claude/guide.md) と [docs/claude/workflow.md](docs/claude/workflow.md) を参照。

ドキュメントの一覧は [docs/README.md](docs/README.md)。
