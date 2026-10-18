---
name: issue
description: GitHub Issue を作成する。Issue 作成時は必ずこの Skill を使うこと。
when_to_use: Issue を作りたい、バグ報告したい、機能追加の Issue を立てたい、chore の Issue を作りたい時
argument-hint: "[タイトル]"
---

# Issue 作成

## ルール

- 1 Issue = 1 PR を厳守する。スコープを広げすぎない
- `.github/ISSUE_TEMPLATE/` のテンプレートに必ず従う
- テンプレートの必須項目は必ず埋める
- ラベルはテンプレートで定義されたものを付与する

## 手順

### 1. 種別を決定する

ユーザーに以下のどれか確認する（明確な場合は省略可）:

| 種別 | テンプレート | ラベル | タイトル prefix |
|------|-------------|--------|----------------|
| 機能追加 | `.github/ISSUE_TEMPLATE/feature.md` | `feature` | `[Feature]` |
| バグ | `.github/ISSUE_TEMPLATE/bug.md` | `bug` | `[Bug]` |
| 雑務・改善 | `.github/ISSUE_TEMPLATE/chore.md` | `chore` | `[Chore]` |

### 2. テンプレートを読み込む

選択した種別のテンプレートファイルを Read ツールで読み込み、必須項目を把握する。

### 3. Issue の内容を作成する

- ユーザーから提供された情報をテンプレートの各項目に当てはめる
- 不足している必須項目があればユーザーに確認する
- Feature の場合: 背景・目的・実装内容・非対象・完了条件を明確にする
- Bug の場合: 再現手順・期待動作・実際の動作を明確にする

### 4. Issue を作成する

```bash
gh issue create \
  --title "[種別] タイトル" \
  --label "ラベル" \
  --body "テンプレートに沿った本文"
```

### 5. 結果を報告する

作成した Issue の URL を表示する。
