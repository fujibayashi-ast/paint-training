---
name: safe-mode
description: プロジェクトを safe モード（副作用ブロックの厳格モード）に切り替える。業務用プロジェクトでセキュリティインシデントを防ぎたい場合に使う。
when_to_use: safe モードに切り替えたい時、副作用をブロックしたい時、業務用プロジェクトの初期設定を厳格化したい時
---

# safe モード適用

## ルール

- safe モードは `.claude/settings.safe.json` の内容を `.claude/settings.json` に上書きして有効化する
- 元の `.claude/settings.json` の独自 allow / deny が失われる可能性があるため、適用前にユーザーに警告する
- CLAUDE.md の Core Rules にも safe モードでの制約を追記する

## safe モードの特徴

- 書き込み系の git / gh コマンド（push / PR 作成 / release 作成など）を deny
- パッケージ公開コマンド（yarn / npm / pnpm publish）を deny
- 外部通信コマンド（curl / wget）を deny
- クラウド CLI（aws / gcloud / az / kubectl / terraform / heroku / flyctl / vercel）を deny
- リモート転送コマンド（ssh / scp / rsync）を deny
- `.claude/hooks/block-credentials.sh` により、クレデンシャル・機密ファイルへのアクセスと環境変数ダンプを PreToolUse hook でブロック

## 手順

### 1. 現在の状態を確認する

`.claude/settings.json` を Read し、既に safe モードが適用済みかを判定する（`.claude/hooks/block-credentials.sh` への参照が `hooks` セクションにあれば適用済み）。

- 適用済みの場合はその旨をユーザーに伝え、終了する
- 未適用の場合はステップ 2 に進む

### 2. safe モードの説明と確認

上記「safe モードの特徴」をユーザーに提示し、適用するか確認する。

既存の `.claude/settings.json` に独自のカスタマイズがある場合は、それが上書きされる旨を警告する。必要なら差分をユーザーに提示してから進める。

### 3. settings を上書きする

Yes と回答された場合:

1. `.claude/settings.safe.json` の内容を Read する
2. `.claude/settings.json` に書き込む（上書き）
3. `.claude/settings.safe.json` は参考ファイルとしてそのまま残す

### 4. CLAUDE.md を更新する

CLAUDE.md の `Core Rules` セクションに以下を追記する（既に記載があれば重複させない）:

- `外部通信（curl / wget 等）を行わない`
- `パッケージの外部公開（publish）を行わない`
- `git push / PR 作成など外部に影響を及ぼす操作を行わない`

### 5. Dev Container の確認

safe モードの permission / hook は既知のリスクを塞ぐが、hook のパターン漏れ・hook スクリプト自体の書き換え・作業ディレクトリ外への任意書き込みなど、未知のリスクまでは塞ぎきれない。より確実な隔離（作業ディレクトリ外への物理アクセスを不可にする）が必要な場合は Dev Container の導入を提案する。

ユーザーに「作業ディレクトリ外への影響を完全に遮断したいですか？」を確認する。判断材料を合わせて提示する:

- **向いているプロジェクト**: Web バックエンド、CLI、Web フロントエンド、データ処理、スクリプト系
- **向いていないプロジェクト**: Electron / Tauri / Flutter Desktop などのデスクトップ GUI、iOS / macOS ネイティブ（Xcode 必須）、GPU・USB デバイス依存、VPN 前提のアクセス
- **macOS の Docker Desktop** ではハードウェア周りに制約があるので注意

Yes かつプロジェクトが向いている場合:

1. プロジェクトの技術スタックに応じて `.devcontainer/devcontainer.json` を生成する
   - Node.js なら `mcr.microsoft.com/devcontainers/javascript-node` 系
   - Python なら `mcr.microsoft.com/devcontainers/python` 系
   - 必要な拡張・forwardPorts はプロジェクトに合わせる
2. README の Getting Started に「VSCode の Reopen in Container で起動」手順を追記する

No、または Dev Container が向かないプロジェクトの場合はスキップする（safe モードの settings / hook によるガードのみで運用）。

### 6. 結果を報告する

適用した内容と、変更したファイル（`.claude/settings.json` / `CLAUDE.md` / 必要なら `.devcontainer/devcontainer.json` / `README.md`）をユーザーに提示する。hook スクリプトが存在しない場合は `.claude/hooks/block-credentials.sh` の配置も確認するよう案内する。
