#!/bin/bash

LOG="$HOME/.cursor/hooks-debug.log"

INPUT=$(cat)

TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')
WORKSPACE_ROOTS=$(echo "$INPUT" | jq -r '.workspace_roots[]? // empty')

echo "$(date '+%Y-%m-%d %H:%M:%S') [PRE-GUARD] START - tool_name=$TOOL_NAME" >> "$LOG"
echo "$(date '+%Y-%m-%d %H:%M:%S') [PRE-GUARD] workspace_roots: $WORKSPACE_ROOTS" >> "$LOG"

PROTECTED=".oxlintrc.json .oxfmtrc.json lefthook.yml"
SENSITIVE_KEYS="TEST DATABASE_URL API_KEY SECRET TOKEN PASSWORD PRIVATE_KEY STRIPE OPENAI ANTHROPIC OPENROUTER"
BLOCKED_COMMANDS="printenv env"

# プロジェクト外かどうかを判定（workspace_roots を使う正しい方法）
is_outside_workspace() {
  local path="$1"
  [ -z "$path" ] && return 1

  # workspace_roots のどれかに含まれていればOK
  for root in $WORKSPACE_ROOTS; do
    case "$path" in
      "$root"/*|"$root") return 1 ;;  # inside → false
    esac
  done
  return 0  # outside → true
}

contains_protected() {
  local str="$1"
  for p in $PROTECTED; do
    if echo "$str" | grep -qF "$p"; then
      return 0
    fi
  done
  return 1
}

case "$TOOL_NAME" in
  Shell)
    COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty' 2>/dev/null || echo "")
    WORKING_DIR=$(echo "$INPUT" | jq -r '.tool_input.working_directory // .tool_input.cwd // empty' 2>/dev/null || echo "")

    echo "$(date '+%Y-%m-%d %H:%M:%S') [PRE-GUARD] Shell command: $COMMAND (working_dir=$WORKING_DIR)" >> "$LOG"

    # 1. 危険コマンド
    if echo "$COMMAND" | grep -qF -- "--no-verify"; then
      echo '{"allow":"deny","user_message":"--no-verify is prohibited. Fix the code to pass pre-commit hooks."}' >&1
      exit 2
    fi

    # 2. 保護ファイル
    if contains_protected "$COMMAND"; then
      echo '{"allow":"deny","user_message":"Modifying protected config files via shell is prohibited."}' >&1
      exit 2
    fi

    # 3. 機密環境変数
    for key in $SENSITIVE_KEYS; do
      if echo "$COMMAND" | grep -qF "$key"; then
        echo '{"allow":"deny","user_message":"Accessing sensitive environment variables is prohibited."}' >&1
        exit 2
      fi
    done

    # 4. printenv / env
    for cmd in $BLOCKED_COMMANDS; do
      if echo "$COMMAND" | grep -qwF "$cmd"; then
        echo '{"allow":"deny","user_message":"Accessing environment variables is prohibited."}' >&1
        exit 2
      fi
    done

    # 5. プロジェクト外アクセス（ls .. や ../file などをブロック）
    if echo "$COMMAND" | grep -qE '\.\./| \.\.|^\.\.' || \
       (echo "$COMMAND" | grep -qE '/Users/|/private/|/System/|/Library/' && ! echo "$COMMAND" | grep -qE "$(echo "$WORKSPACE_ROOTS" | head -1)"); then
      echo '{"allow":"deny","user_message":"Access outside project root is prohibited via shell."}' >&1
      exit 2
    fi
    ;;

  Read|Write|Delete)
    FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty' 2>/dev/null || echo "")

    echo "$(date '+%Y-%m-%d %H:%M:%S') [PRE-GUARD] File operation on: $FILE" >> "$LOG"

    if [ -n "$FILE" ] && is_outside_workspace "$FILE"; then
      echo '{"allow":"deny","user_message":"Access outside project root is prohibited."}' >&1
      exit 2
    fi

    if contains_protected "$(echo "$INPUT" | jq -c '.tool_input // empty')"; then
      echo '{"allow":"deny","user_message":"BLOCKED: Protected config file cannot be modified or accessed."}' >&1
      exit 2
    fi
    ;;
esac

echo '{"allow":"allow"}' >&1
echo "$(date '+%Y-%m-%d %H:%M:%S') [PRE-GUARD] END - ALLOWED" >> "$LOG"
exit 0
