# .github/hooks/scripts/notify-on-ask.sh
#!/bin/bash
INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.toolName')

echo "$(date): $TOOL_NAME" >> /tmp/copilot-tools.log

# ASKツールの時だけ音を鳴らす
if [ "$TOOL_NAME" = "ask_user" ] || [ "$TOOL_NAME" = "apply_patch" ] || [ "$TOOL_NAME" = "edit" ] || [ "$TOOL_NAME" = "create" ]; then
  afplay /System/Library/Sounds/Frog.aiff
fi

# 何も出力しなければ "allow" 扱いになる
exit 0
