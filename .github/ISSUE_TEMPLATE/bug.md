name: Bug
description: バグ報告
title: "[Bug] "
labels: ["bug"]
body:

* type: textarea
  id: summary
  attributes:
  label: 概要
  placeholder: |
  何が起きているか

* type: textarea
  id: steps
  attributes:
  label: 再現手順
  placeholder: |
  1. xxx
  2. xxx

* type: textarea
  id: expected
  attributes:
  label: 期待される動作

* type: textarea
  id: actual
  attributes:
  label: 実際の動作

* type: textarea
  id: scope
  attributes:
  label: 修正内容
  placeholder: |
  Claudeに修正してほしい内容

* type: textarea
  id: docs
  attributes:
  label: 参照ドキュメント
  description: 調査・修正にあたって読むべきドキュメント
  placeholder: |
  - docs/architecture.md
  - docs/claude/workflow.md

* type: textarea
  id: notes
  attributes:
  label: 注意点
