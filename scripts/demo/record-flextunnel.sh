#!/usr/bin/env bash
# Records the split-screen flextunnel demos shown on /flextunnel: a tmux window
# with the server host on the left and the client host on the right, split
# into the client itself on top and a second shell on the client host below
# it. Driven by scripted keystrokes and captured with asciinema; everything on
# screen is real output from the two hosts and nothing is edited afterwards.
#
#   DEMO_SERVER=debian@server-host DEMO_CLIENT=debian@client-host \
#     scripts/demo/record-flextunnel.sh [--quick] [--install] [output.cast]
#
# The default scenario is the keyed setup, the counterpart of the ezvpn demo:
# the client makes a flexaccess-keys key pair, the server gets an identity key,
# the client's public key and a two-line config, and the client, configured
# with the server as a destination, reaches the server's loopback through its
# SOCKS5 port. It is written to public/demos/flextunnel.cast. --quick records
# a `--quick` session instead (each side enters the other's endpoint ID, no
# keys and no config; the client's live panel runs on top), written to
# public/demos/flextunnel-quick.cast.
#
# Needs tmux, node and asciinema (3.x) here, and on both hosts: Linux, python3,
# curl, and ssh access from this machine (no root: neither end of flextunnel
# needs it; sudo is only used for DEMO_DISABLE_IPV6_IFACE). Without --install
# the hosts must already have `flextunnel` (both) and, for the keyed scenario,
# `flexaccess-keys` (client) on the login shell's PATH, which is how to record
# against an unreleased build; with --install the recording starts with the
# install one-liners, so it shows the latest release, and the installed
# binaries are removed from ~/.local/bin before and after.
#
# Environment:
#   DEMO_SERVER, DEMO_CLIENT  ssh destinations (required)
#   DEMO_SSH_OPTS             extra ssh options, e.g. "-i ~/.ssh/some_key"
#   DEMO_DISABLE_IPV6_IFACE   interface to turn IPv6 off on while the tunnel is
#                             up, on both hosts (e.g. eth0). Keeps global IPv6
#                             paths out of the quick panel's connection-path
#                             view.
#
# The hosts work in ~/demo, which is wiped before and after, along with the
# keyed server's lock file. The keys generated on camera are deleted
# afterwards, and quick mode keeps its identities in memory only, so nothing
# shown stays valid.

set -euo pipefail

usage() { sed -n '2,/^$/s/^# \{0,1\}//p' "$0"; exit "${1:-0}"; }

INSTALL=0
QUICK=0
OUT=""
for arg in "$@"; do
  case "$arg" in
    --install) INSTALL=1 ;;
    --quick) QUICK=1 ;;
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
if [ "$QUICK" = 1 ]; then
  OUT="${OUT:-$REPO_DIR/public/demos/flextunnel-quick.cast}"
  TITLE="flextunnel --quick demo"
else
  OUT="${OUT:-$REPO_DIR/public/demos/flextunnel.cast}"
  TITLE="flextunnel demo"
fi
mkdir -p "$(dirname "$OUT")"

# The server pane on the left and the client's two panes stacked on the
# right, 80 columns each with a one-column divider, and one border line (the
# pane titles) above. The quick panel needs about 20 rows to show everything.
PANE_COLS=80
PANE_ROWS=38
CLIENT_ROWS=20
COLS=$((PANE_COLS * 2 + 1))
ROWS=$((PANE_ROWS + 1))
# The panes are narrow, so the hosts' own prompt (user@host:dir) gives way to
# a short one that leaves the commands room.
DEMO_PS1='\[\e[32m\]\h\$\[\e[0m\] '
SOCK="flextunnel-demo-$$"
SOCKS_PORT=1080
PAGE_PORT=8000
FLEXTUNNEL_INSTALL="curl -sSL https://flexaccessdev.github.io/flextunnel/install.sh | bash"
KEYS_INSTALL="curl -sSL https://flexaccessdev.github.io/flexaccess-keys/install.sh | bash"

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
SERVER_ID=""

reset_hosts() {
  local server_extra=":" client_extra=":"
  if [ "$INSTALL" = 1 ]; then
    server_extra='rm -f ~/.local/bin/flextunnel'
    client_extra='rm -f ~/.local/bin/flextunnel ~/.local/bin/flexaccess-keys'
  fi
  # A keyed server takes a lock file named after its endpoint id.
  [ -n "$SERVER_ID" ] && server_extra+="; rm -f ~/.config/flextunnel/server-${SERVER_ID:0:16}.lock"
  on_client "pkill -x flextunnel; rm -rf ~/demo; $client_extra" || true
  on_server "pkill -x flextunnel; $STOP_PAGE; rm -rf ~/demo; $server_extra" || true
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
CLIENT_PANE="demo:0.1"
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
# With --install IPv6 stays on until the installers have run: a host whose
# resolver is reached over IPv6 cannot download anything without it.
[ "$INSTALL" = 1 ] || set_ipv6 1
on_server 'mkdir -p ~/demo'
on_client 'mkdir -p ~/demo'
if [ "$INSTALL" = 0 ]; then
  on_server 'bash -lc "command -v flextunnel" >/dev/null' \
    || { echo "flextunnel missing on server (or pass --install)" >&2; exit 1; }
  client_tools="command -v flextunnel"
  [ "$QUICK" = 1 ] || client_tools+=" && command -v flexaccess-keys"
  on_client "bash -lc '$client_tools' >/dev/null" \
    || { echo "flextunnel or flexaccess-keys missing on client (or pass --install)" >&2; exit 1; }
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
tm split-window -v -t "$CLIENT_PANE" "$(ssh_cmd "$DEMO_CLIENT")"
tm resize-pane -t "$CLIENT_PANE" -y "$CLIENT_ROWS"
tm select-pane -t "$SERVER_PANE" -T "server · $SERVER_HOST"
tm select-pane -t "$CLIENT_PANE" -T "client · $CLIENT_HOST"
tm select-pane -t "$SHELL_PANE" -T "client · $CLIENT_HOST · another shell"
for pane in "$SERVER_PANE" "$CLIENT_PANE" "$SHELL_PANE"; do
  wait_prompt "$pane"
  tm send-keys -t "$pane" -l -- " PS1='$DEMO_PS1'"
  tm send-keys -t "$pane" Enter
  wait_prompt "$pane"
  clear_pane "$pane"
done
tm select-pane -t "$CLIENT_PANE"

echo "recording to $OUT ..."
TERM=xterm-256color asciinema rec --quiet --headless --window-size "${COLS}x${ROWS}" \
  --output-format asciicast-v2 --overwrite --title "$TITLE" \
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
  type_text "$CLIENT_PANE" "$FLEXTUNNEL_INSTALL"
  wait "$typing"
  tm send-keys -t "$SERVER_PANE" Enter
  tm send-keys -t "$CLIENT_PANE" Enter
  wait_for "$SERVER_PANE" 'Installation completed' 120
  wait_for "$CLIENT_PANE" 'Installation completed' 120
  wait_prompt "$SERVER_PANE"
  wait_prompt "$CLIENT_PANE"
  if [ "$QUICK" = 0 ]; then
    pause 1.5
    run "$CLIENT_PANE" "$KEYS_INSTALL"
    wait_for "$CLIENT_PANE" 'flexaccess-keys.*from your terminal' 120
    wait_prompt "$CLIENT_PANE"
  fi
  pause 2.5
  clear_pane "$SERVER_PANE"
  clear_pane "$CLIENT_PANE"
  set_ipv6 1
  pause 1
fi

# Server: something to reach that nothing off the host can.
start_page() {
  focus "$SERVER_PANE"
  run "$SERVER_PANE" "# server: a page that only this host's loopback serves"
  pause 0.6
  run "$SERVER_PANE" 'echo "hello from $(hostname)" > index.html'
  wait_prompt "$SERVER_PANE"
  run "$SERVER_PANE" "python3 -m http.server -b 127.0.0.1 $PAGE_PORT >/dev/null 2>&1 &"
  wait_prompt "$SERVER_PANE"
  pause 2
}

# Client, second shell: the server's loopback page, through the tunnel.
fetch_page() {
  local destination="$1"
  focus "$SHELL_PANE"
  run "$SHELL_PANE" "# client: the server's own loopback, through the tunnel"
  pause 0.6
  run "$SHELL_PANE" "curl -x socks5h://127.0.0.1:$SOCKS_PORT http://$destination.localhost.flextunnel.internal:$PAGE_PORT/"
  wait_for "$SHELL_PANE" "^hello from $SERVER_HOST" 30
  wait_prompt "$SHELL_PANE"
  pause 3
}

keyed_demo() {
  # 1. Client: key pair.
  focus "$CLIENT_PANE"
  run "$CLIENT_PANE" "# client: make a key pair; the public half goes to the server"
  pause 0.6
  run "$CLIENT_PANE" "flexaccess-keys generate-auth-key \"$CLIENT_HOST\" -o client.key"
  wait_prompt "$CLIENT_PANE"
  pause 0.8
  run "$CLIENT_PANE" "flexaccess-keys show-auth-key --private-key-file client.key"
  wait_for "$CLIENT_PANE" '^ed25519-pub:'
  wait_prompt "$CLIENT_PANE"
  local client_pub
  client_pub="$(on_client 'bash -lc "flexaccess-keys show-auth-key --private-key-file ~/demo/client.key"')"
  [[ "$client_pub" == ed25519-pub:* ]] || { echo "could not read the client public key" >&2; exit 1; }
  pause 2

  # 2. Server: a page to reach, then identity, authorized key, config, start.
  start_page
  run "$SERVER_PANE" "# server: an identity key, the client's public key, a two-line config"
  pause 0.6
  run "$SERVER_PANE" "flextunnel generate-iroh-key -o server.key"
  wait_for "$SERVER_PANE" '^EndpointId: [0-9a-f]{64}'
  wait_prompt "$SERVER_PANE"
  SERVER_ID="$(read_id "$SERVER_PANE" '^EndpointId')"
  [[ "$SERVER_ID" =~ ^[0-9a-f]{64}$ ]] || { echo "could not read the server EndpointId" >&2; exit 1; }
  pause 1.5
  type_text "$SERVER_PANE" "echo '"
  paste_text "$SERVER_PANE" "$client_pub"
  run "$SERVER_PANE" "' > authorized_keys"
  wait_prompt "$SERVER_PANE"
  pause 1
  run "$SERVER_PANE" "cat > server.toml <<EOF"
  local line
  for line in \
    'secret_file = "./server.key"' \
    'authorized_keys_file = "./authorized_keys"' \
    'EOF'; do
    pause 0.2
    run "$SERVER_PANE" "$line"
  done
  wait_prompt "$SERVER_PANE"
  pause 1.2
  clear_pane "$SERVER_PANE"
  run "$SERVER_PANE" "flextunnel server start -c server.toml"
  wait_for "$SERVER_PANE" 'server Node ID: [0-9a-f]{64}' 60
  pause 3

  # 3. Client: the server as a destination, dialled by its id; start.
  focus "$CLIENT_PANE"
  clear_pane "$CLIENT_PANE"
  run "$CLIENT_PANE" "# client: dial the server by its id -- no IP address, no open port"
  pause 0.6
  run "$CLIENT_PANE" "cat > client.toml <<EOF"
  for line in \
    "socks_port = $SOCKS_PORT" \
    'auth_key_file = "./client.key"' \
    '[[destinations]]' \
    "name = \"$SERVER_HOST\""; do
    pause 0.2
    run "$CLIENT_PANE" "$line"
  done
  pause 0.2
  type_text "$CLIENT_PANE" 'server_node_id = "'
  paste_text "$CLIENT_PANE" "$SERVER_ID"
  run "$CLIENT_PANE" '"'
  pause 0.2
  run "$CLIENT_PANE" "EOF"
  wait_prompt "$CLIENT_PANE"
  pause 1.2
  clear_pane "$CLIENT_PANE"
  run "$CLIENT_PANE" "flextunnel client start -c client.toml"
  wait_for "$CLIENT_PANE" 'connected on demand' 30
  pause 3

  # 4. Client, second shell: the first request connects the destination.
  fetch_page "$SERVER_HOST"
  wait_for "$CLIENT_PANE" "$SERVER_HOST: authenticated" 30
  wait_for "$SERVER_PANE" 'authenticated' 30
  pause 2

  # 5. Client: stop.
  focus "$CLIENT_PANE"
  tm send-keys -t "$CLIENT_PANE" C-c
  wait_for "$CLIENT_PANE" 'stopping client' 30
  wait_prompt "$CLIENT_PANE"
  pause 4
}

quick_demo() {
  # 1. Server: a page to reach.
  start_page
  clear_pane "$SERVER_PANE"

  # 2. Client: start first; it prints its id, the credential the server admits.
  focus "$CLIENT_PANE"
  run "$CLIENT_PANE" "# client: no keys, no config -- it prints its id for the server"
  pause 0.6
  run "$CLIENT_PANE" "flextunnel client start --quick"
  wait_for "$CLIENT_PANE" '^Server EndpointId \(shown'
  local client_id
  client_id="$(read_id "$CLIENT_PANE" 'client EndpointId')"
  [[ "$client_id" =~ ^[0-9a-f]{64}$ ]] || { echo "could not read the client EndpointId" >&2; exit 1; }
  pause 2.5

  # 3. Server: admit that one id; it prints its own.
  focus "$SERVER_PANE"
  run "$SERVER_PANE" "# server: admit exactly that client -- no keys, no config here either"
  pause 0.6
  run "$SERVER_PANE" "flextunnel server start --quick"
  wait_for "$SERVER_PANE" '^Client EndpointId \(shown'
  pause 1
  paste_text "$SERVER_PANE" "$client_id"
  enter "$SERVER_PANE"
  wait_for "$SERVER_PANE" '^  Server EndpointId: [0-9a-f]{64}'
  local server_id
  server_id="$(read_id "$SERVER_PANE" 'Server EndpointId')"
  [[ "$server_id" =~ ^[0-9a-f]{64}$ ]] || { echo "could not read the server EndpointId" >&2; exit 1; }
  wait_for "$SERVER_PANE" "enter this server's EndpointId" 60
  pause 2.5

  # 4. Client: dial the server by its id and open a SOCKS5 port; the panel
  #    takes over the pane.
  focus "$CLIENT_PANE"
  paste_text "$CLIENT_PANE" "$server_id"
  enter "$CLIENT_PANE"
  wait_for "$CLIENT_PANE" '^SOCKS5 port'
  pause 0.5
  run "$CLIENT_PANE" "$SOCKS_PORT"
  wait_for "$CLIENT_PANE" '^HTTP proxy port'
  pause 0.8
  enter "$CLIENT_PANE"
  wait_for "$CLIENT_PANE" '● connected' 60
  wait_for "$SERVER_PANE" 'authenticated' 30
  pause 3

  # 5. Client, second shell: the quick destination is named `quick`.
  fetch_page quick

  # 6. Client panel: the connection path, then quit, which disconnects.
  focus "$CLIENT_PANE"
  tm send-keys -t "$CLIENT_PANE" p
  for _ in $(seq 30); do
    tm capture-pane -p -t "$CLIENT_PANE" | grep -Eq 'Direct .*active' && break
    pause 1
    tm send-keys -t "$CLIENT_PANE" r
  done
  wait_for "$CLIENT_PANE" 'Direct .*active' 5
  pause 5
  tm send-keys -t "$CLIENT_PANE" Escape
  pause 1.5
  tm send-keys -t "$CLIENT_PANE" q
  wait_prompt "$CLIENT_PANE"
  pause 1.5

  # 7. Server: stop it; nothing was written to disk.
  focus "$SERVER_PANE"
  tm send-keys -t "$SERVER_PANE" C-c
  wait_for "$SERVER_PANE" 'stopping server' 30
  wait_prompt "$SERVER_PANE"
  pause 4
}

if [ "$QUICK" = 1 ]; then quick_demo; else keyed_demo; fi

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
