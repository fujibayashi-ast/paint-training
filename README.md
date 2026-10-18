# Claude Code Template

Claude Code を前提とした開発ワークフローの標準化テンプレート。

Issue 着手 → プラン → 実装 → レビュー → PR → リリースの一連の流れをスキルとして標準化し、セキュリティ設定・ドキュメント構成・CI / エディタ設定などの汎用的な雛形もまとめて提供する。

## Getting Started

1. このリポジトリの `Use this template` ボタンから新規リポジトリを作成する
2. 作成したリポジトリを clone する
3. Claude Code で開き、`/setup` スキルを実行する
   - LLM が `docs/claude/setup.md` のヒアリング項目に沿って質問し、`CLAUDE.md` と `README.md` をプロジェクト用に書き換える
4. 日々の開発の進め方は [docs/claude/guide.md](docs/claude/guide.md) を参照

## 含まれているもの

### スキル（`.claude/skills/`）

| スキル | 用途 |
| --- | --- |
| `/setup` | プロジェクト初期セットアップ。CLAUDE.md / README を埋める |
| `/safe-mode` | 副作用ブロックの厳格モードに切り替える（業務用プロジェクト向け） |
| `/plan` | 実装プランを作成し、Issue コメントとして投稿する |
| `/issue` | GitHub Issue を作成する |
| `/review` | PR 作成前のセルフレビュー |
| `/pr` | Pull Request を作成する |
| `/fix` | PR のレビュー指摘に基づいて修正する |
| `/doc` | 実装済み機能のドキュメントを追加・更新する |
| `/release` | GitHub Release を作成する |

### ドキュメント（`docs/`）

`docs/` はプロジェクト固有のドキュメント（アーキテクチャ・要件・ER 図など）を置く場所。
Claude / 運用向けのメタドキュメントは `docs/claude/` にまとめている。

| ファイル | 役割 |
| --- | --- |
| `docs/README.md` | `docs/` 配下のサイトマップ |
| `docs/claude/guide.md` | 開発ガイド（人間向け） |
| `docs/claude/setup.md` | `/setup` 実行時に LLM が参照するヒアリング項目 |
| `docs/claude/workflow.md` | Issue 着手から PR マージまでの標準ワークフロー |

### GitHub 関連（`.github/`）

- `PULL_REQUEST_TEMPLATE.md`: PR テンプレート
- `ISSUE_TEMPLATE/`: Issue テンプレート（bug / feature / chore）
- `RELEASE_TEMPLATE.md`: Release テンプレート
- `CODEOWNERS`: レビュアー自動割当（雛形）
- `dependabot.yml`: 依存の自動アップデート（雛形）
- `workflows/ci.yml`: CI の最小構成（雛形）

### 設定（`.claude/`）

- `settings.json`: 権限 allowlist / denylist の雛形
- `settings.safe.json`: safe モード用の設定
- `settings.local.json.example`: ローカル個別設定のサンプル（`settings.local.json` は gitignore 済み）
- `hooks/`: PreToolUse hook スクリプト（`block-credentials.sh` など）
- `skills/`: 上記スキル群

### エディタ・コミット設定

- `.editorconfig`: インデント・改行コードを統一
- `.vscode/extensions.json`: VSCode 推奨拡張（Claude Code / EditorConfig など）
- `.vscode/settings.json`: 最小限の VSCode 設定
- `.gitmessage`: コミットメッセージテンプレート（Conventional Commits 風）
  - 有効化: `git config commit.template .gitmessage`
- `.gitignore`: OS / エディタ / Claude ローカル設定 / 環境変数などを除外

## safe モード

業務用プロジェクトなどで、LLM による意図しない副作用（本番リソースへの変更・外部通信・機密漏洩など）を防ぎたい場合のモード。

- 書き込み系 git / gh コマンド（push / PR 作成 / release 作成など）を deny
- パッケージ公開コマンド（yarn / npm / pnpm publish）を deny
- 外部通信コマンド（curl / wget）を deny
- クラウド CLI（aws / gcloud / az / kubectl / terraform / heroku / flyctl / vercel）を deny
- リモート転送コマンド（ssh / scp / rsync）を deny
- PreToolUse hook（`.claude/hooks/block-credentials.sh`）で、クレデンシャルファイル（`~/.aws/credentials`、`~/.ssh/id_*`、`.env` など）や環境変数ダンプ（`env` / `printenv` / `ps aux`）を Bash 経由でもブロック

必要に応じて個別に allow リストへ追加して使う（例: `aws sts get-caller-identity` で認証確認だけしたい場合は `Bash(aws sts get-caller-identity)` を allow に足す）。

切り替えは `/safe-mode` スキルで行う。`.claude/settings.safe.json` を `.claude/settings.json` に上書きし、CLAUDE.md の Core Rules にも制約が追記される。

## 作業ディレクトリ外を完全に遮断したい場合

permission 設定と PreToolUse hook（`block-credentials.sh`）で既知のリスクはブロックできるが、hook のパターン漏れ・hook スクリプト自体の書き換え・作業ディレクトリ外への任意書き込みなど、未知のリスクまでは塞ぎきれない。より確実な隔離が必要な場合は Dev Container の利用を推奨する。

`/safe-mode` 実行中に「作業ディレクトリ外の影響を完全遮断したいか」を確認され、必要なら `.devcontainer/devcontainer.json` が生成される。

向いているプロジェクト: Web バックエンド、CLI、Web フロントエンド、データ処理、スクリプト系

向いていないプロジェクト: Electron / Tauri / Flutter Desktop などのデスクトップ GUI、iOS / macOS ネイティブ、GPU・USB 依存、VPN 前提のアクセス

## カスタマイズ

- `CLAUDE.md`: プロジェクト固有のルール・技術スタック・ドメイン知識を記載
- `.claude/settings.json`: プロジェクトで使うコマンドを allowlist に追加
- `.github/ISSUE_TEMPLATE/`: プロジェクトの運用に合わせて調整
- `docs/`: プロジェクト固有のドキュメント（アーキテクチャ・ER 図・シーケンス図など）を追加
