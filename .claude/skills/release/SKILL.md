---
name: release
description: GitHub Release を作成する。リリース時は必ずこの Skill を使うこと。
when_to_use: リリースしたい、リリースログを作りたい時
argument-hint: "[バージョン番号 (例: v1.0.2)]"
---

# GitHub Release 作成

## ルール

- main ブランチから作成する
- セマンティックバージョニングに従う（vX.Y.Z）
- `.github/RELEASE_TEMPLATE.md` のテンプレートに必ず従う
- 配布物（実行ファイル・パッケージなど）がある場合はアセットとしてアップロードする

## 手順

### 1. バージョンを決定する

バージョン番号が引数で渡された場合はそれを使う。渡されていない場合:

1. 現在のバージョンを確認する（プロジェクトのバージョン管理ファイルから取得。例: `package.json` / `pyproject.toml` / `Cargo.toml` など）

2. 前回リリースからの変更内容を確認する

    ```bash
    gh release list --limit 1
    git log {前回タグ}..HEAD --oneline
    ```

3. 変更内容に基づいてバージョンを提案する:
    - **MAJOR**: 破壊的変更
    - **MINOR**: 機能追加
    - **PATCH**: バグ修正・改善

4. ユーザーにバージョンを確認する

### 2. リリースノートを作成する

`.github/RELEASE_TEMPLATE.md` を Read ツールで読み込み、テンプレートの各項目を把握する。

前回リリースからのコミット・マージされた PR を確認し、テンプレートに沿ってリリースノートを作成する。

```bash
git log {前回タグ}..HEAD --oneline
```

- 「変更点」には PR 番号（`#PR番号`）を付与する
- 配布物がないプロジェクトでは「ダウンロード」セクションは削除する

### 3. バージョンを更新する

バージョン管理ファイル（`package.json` / `pyproject.toml` / `Cargo.toml` など）のバージョンを更新してコミットする。該当ファイルがないプロジェクトではスキップする。

### 4. GitHub Release を作成する

```bash
gh release create vX.Y.Z \
  --title "vX.Y.Z" \
  --notes "リリースノート" \
  --target main
```

### 5. 配布物をビルド・アップロードする（該当する場合）

`docs/claude/build.md` が存在する場合のみ実施する。このファイルにビルドコマンド・成果物パス・注意点が記載されている。

```bash
# docs/claude/build.md に従ってビルド
# 成果物をアップロード
gh release upload vX.Y.Z <ビルド成果物のパス ...>
```

`docs/claude/build.md` が存在しない場合はこのステップをスキップする（配布物なしのプロジェクト、または未設定のケース）。未設定で配布物が必要なことが分かった場合は、ユーザーに「`docs/claude/build.md` を作成してください」と案内する。

### 6. 結果を報告する

作成した Release の URL を表示する。
