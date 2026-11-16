#!/usr/bin/env bash
# Records the split-screen ezvpn demo shown on /ezvpn: a tmux window with the
# server host on the left and the client host on the right, driven by scripted
# keystrokes and captured with asciinema. Everything on screen is real output
# from the two hosts; nothing is edited afterwards.
#
#   DEMO_SERVER=debian@server-host DEMO_CLIENT=debian@client-host \
#     scripts/demo/record-ezvpn.sh [--install] [output.cast]
#
# Needs tmux, node and asciinema (3.x) here, and on both hosts: Linux, passwordless
# sudo, and ssh access from this machine. Without --install the hosts must
# already have `ezvpn` (both) and `flexaccess-keys` (client) installed, which is
# how to record against an unreleased build; with --install the recording
# starts with the install one-liners and so shows the latest release.
#
# Environment:
#   DEMO_SERVER, DEMO_CLIENT  ssh destinations (required)
#   DEMO_SSH_OPTS             extra ssh options, e.g. "-i ~/.ssh/some_key"
#   DEMO_DISABLE_IPV6_IFACE   interface to turn IPv6 off on while the tunnel is
#                             up, on both hosts (e.g. eth0). Keeps a global
#                             IPv6 address out of `ezvpn client status`.
#
# The hosts work in ~/demo, which is wiped before and after. The keys generated
# on camera are deleted afterwards, so nothing shown stays valid.

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
OUT="${OUT:-$REPO_DIR/public/demos/ezvpn.cast}"
mkdir -p "$(dirname "$OUT")"

# Two panes side by side with a one-column divider between them, and one
# border line (the pane titles) above.
PANE_COLS=80
PANE_ROWS=28
COLS=$((PANE_COLS * 2 + 1))
ROWS=$((PANE_ROWS + 1))
# The panes are narrow, so the hosts' own prompt (user@host:dir) gives way to
# a short one that leaves the commands room.
DEMO_PS1='\[\e[32m\]\h\$\[\e[0m\] '
SOCK="ezvpn-demo-$$"
VPN_NET="10.0.0.0/24"
VPN_SERVER_IP="10.0.0.1"
EZVPN_INSTALL="curl -sSL https://flexaccessdev.github.io/ezvpn/install.sh | sudo bash"
KEYS_INSTALL="curl -sSL https://flexaccessdev.github.io/flexaccess-keys/install.sh | bash"

for tool in tmux asciinema ssh node; do
  command -v "$tool" >/dev/null || { echo "missing tool: $tool" >&2; exit 1; }
done

on_server() { ssh "${SSH_OPTS[@]}" "$DEMO_SERVER" "$@"; }
on_client() { ssh "${SSH_OPTS[@]}" "$DEMO_CLIENT" "$@"; }
tm() { tmux -L "$SOCK" "$@"; }

set_ipv6() {  # set_ipv6 <0|1>: 1 disables IPv6 on DEMO_DISABLE_IPV6_IFACE
  [ -n "${DEMO_DISABLE_IPV6_IFACE:-}" ] || return 0
  local cmd="sudo sysctl -qw net.ipv6.conf.${DEMO_DISABLE_IPV6_IFACE}.disable_ipv6=$1"
  on_server "$cmd" || true
  on_client "$cmd" || true
}

reset_hosts() {
  on_client 'sudo ezvpn client stop >/dev/null 2>&1; rm -rf ~/demo' || true
  on_server 'sudo pkill -x ezvpn; rm -rf ~/demo' || true
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

# --- setup (off camera) -----------------------------------------------------

echo "preparing hosts..."
reset_hosts
# With --install IPv6 stays on until the installers have run: a host whose
# resolver is reached over IPv6 cannot download anything without it.
[ "$INSTALL" = 1 ] || set_ipv6 1
on_server 'mkdir -p ~/demo'
on_client 'mkdir -p ~/demo'
if [ "$INSTALL" = 0 ]; then
  on_server 'command -v ezvpn >/dev/null' || { echo "ezvpn missing on server (or pass --install)" >&2; exit 1; }
  on_client 'command -v ezvpn >/dev/null && bash -lc "command -v flexaccess-keys" >/dev/null' \
    || { echo "ezvpn or flexaccess-keys missing on client (or pass --install)" >&2; exit 1; }
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
tm select-pane -t "$SERVER_PANE" -T "server · $SERVER_HOST"
tm select-pane -t "$CLIENT_PANE" -T "client · $CLIENT_HOST"
for pane in "$SERVER_PANE" "$CLIENT_PANE"; do
  wait_prompt "$pane"
  tm send-keys -t "$pane" -l -- " PS1='$DEMO_PS1'"
  tm send-keys -t "$pane" Enter
  wait_prompt "$pane"
  clear_pane "$pane"
done
tm select-pane -t "$CLIENT_PANE"

echo "recording to $OUT ..."
TERM=xterm-256color asciinema rec --quiet --headless --window-size "${COLS}x${ROWS}" \
  --output-format asciicast-v2 --overwrite --title "ezvpn demo" \
  --command "tmux -L $SOCK attach -t demo" "$OUT" &
REC_PID=$!
for _ in $(seq 50); do
  [ "$(tm list-clients 2>/dev/null | wc -l)" -ge 1 ] && break
  sleep 0.1
done
pause 2

# --- the demo (on camera) ---------------------------------------------------

if [ "$INSTALL" = 1 ]; then
  # Both hosts install ezvpn at the same time.
  tm set-window-option -t demo synchronize-panes on
  type_text "$SERVER_PANE" "$EZVPN_INSTALL"
  enter "$SERVER_PANE"
  tm set-window-option -t demo synchronize-panes off
  wait_for "$SERVER_PANE" 'Installation completed' 120
  wait_for "$CLIENT_PANE" 'Installation completed' 120
  wait_prompt "$CLIENT_PANE"
  pause 1.5
  run "$CLIENT_PANE" "$KEYS_INSTALL"
  wait_for "$CLIENT_PANE" 'flexaccess-keys.*from your terminal' 120
  wait_prompt "$CLIENT_PANE"
  pause 2.5
  clear_pane "$SERVER_PANE"
  clear_pane "$CLIENT_PANE"
  set_ipv6 1
  pause 1
fi

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
CLIENT_PUB="$(on_client '~/.local/bin/flexaccess-keys show-auth-key --private-key-file ~/demo/client.key 2>/dev/null || flexaccess-keys show-auth-key --private-key-file ~/demo/client.key')"
[[ "$CLIENT_PUB" == ed25519-pub:* ]] || { echo "could not read the client public key" >&2; exit 1; }
pause 2

# 2. Server: identity, authorized key, config, start.
focus "$SERVER_PANE"
run "$SERVER_PANE" "# server: an identity key, the client's public key, a short config"
pause 0.6
run "$SERVER_PANE" "ezvpn generate-server-key --output vpn-server.key"
wait_for "$SERVER_PANE" '^EndpointId: [0-9a-f]{64}'
wait_prompt "$SERVER_PANE"
SERVER_ID="$(on_server 'ezvpn show-server-id --secret-file ~/demo/vpn-server.key')"
[[ "$SERVER_ID" =~ ^[0-9a-f]{64}$ ]] || { echo "could not read the server EndpointId" >&2; exit 1; }
pause 1.5
type_text "$SERVER_PANE" "echo '"
paste_text "$SERVER_PANE" "$CLIENT_PUB"
run "$SERVER_PANE" "' > authorized_keys"
wait_prompt "$SERVER_PANE"
pause 1
run "$SERVER_PANE" "cat > vpn_server.toml <<EOF"
for line in \
  'role = "vpnserver"' \
  '[network]' \
  "network = \"$VPN_NET\"" \
  '[auth]' \
  'authorized_keys_file = "./authorized_keys"' \
  '[iroh]' \
  'secret_file = "./vpn-server.key"' \
  'EOF'; do
  pause 0.2
  run "$SERVER_PANE" "$line"
done
wait_prompt "$SERVER_PANE"
pause 1.2
clear_pane "$SERVER_PANE"
run "$SERVER_PANE" "sudo ezvpn server start -c vpn_server.toml"
wait_for "$SERVER_PANE" '\]   Node ID: [0-9a-f]{64}' 60
pause 3

# 3. Client: connect by EndpointId, look around, disconnect.
focus "$CLIENT_PANE"
clear_pane "$CLIENT_PANE"
run "$CLIENT_PANE" "# client: dial the server by its id -- no IP address, no open port"
pause 0.6
type_text "$CLIENT_PANE" "sudo ezvpn client start --daemon --auth-key-file client.key --server-node-id "
paste_text "$CLIENT_PANE" "$SERVER_ID"
enter "$CLIENT_PANE"
wait_for "$SERVER_PANE" 'connected, assigned IP' 60
wait_prompt "$CLIENT_PANE"
pause 3
clear_pane "$CLIENT_PANE"
run "$CLIENT_PANE" "sudo ezvpn client status"
wait_for "$CLIENT_PANE" '^Connection:'
wait_prompt "$CLIENT_PANE"
pause 4
clear_pane "$CLIENT_PANE"
run "$CLIENT_PANE" "ping -c 4 $VPN_SERVER_IP"
wait_for "$CLIENT_PANE" 'packets transmitted' 30
wait_prompt "$CLIENT_PANE"
pause 2.5
run "$CLIENT_PANE" "sudo ezvpn client stop"
wait_for "$CLIENT_PANE" 'Client stopped' 30
wait_prompt "$CLIENT_PANE"
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
