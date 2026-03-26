#!/bin/bash

export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:$HOME/.local/share/pnpm:./node_modules/.bin:$PATH"

INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.toolName')
TOOL_ARGS=$(echo "$INPUT" | jq -r '.toolArgs')
CWD=$(echo "$INPUT" | jq -r '.cwd')
PROTECTED=".oxlintrc.json .oxfmtrc.json lefthook.yml"
SENSITIVE_KEYS="TEST DATABASE_URL API_KEY SECRET TOKEN PASSWORD PRIVATE_KEY STRIPE OPENAI ANTHROPIC OPENROUTER"
BLOCKED_COMMANDS="printenv env"

contains_protected() {
  local str="$1"
  for p in $PROTECTED; do
    if echo "$str" | grep -qF "$p"; then
      return 0
    fi
  done
  return 1
}

in_cwd() {
  local path="$1"
  case "$path" in
    "$CWD"/*|"$CWD") return 0 ;;
    "$HOME/.copilot"/*) return 0 ;;
    "$HOME/.agents"/*) return 0 ;;
    *) return 1 ;;
  esac
}

case "$TOOL_NAME" in
  bash)
    COMMAND=$(echo "$TOOL_ARGS" | jq -r '.command // empty' 2>/dev/null || echo "$TOOL_ARGS")

    # Block --no-verify
    if echo "$COMMAND" | grep -qF -- "--no-verify"; then
      echo '{"permissionDecision":"deny","permissionDecisionReason":"--no-verify is prohibited. Fix the code to pass pre-commit hooks."}'
      exit 0
    fi

    # Block writing to protected config files
    if contains_protected "$COMMAND"; then
      echo '{"permissionDecision":"deny","permissionDecisionReason":"Modifying protected config files via bash is prohibited."}'
      exit 0
    fi

    # Block sensitive env var access by key name
    for key in $SENSITIVE_KEYS; do
      if echo "$COMMAND" | grep -qF "$key"; then
        echo '{"permissionDecision":"deny","permissionDecisionReason":"Accessing sensitive environment variables is prohibited."}'
        exit 0
      fi
    done

    # Block printenv / env commands
    for cmd in $BLOCKED_COMMANDS; do
      if echo "$COMMAND" | grep -qwF "$cmd"; then
        echo '{"permissionDecision":"deny","permissionDecisionReason":"Accessing environment variables is prohibited."}'
        exit 0
      fi
    done
    ;;

  view|edit|create)
    # Block access outside project root
    FILE=$(echo "$TOOL_ARGS" | jq -r '.path // empty' 2>/dev/null || echo "")
    if [ -n "$FILE" ] && ! in_cwd "$FILE"; then
      echo '{"permissionDecision":"deny","permissionDecisionReason":"Access outside project root is prohibited."}'
      exit 0
    fi

    # Block protected config files
    if contains_protected "$TOOL_ARGS"; then
      echo '{"permissionDecision":"deny","permissionDecisionReason":"BLOCKED: Protected config file cannot be modified. Fix the code, not the linter config."}'
      exit 0
    fi
    ;;

  apply_patch)
    # Block access outside project root
    while IFS= read -r line; do
      FILE=$(echo "$line" | sed 's/.*File: //')
      if [ -n "$FILE" ] && ! in_cwd "$FILE"; then
        echo '{"permissionDecision":"deny","permissionDecisionReason":"Access outside project root is prohibited."}'
        exit 0
      fi
    done <<< "$(echo "$TOOL_ARGS" | grep -E '(Update|Add|Delete) File:')"

    # Block protected config files
    if contains_protected "$TOOL_ARGS"; then
      echo '{"permissionDecision":"deny","permissionDecisionReason":"BLOCKED: Protected config file cannot be modified. Fix the code, not the linter config."}'
      exit 0
    fi
    ;;
esac
