# CLAUDE.md

## Project Overview

イラストを描く練習アプリ（プロジェクト名は仮）。本当の初心者がイラストを描けるようになるための練習ツール。

* Web / PWA を前提とする。ネイティブ機能が必須と分かった場合のみモバイルアプリを検討する
* 想定ユーザー: イラスト練習をしたい本当の初心者
* 要件の詳細は [docs/requirements.md](docs/requirements.md)

## Core Rules

* 1 Issue = 1 PR を守る
* Issue のスコープ外の変更をしない
* どんな小さなバグ・改善でも必ず Issue を経由する（履歴を残すため、直接実装・PR 作成しない）
* 実装前に方針を説明する
* 実装後に確認手順を記載する

## Tech Stack

* 言語: TypeScript
* フレームワーク: React + Vite
* UI: shadcn/ui + Tailwind CSS
* パッケージマネージャ: bun
* lint / format: Biome
* ストレージ: 当面は端末ローカル（IndexedDB など）。外部 DB が必要になった時点で導入し、開発時は Docker のローカル DB を使う
* その他のライブラリ: 機能要件に応じて都度追加する（追加時は理由を Issue / PR に書く）

## Architecture

* 当面はクライアントのみ（SPA / PWA）。必要になった時点でサーバーを追加する
* プロセス構成: メインスレッド + Service Worker。必要に応じて Web Worker / WASM を導入する
* ディレクトリは機能単位 + 共通の構成で、細かめに分ける
* 共通処理は `src/lib/` に置く
* 詳細は [docs/architecture.md](docs/architecture.md)

## Domain Rules

* 練習は 3 段階で構成する
  1. 基礎練習: 線・図形・デッサン、トレースなどの模範練習（drawabox など既存の練習法を参考にする）
  2. イラスト練習: パーツ単位（目・鼻など）、タッチ・絵柄の違い。ステップアップ式
  3. ツール説明・練習: ペンなど各ツールを「何を描く時に何を使うか」で教える
* AI agent による採点・助言を 1〜3 全体で行う
  * 完成した絵だけでなく、描画中のストローク（筆圧・ぶれ・速度など）も判断材料にする
  * 手順の指摘もする（例: いきなりパーツを描き始めたら、まず全体のアタリを促す）
* AI agent に質問できる環境を作る（機能を Command として包み、AI から操作・質問できるようにする。参考: fujibayashi-ast/ai-friendly）
* 外部 LLM への通信は、利用者の API キーでブラウザから直接呼ぶ方式を基本とする。API キーと描画データは端末内に留め、外部へ送る場合は事前に利用者へ明示する

## Guidelines

* シンプルに実装する
* 不要なライブラリを追加しない
* パフォーマンスを意識する
* ファイル・ディレクトリ名は kebab-case
* 分割は行数ではなく責務で決める（汎用的なものと固有のものを分ける）
* Biome の lint / format に従う

## Agent / Token Efficiency

タスクに対して最小限で足りる agent を使う。

* 委譲する（`scout`）: 探索と機械的な確認は `scout` に委譲し、要約だけを受け取る。ファイル本文やログ全文をメインのコンテキストに載せない
  * ファイル・シンボル・参照の検索、grep
  * `bun test` / lint / typecheck / build の実行と結果確認
  * `git status` / `git diff` の確認
* 自分でやる: 通常の実装・リファクタリング・コードレビュー。単純な逐次作業は、委譲するより直接やる方が安い
* エスカレーションする（`deep-diver`）: 次の場合に限る。「タスクが大きい」だけでは使わない
  * 複雑なアーキテクチャ判断（ストローク分析・WASM・PWA・Command API の境界など）
  * 難航しているデバッグ（iOS Safari 固有の挙動、入力イベントの欠落、描画のちらつきなど）
  * パッケージ横断の依存関係分析
  * 大規模リファクタリングの方針決定

## Documentation Rules

* 新しい機能を実装する場合、対応するドキュメントを更新する
* 実装とドキュメントの内容を一致させる
* `docs/` 配下のドキュメントを追加・削除した場合は `docs/README.md` の索引も更新する
* 図は Mermaid で書く
* `docs/architecture.md` と `docs/requirements.md` は、該当する変更時に更新する

## Issue / PR / Release Rules

* Issue 作成時は `/issue` スキルを使うこと
* PR 作成前に `/review` スキルでセルフレビューを行うこと
* PR 作成時は `/pr` スキルを使うこと
* リリース方針は未定（GitHub Release は使わない見込み。最終形が決まってから定義する）<!-- 未記入 -->

## Implementation Workflow

* Issue 着手から PR マージまでの流れは `docs/claude/workflow.md` に従うこと
* 利用可能なスキルは `.claude/skills/` 配下。description / when_to_use に従い、場面に応じて自動的に選ぶこと

## Docs

* docs/
