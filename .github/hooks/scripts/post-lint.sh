#!/bin/bash

export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:$HOME/.local/share/pnpm:./node_modules/.bin:$PATH"

INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.toolName')
TOOL_ARGS=$(echo "$INPUT" | jq -r '.toolArgs')

case "$TOOL_NAME" in
  edit|create|apply_patch) ;;
  *) exit 0 ;;
esac

# apply_patchはパッチ文字列からパスを抽出、edit/createはJSONから取得
case "$TOOL_NAME" in
  apply_patch)
    FILE=$(echo "$TOOL_ARGS" | grep -oE 'Update File: \S+' | awk '{print $NF}')
    ;;
  *)
    FILE=$(echo "$TOOL_ARGS" | jq -r '.path // empty' 2>/dev/null || echo "")
    ;;
esac

case "$FILE" in
  *.ts|*.tsx|*.js|*.jsx) ;;
  *) exit 0 ;;
esac

pnpm oxlint --fix "$FILE" >/dev/null 2>&1 || true
pnpm oxfmt "$FILE" >/dev/null 2>&1 || true
