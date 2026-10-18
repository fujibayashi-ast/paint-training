# Skill の運用

このテンプレートに含まれる skill の運用方針と、後から skill を追加・更新するための設定を定義する。

## 基本方針

- テンプレート（後述の取得元リポジトリ）が **全 skill の配布元兼カタログ** を兼ねる
- プロジェクト開始時（`/setup`）に、使う skill だけを残し、不要な skill は `.claude/skills/` から **削除** する
  - リポジトリにも Claude のコンテキストにも、使う skill だけが並ぶ状態を保つ
- 後から skill が必要になったら `/skill` スキルでテンプレートから取得する

## 取得元（テンプレートリポジトリ）

`/skill` はここからファイルを取得する。テンプレートを fork / リネームした場合はこの値を書き換える。

```
TEMPLATE_REPO: hyge-astrsk/claude-code-template
TEMPLATE_REF: main
```

- private リポジトリのため、取得には認証済みの `gh` を使う（同 Org メンバーであれば閲覧可）
- skill は `.claude/skills/<name>/` フォルダ単位で配置される

## 取得・更新コマンドの考え方

`/skill` は以下を `gh api` 経由で行う。

- **一覧（list）**: `gh api repos/<TEMPLATE_REPO>/contents/.claude/skills?ref=<TEMPLATE_REF>` でディレクトリを列挙し、各 `SKILL.md` の frontmatter（`name` / `description`）から説明を拾う
- **追加（add）**: 対象 skill フォルダ配下の全ファイルを取得して `.claude/skills/<name>/` に配置する
- **更新（update）**: 既存 skill を取得し直して上書きする
- **削除（remove）**: ローカルの `.claude/skills/<name>/` を削除する（テンプレート側には影響しない）
