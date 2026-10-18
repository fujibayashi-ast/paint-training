# 開発ガイド（人間向け）

スキル名やコマンドを覚える必要はない。自然な日本語で Claude に依頼するだけで、裏で必要な手順を通してくれる。

途中で確認が必要な場面（プラン提示・PR 作成前など）では一度止まるので、内容を見て OK / NG を伝える。

---

## ケース別: こんなときの頼み方

### 新しい機能の要望を思いついた

> 「ログイン画面にパスワードリセット機能を追加したい。Issue にしておいて」

→ Claude が要件を整理して Issue を作成する。あとでそのまま実装を依頼できる。

---

### 既存 Issue の実装をお願いしたい

> 「#12 のタスクをお願いします」

→ Claude が [workflow.md](workflow.md) に沿って以下を進める:

1. Issue の内容と関連ドキュメントを確認
2. Plan Mode で実装プランを立てて承認 → `/issue-plan` で Issue にコメント投稿
3. プラン確定後に実装
4. セルフレビュー
5. PR 作成

プランの承認・PR 作成の前に止まるので、内容を確認して進めてもらう。Plan Mode に入るには、Shift+Tab で切り替えるか、`/plan` と打つ。

---

### バグを見つけた

> 「稼働ボタンを連打すると重複で登録される。直して」

→ Claude が Issue を作ってから実装〜PR まで進める。どんな小さなバグでも Issue を経由する（履歴を残すため）。

---

### PR にレビュー指摘が来た

> 「PR #42 のレビュー対応お願い」

→ Claude がレビューコメントを読み込み、対応方針を整理して提示する。確認後、修正コミットと返信まで行う。

---

### 実装を急いでドキュメントが追いついていない

> 「最近マージした PR の内容をドキュメントに反映して」

→ 実装とドキュメントの差分を Claude が洗い出し、該当する docs を更新する。サイトマップ（`docs/README.md`）も同時に更新される。

---

### リリースしたい

リリース方針は未定のため、現時点ではリリース用の手順やスキルはない。方針が決まったら、ここと [workflow.md](workflow.md) に追記する。

---

### 作業を始めたばかりで何からやるか迷っている

> 「今ある Issue を見せて、優先度の高いものを提案して」

→ Issue 一覧と概要を出してくれる。着手するものが決まったら「#N のタスクをお願い」で進められる。

---

## ハーネス構成

Claude Code の設定は `.claude/` と `.mcp.json` にまとまっている。

### MCP（`.mcp.json`）

| サーバー | 用途 |
| --- | --- |
| `context7` | ライブラリの最新ドキュメントを取得する |
| `playwright` | ブラウザを操作して UI の動作を確認する（WebKit は実機の iPad Safari とは異なり、Apple Pencil 入力も再現できない） |
| `chrome-devtools` | 画面のデバッグ・性能計測 |

* 外部パッケージを `npx` で実行するため、バージョンを固定している。更新するときは `npm view <パッケージ名> version` で現行版を確認して書き換える
* 初回起動時に承認を求められる。`context7` の読み取り系ツールは `settings.json` で許可済み

### 権限（`.claude/settings.json`）

* git / gh の基本操作と、bun のスクリプト実行（`bun install` / `bun run dev|build|test|lint|typecheck|format` / `bun test`）を許可している
* 強制 push、`reset --hard`、パッケージ公開（`bun publish` / `npm publish`）などは禁止している
* `.env` などの機密ファイルの読み取りは禁止している（`.env.example` / `.env.sample` / `.env.template` は許可）
* 個人用の設定は `.claude/settings.local.json`（gitignore 済み。サンプルは `settings.local.json.example`）に書く

### hook（`.claude/hooks/`）

| スクリプト | タイミング | 内容 |
| --- | --- | --- |
| `block-credentials.sh` | ツール実行前 | クレデンシャル・機密ファイルへのアクセスと、環境変数のダンプをブロックする |
| `format-biome.sh` | Edit / Write の後 | 編集した ts / tsx / js / jsx / json / css を Biome で整形する。Biome が未導入なら何もしない |

`block-credentials.sh` の Bash の判定:

* `sanitize-bash-command.py` が、コマンドをシェル構文で分割し、確実に文章と言える部分を取り除いてから照合する
  * `import.meta.env` / `process.env` / `Bun.env` / `Deno.env`
  * リテラルなヒアドキュメント（`<<'EOF'`）の本文
  * `git commit` / `git tag` の `-m` / `--message`、`gh issue|pr` の `--title` / `-t` / `--body` / `-b` の値
* 値に `$(` やバッククォートがある場合は、コマンド置換で機密ファイルを読めてしまうため取り除かない。`--body-file` はパスなので取り除かない
* `python3` が無い、またはパースに失敗した場合は、コマンド全文を照合する（誤検知は増えるが、保護は弱まらない）
* 想定する脅威は「うっかりのアクセス」であり、意図的な回避は防げない
* 判定を変えたら `bash .claude/hooks/block-credentials.test.sh` で、ブロックすべきものと通すべきものを確認する

### agent（`.claude/agents/`）

| agent | モデル | 用途 |
| --- | --- | --- |
| `scout` | haiku | 読み取り専用の探索と機械的な確認（検索、test / lint / build の実行、git の確認）。要約だけを返す |
| `deep-diver` | opus | 難しい問題に限ったエスカレーション用（アーキテクチャ判断、難航しているデバッグなど） |

使い分けの基準は [CLAUDE.md](../../CLAUDE.md) の「Agent / Token Efficiency」を参照。

---

## 依頼するときのコツ

- **具体的に**: 「直して」より「◯◯の時に△△になるのを直して」の方が精度が上がる
- **スコープを示す**: 「この Issue の範囲だけ」「他は触らないで」と言うとスコープ外の変更を防げる
- **途中で止めてよい**: 方向性がズレたら「一旦ストップ」で止めて、方針を再指示できる
