name: Feature
description: 新機能の追加
title: "[Feature] "
labels: ["feature"]
body:

* type: textarea
  id: background
  attributes:
  label: 背景
  description: なぜこの機能が必要か
  placeholder: |
  例: 案件の稼働開始を記録できるようにしたい
  validations:
  required: true

* type: textarea
  id: purpose
  attributes:
  label: 目的
  description: このIssueで達成したいこと
  placeholder: |
  例: 開始ボタン押下で稼働ログを作成できるようにする
  validations:
  required: true

* type: textarea
  id: scope
  attributes:
  label: 実装内容
  description: Claudeにやらせること（具体的に）
  placeholder: |
  - 開始ボタンを実装
  - クリック時に work_logs に start_at を保存
  - 稼働中フラグを管理
  validations:
  required: true

* type: textarea
  id: out_of_scope
  attributes:
  label: 非対象
  description: やらないこと（重要）
  placeholder: |
  - 終了処理
  - 切替処理
  - 集計機能

* type: textarea
  id: acceptance
  attributes:
  label: 完了条件
  description: どうなれば完了か
  placeholder: |
  - ボタン押下でDBに保存される
  - 稼働中は開始ボタンが無効になる
  validations:
  required: true

* type: textarea
  id: docs
  attributes:
  label: 参照ドキュメント
  description: 着手前に読むべきドキュメント
  placeholder: |
  - docs/architecture.md
  - docs/requirements.md
  - docs/claude/workflow.md

* type: textarea
  id: notes
  attributes:
  label: 注意点
  placeholder: |
  - 既存の構造を壊さないこと
  - シンプルに実装すること
