---
name: skill
description: テンプレートリポジトリから skill を一覧・追加・更新・削除する。使いたい skill を後から取り込む時に使う。
when_to_use: skill を追加したい、テンプレートにどんな skill があるか見たい、skill を最新化したい、不要な skill を消したい時
argument-hint: "[list|add <name>|update <name>|remove <name>]"
---

# Skill 管理

テンプレートリポジトリを配布元として、skill を一覧・追加・更新・削除する。

## ルール

- 取得元（`TEMPLATE_REPO` / `TEMPLATE_REF`）は `docs/claude/skills.md` に定義されている。必ずそこを Read して使う
- テンプレートは private リポジトリのため、取得は認証済みの `gh` を使う
- skill は `.claude/skills/<name>/` フォルダ単位で扱う（`SKILL.md` 以外の補助ファイルがあっても取りこぼさない）
- `remove` はローカルのみ削除し、テンプレート側には一切影響しない

## 手順

### 0. 設定を読み込む

`docs/claude/skills.md` を Read し、`TEMPLATE_REPO` と `TEMPLATE_REF` を取得する。

### list — 一覧する

1. テンプレートの skill ディレクトリを列挙する:

   ```bash
   gh api "repos/<TEMPLATE_REPO>/contents/.claude/skills?ref=<TEMPLATE_REF>" --jq '.[] | select(.type=="dir") | .name'
   ```

2. 各 skill の `SKILL.md` の frontmatter から `description` を拾う:

   ```bash
   gh api "repos/<TEMPLATE_REPO>/contents/.claude/skills/<name>/SKILL.md?ref=<TEMPLATE_REF>" --jq '.content' | base64 -d | sed -n '/^---$/,/^---$/p'
   ```

3. ローカルの `.claude/skills/` と突き合わせ、各 skill に **導入済み / 未導入** を付けて一覧表示する。

### add `<name>` — 追加する

1. ローカルに既に `.claude/skills/<name>/` があれば、上書きになる旨を伝えて確認する。
2. 対象フォルダ配下の全ファイルを列挙して取得する:

   ```bash
   gh api "repos/<TEMPLATE_REPO>/contents/.claude/skills/<name>?ref=<TEMPLATE_REF>" --jq '.[] | select(.type=="file") | .name'
   ```

3. 各ファイルを取得して `.claude/skills/<name>/` に配置する:

   ```bash
   mkdir -p .claude/skills/<name>
   gh api "repos/<TEMPLATE_REPO>/contents/.claude/skills/<name>/<file>?ref=<TEMPLATE_REF>" --jq '.content' | base64 -d > .claude/skills/<name>/<file>
   ```

   - サブディレクトリがある場合は再帰的に取得する（`type=="dir"` を辿る）
4. 配置した `SKILL.md` を Read し、`name` / `description` を報告する。

### update `<name>` — 更新する

`add` と同じ取得処理で既存ファイルを上書きする。実行前に「テンプレートの最新版で上書きする」旨を伝える。

### remove `<name>` — 削除する

1. `.claude/skills/<name>/` が存在することを確認する。
2. 削除してよいかユーザーに確認する。
3. `rm -rf .claude/skills/<name>` で削除する（ローカルのみ）。

## 結果を報告する

- list: 導入済み / 未導入を分けた一覧
- add / update: 配置したファイルと skill の説明
- remove: 削除した skill 名
