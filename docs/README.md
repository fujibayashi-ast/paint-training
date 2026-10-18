# ドキュメント一覧

`docs/` 配下のドキュメント索引。新しいドキュメントを追加・削除したらこのファイルも更新する。

## プロジェクト固有（`docs/`）

プロジェクトに応じて以下のようなドキュメントを配置する。必要なものだけ作成し、ここに追記する。

- `architecture.md` — アーキテクチャ説明
- `requirements.md` — 要件
- `er.md` — DB ER 図
- `sequence/` — シーケンス図

## Claude / 運用向け（`docs/claude/`）

- [guide.md](claude/guide.md) — 開発ガイド（人間向け）
- [setup.md](claude/setup.md) — `/setup` スキルのヒアリング項目
- [skills.md](claude/skills.md) — skill の運用方針・取得元（テンプレートリポジトリ）設定
- [workflow.md](claude/workflow.md) — Issue 着手から PR マージまでの標準ワークフロー
- `build.md` — ビルド・配布手順（配布物があるプロジェクトで `/setup` 時に生成）

## 命名・配置ルール

- プロジェクト固有のドキュメントは `docs/` 直下
- Claude / 運用向けメタドキュメントは `docs/claude/`
- シーケンス図は `docs/sequence/<名称>.md`
- 新規ドキュメント追加・削除時は本ファイルに反映する
