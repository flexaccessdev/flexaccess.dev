#!/usr/bin/env bash
# Records the split-screen flextunnel --quick demo shown on /flextunnel: a tmux
# window with the server host on the left and the client host on the right,
# where the quick client's live panel runs on top and a second shell on the
# client host sits below it. Driven by scripted keystrokes and captured with
# asciinema; everything on screen is real output from the two hosts and
# nothing is edited afterwards.
#
#   DEMO_SERVER=debian@server-host DEMO_CLIENT=debian@client-host \
#     scripts/demo/record-flextunnel.sh [--install] [output.cast]
#
# Needs tmux, node and asciinema (3.x) here, and on both hosts: Linux, python3,
# curl, and ssh access from this machine (no root: neither end of flextunnel
# needs it; sudo is only used for DEMO_DISABLE_IPV6_IFACE). Without --install
# both hosts must already have `flextunnel` on the login shell's PATH, which
# is how to record against an unreleased build; with --install the recording
# starts with the install one-liner, so it shows the latest release, and the
# installed binary is removed from ~/.local/bin before and after.
#
# Environment:
#   DEMO_SERVER, DEMO_CLIENT  ssh destinations (required)
#   DEMO_SSH_OPTS             extra ssh options, e.g. "-i ~/.ssh/some_key"
#   DEMO_DISABLE_IPV6_IFACE   interface to turn IPv6 off on while the tunnel is
#                             up, on both hosts (e.g. eth0). Keeps global IPv6
#                             paths out of the panel's connection-path view.
#
# The hosts work in ~/demo, which is wiped before and after. Quick mode keeps
# its identities in memory only, so no id shown stays valid after the session.

set -euo pipefail

usage() { sed -n '2,/^$/s/^# \{0,1\}//p' "$0"; exit "${1:-0}"; }

INSTALL=0
OUT=""
for arg in "$@"; do
  case "$arg" in
    --install) INSTALL=1 ;;
    -h|--help) usage ;;
    -*) echo "unknown option: $arg" >&2; usage 1 ;;
    *) OUT="$arg" ;;
  esac
done

: "${DEMO_SERVER:?set DEMO_SERVER to the server ssh destination}"
: "${DEMO_CLIENT:?set DEMO_CLIENT to the client ssh destination}"
read -r -a SSH_OPTS <<<"${DEMO_SSH_OPTS:-}"
SSH_OPTS+=(-o BatchMode=yes -o ConnectTimeout=10)

REPO_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
OUT="${OUT:-$REPO_DIR/public/demos/flextunnel.cast}"
mkdir -p "$(dirname "$OUT")"

# The server pane on the left and the client's two panes stacked on the
# right, 80 columns each with a one-column divider, and one border line (the
# pane titles) above. The quick panel needs about 20 rows to show everything.
PANE_COLS=80
PANE_ROWS=38
PANEL_ROWS=20
COLS=$((PANE_COLS * 2 + 1))
ROWS=$((PANE_ROWS + 1))
# The panes are narrow, so the hosts' own prompt (user@host:dir) gives way to
# a short one that leaves the commands room.
DEMO_PS1='\[\e[32m\]\h\$\[\e[0m\] '
SOCK="flextunnel-demo-$$"
SOCKS_PORT=1080
PAGE_PORT=8000
FLEXTUNNEL_INSTALL="curl -sSL https://flexaccessdev.github.io/flextunnel/install.sh | bash"

for tool in tmux asciinema ssh node; do
  command -v "$tool" >/dev/null || { echo "missing tool: $tool" >&2; exit 1; }
done

on_server() { ssh "${SSH_OPTS[@]}" "$DEMO_SERVER" "$@"; }
on_client() { ssh "${SSH_OPTS[@]}" "$DEMO_CLIENT" "$@"; }

set_ipv6() {  # set_ipv6 <0|1>: 1 disables IPv6 on DEMO_DISABLE_IPV6_IFACE
  [ -n "${DEMO_DISABLE_IPV6_IFACE:-}" ] || return 0
  local cmd="sudo sysctl -qw net.ipv6.conf.${DEMO_DISABLE_IPV6_IFACE}.disable_ipv6=$1"
  on_server "$cmd" || true
  on_client "$cmd" || true
}

# The page server is started on camera, so it is found by its arguments.
STOP_PAGE="ps -eo pid,args | awk '\$2 ~ /python3/ && /http.server -b 127.0.0.1 $PAGE_PORT/ { print \$1 }' | xargs -r kill"
UNINSTALL='rm -f ~/.local/bin/flextunnel'

reset_hosts() {
  local extra=":"
  [ "$INSTALL" = 1 ] && extra="$UNINSTALL"
  on_client "pkill -x flextunnel; rm -rf ~/demo; $extra" || true
  on_server "pkill -x flextunnel; $STOP_PAGE; rm -rf ~/demo; $extra" || true
}

REC_PID=""
cleanup() {
  tm kill-server 2>/dev/null || true
  [ -n "$REC_PID" ] && wait "$REC_PID" 2>/dev/null || true
  reset_hosts
  set_ipv6 0
}
trap cleanup EXIT

# --- keystroke helpers ------------------------------------------------------

SERVER_PANE="demo:0.0"
PANEL_PANE="demo:0.1"
SHELL_PANE="demo:0.2"

# shellcheck source=lib.sh
source "$REPO_DIR/scripts/demo/lib.sh"

# The 64-hex-digit id that follows a label on a pane, e.g. "Server EndpointId:".
read_id() {
  tm capture-pane -p -J -t "$1" | grep -oE "$2: [0-9a-f]{64}" | tail -n 1 | grep -oE '[0-9a-f]{64}$'
}

# --- setup (off camera) -----------------------------------------------------

echo "preparing hosts..."
reset_hosts
# With --install IPv6 stays on until the installer has run: a host whose
# resolver is reached over IPv6 cannot download anything without it.
[ "$INSTALL" = 1 ] || set_ipv6 1
on_server 'mkdir -p ~/demo'
on_client 'mkdir -p ~/demo'
if [ "$INSTALL" = 0 ]; then
  for side in on_server on_client; do
    "$side" 'bash -lc "command -v flextunnel" >/dev/null' \
      || { echo "flextunnel missing (${side#on_}) (or pass --install)" >&2; exit 1; }
  done
fi
SERVER_HOST="$(on_server hostname)"
CLIENT_HOST="$(on_client hostname)"

ssh_cmd() {
  printf 'ssh -t %s %q %q' "${SSH_OPTS[*]}" "$1" 'cd ~/demo && exec bash -l'
}

tm -f /dev/null new-session -d -s demo -x "$COLS" -y "$ROWS" "$(ssh_cmd "$DEMO_SERVER")"
tm set -g status off
tm set -g default-terminal tmux-256color
tm set -g pane-border-status top
tm set -g pane-border-format ' #{pane_title} '
tm set -g pane-border-style 'fg=brightblack'
tm set -g pane-active-border-style 'fg=green'
tm split-window -h -t demo "$(ssh_cmd "$DEMO_CLIENT")"
tm resize-pane -t "$SERVER_PANE" -x "$PANE_COLS"
tm split-window -v -t "$PANEL_PANE" "$(ssh_cmd "$DEMO_CLIENT")"
tm resize-pane -t "$PANEL_PANE" -y "$PANEL_ROWS"
tm select-pane -t "$SERVER_PANE" -T "server · $SERVER_HOST"
tm select-pane -t "$PANEL_PANE" -T "client · $CLIENT_HOST"
tm select-pane -t "$SHELL_PANE" -T "client · $CLIENT_HOST · another shell"
for pane in "$SERVER_PANE" "$PANEL_PANE" "$SHELL_PANE"; do
  wait_prompt "$pane"
  tm send-keys -t "$pane" -l -- " PS1='$DEMO_PS1'"
  tm send-keys -t "$pane" Enter
  wait_prompt "$pane"
  clear_pane "$pane"
done
tm select-pane -t "$PANEL_PANE"

echo "recording to $OUT ..."
TERM=xterm-256color asciinema rec --quiet --headless --window-size "${COLS}x${ROWS}" \
  --output-format asciicast-v2 --overwrite --title "flextunnel --quick demo" \
  --command "tmux -L $SOCK attach -t demo" "$OUT" &
REC_PID=$!
for _ in $(seq 50); do
  [ "$(tm list-clients 2>/dev/null | wc -l)" -ge 1 ] && break
  sleep 0.1
done
pause 2

# --- the demo (on camera) ---------------------------------------------------

if [ "$INSTALL" = 1 ]; then
  # Both hosts install flextunnel at the same time, without root.
  type_text "$SERVER_PANE" "$FLEXTUNNEL_INSTALL" &
  typing=$!
  type_text "$PANEL_PANE" "$FLEXTUNNEL_INSTALL"
  wait "$typing"
  tm send-keys -t "$SERVER_PANE" Enter
  tm send-keys -t "$PANEL_PANE" Enter
  wait_for "$SERVER_PANE" 'Installation completed' 120
  wait_for "$PANEL_PANE" 'Installation completed' 120
  wait_prompt "$SERVER_PANE"
  wait_prompt "$PANEL_PANE"
  pause 2.5
  clear_pane "$SERVER_PANE"
  clear_pane "$PANEL_PANE"
  set_ipv6 1
  pause 1
fi

# 1. Server: something to reach that nothing off the host can.
focus "$SERVER_PANE"
run "$SERVER_PANE" "# server: a page that only this host's loopback serves"
pause 0.6
run "$SERVER_PANE" 'echo "hello from $(hostname)" > index.html'
wait_prompt "$SERVER_PANE"
run "$SERVER_PANE" "python3 -m http.server -b 127.0.0.1 $PAGE_PORT >/dev/null 2>&1 &"
wait_prompt "$SERVER_PANE"
pause 2
clear_pane "$SERVER_PANE"

# 2. Client: start first; it prints its id, the credential the server admits.
focus "$PANEL_PANE"
run "$PANEL_PANE" "# client: no keys, no config -- it prints its id for the server"
pause 0.6
run "$PANEL_PANE" "flextunnel client start --quick"
wait_for "$PANEL_PANE" '^Server EndpointId \(shown'
CLIENT_ID="$(read_id "$PANEL_PANE" 'client EndpointId')"
[[ "$CLIENT_ID" =~ ^[0-9a-f]{64}$ ]] || { echo "could not read the client EndpointId" >&2; exit 1; }
pause 2.5

# 3. Server: admit that one id; it prints its own.
focus "$SERVER_PANE"
run "$SERVER_PANE" "# server: admit exactly that client -- no keys, no config here either"
pause 0.6
run "$SERVER_PANE" "flextunnel server start --quick"
wait_for "$SERVER_PANE" '^Client EndpointId \(shown'
pause 1
paste_text "$SERVER_PANE" "$CLIENT_ID"
enter "$SERVER_PANE"
wait_for "$SERVER_PANE" '^  Server EndpointId: [0-9a-f]{64}'
SERVER_ID="$(read_id "$SERVER_PANE" 'Server EndpointId')"
[[ "$SERVER_ID" =~ ^[0-9a-f]{64}$ ]] || { echo "could not read the server EndpointId" >&2; exit 1; }
wait_for "$SERVER_PANE" "enter this server's EndpointId" 60
pause 2.5

# 4. Client: dial the server by its id and open a SOCKS5 port; the panel
#    takes over the pane.
focus "$PANEL_PANE"
paste_text "$PANEL_PANE" "$SERVER_ID"
enter "$PANEL_PANE"
wait_for "$PANEL_PANE" '^SOCKS5 port'
pause 0.5
run "$PANEL_PANE" "$SOCKS_PORT"
wait_for "$PANEL_PANE" '^HTTP proxy port'
pause 0.8
enter "$PANEL_PANE"
wait_for "$PANEL_PANE" '● connected' 60
wait_for "$SERVER_PANE" 'authenticated' 30
pause 3

# 5. Client, second shell: the server's loopback page, through the tunnel.
focus "$SHELL_PANE"
run "$SHELL_PANE" "# client: the server's own loopback, through the tunnel"
pause 0.6
run "$SHELL_PANE" "curl -x socks5h://127.0.0.1:$SOCKS_PORT http://quick.localhost.flextunnel.internal:$PAGE_PORT/"
wait_for "$SHELL_PANE" "^hello from $SERVER_HOST" 30
wait_prompt "$SHELL_PANE"
pause 3

# 6. Client panel: the connection path, then quit, which disconnects.
focus "$PANEL_PANE"
tm send-keys -t "$PANEL_PANE" p
for _ in $(seq 30); do
  tm capture-pane -p -t "$PANEL_PANE" | grep -Eq 'Direct .*active' && break
  pause 1
  tm send-keys -t "$PANEL_PANE" r
done
wait_for "$PANEL_PANE" 'Direct .*active' 5
pause 5
tm send-keys -t "$PANEL_PANE" Escape
pause 1.5
tm send-keys -t "$PANEL_PANE" q
wait_prompt "$PANEL_PANE"
pause 1.5

# 7. Server: stop it; nothing was written to disk.
focus "$SERVER_PANE"
tm send-keys -t "$SERVER_PANE" C-c
wait_for "$SERVER_PANE" 'stopping server' 30
wait_prompt "$SERVER_PANE"
pause 4

# --- finish -----------------------------------------------------------------

tm kill-server
wait "$REC_PID" || true
REC_PID=""

# Trim tmux's teardown off the end, and refuse to keep a recording that shows
# an address from outside the private ranges.
if ! node "$REPO_DIR/scripts/demo/finish-cast.mjs" "$OUT"; then
  mv "$OUT" "$OUT.rejected"
  echo "not keeping the recording (left at $OUT.rejected)" >&2
  exit 1
fi

echo "done: $OUT ($(wc -c <"$OUT") bytes)"
