# shellcheck shell=bash
# Keystroke helpers shared by the demo recorders (record-*.sh). They drive a
# tmux server on socket "$SOCK", typing into panes and waiting on what the
# panes show. Sourced, not run.

tm() { tmux -L "$SOCK" "$@"; }

pause() { sleep "$1"; }

focus() { tm select-pane -t "$1"; pause 0.5; }

# Type text one key at a time, at a human-ish uneven pace.
type_text() {
  local pane="$1" text="$2" i ch
  for ((i = 0; i < ${#text}; i++)); do
    ch="${text:i:1}"
    [ "$ch" = ";" ] && ch='\;'  # a bare ; is tmux's own command separator
    tm send-keys -t "$pane" -l -- "$ch"
    sleep "0.0$((RANDOM % 5 + 2))"
  done
}

# Paste text in one go, the way a copied key or id arrives.
paste_text() { pause 0.3; tm send-keys -t "$1" -l -- "$2"; pause 0.5; }

enter() { pause 0.4; tm send-keys -t "$1" Enter; }

run() { type_text "$1" "$2"; enter "$1"; }

# Wait until the pane shows a line matching the regex.
wait_for() {
  local pane="$1" regex="$2" timeout="${3:-30}" i
  for ((i = 0; i < timeout * 5; i++)); do
    if tm capture-pane -p -J -t "$pane" | grep -Eq -- "$regex"; then return 0; fi
    sleep 0.2
  done
  echo "timed out waiting for /$regex/ in $pane:" >&2
  tm capture-pane -p -J -t "$pane" >&2
  exit 1
}

# Wait for the shell prompt to come back after a command: the last non-blank
# line of the pane is a bare prompt.
wait_prompt() {
  local pane="$1" timeout="${2:-30}" i
  pause 0.3
  for ((i = 0; i < timeout * 5; i++)); do
    if tm capture-pane -p -t "$pane" | awk 'NF { last = $0 } END { exit last ~ /\$ ?$/ ? 0 : 1 }'; then
      return 0
    fi
    sleep 0.2
  done
  echo "timed out waiting for a prompt in $pane" >&2
  exit 1
}

clear_pane() { tm send-keys -t "$1" C-l; pause 0.2; }
