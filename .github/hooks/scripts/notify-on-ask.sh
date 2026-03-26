#!/bin/bash

INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.toolName')

# ASKツールの時だけ音を鳴らす
if [ "$TOOL_NAME" = "ask_user" ]; then
  afplay /System/Library/Sounds/Blow.aiff
fi

# 何も出力しなければ "allow" 扱いになる
exit 0
