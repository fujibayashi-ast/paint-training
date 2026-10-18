#!/bin/bash
# PostToolUse hook: 編集したファイルを Biome で自動整形する
#
# 対象ツール: Edit / Write
# 対象ファイル: ts / tsx / js / jsx / json / css
# プロジェクトの Biome（node_modules/.bin/biome）と設定ファイルがある場合のみ実行する。
# ない場合（アプリの土台ができる前など）は何もしない。ネットワークアクセスはしない。
# 整形に失敗しても作業は止めない（常に exit 0）

set -uo pipefail

input=$(cat)

file_path=$(echo "$input" | jq -r '.tool_input.file_path // empty')

if [ -z "$file_path" ]; then
  exit 0
fi

case "$file_path" in
  *.ts|*.tsx|*.js|*.jsx|*.json|*.css) ;;
  *) exit 0 ;;
esac

if [ ! -f "$file_path" ]; then
  exit 0
fi

root="${CLAUDE_PROJECT_DIR:-$(pwd)}"
biome="$root/node_modules/.bin/biome"

if [ ! -x "$biome" ]; then
  exit 0
fi

if [ ! -f "$root/biome.json" ] && [ ! -f "$root/biome.jsonc" ]; then
  exit 0
fi

if ! "$biome" format --write --no-errors-on-unmatched "$file_path" >/dev/null 2>&1; then
  echo "format-biome hook: Biome での整形に失敗しました: $file_path" >&2
fi

exit 0
