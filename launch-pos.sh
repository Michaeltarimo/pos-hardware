#!/usr/bin/env bash
# Tarimo Hardware POS – one-click launcher
# Starts the server if needed and opens the app in full-screen browser.

set -e
POS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$POS_DIR"

LOG="$POS_DIR/.pos-launcher.log"
exec >>"$LOG" 2>&1
echo "
===== POS launcher: $(date) ====="
echo "PWD: $POS_DIR"

# Desktop launchers often run with a minimal PATH (no nvm). Ensure npm is available.
export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:$PATH"
if ! command -v npm >/dev/null 2>&1; then
  # nvm (most common)
  if [ -s "$HOME/.nvm/nvm.sh" ]; then
    # shellcheck disable=SC1090
    . "$HOME/.nvm/nvm.sh"
    nvm use --silent default >/dev/null 2>&1 || true
  fi
fi
if ! command -v npm >/dev/null 2>&1; then
  # asdf (optional)
  if [ -s "$HOME/.asdf/asdf.sh" ]; then
    # shellcheck disable=SC1090
    . "$HOME/.asdf/asdf.sh"
  fi
fi

PORT=3000
URL="http://localhost:${PORT}"

# Check if server is already running
server_ready() {
  # Consider the server "up" if we get ANY HTTP response code.
  # (Auth redirects are often 307/308; errors might be 4xx; those still mean Next is running.)
  local code
  code="$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 1 "$URL" 2>/dev/null || true)"
  [[ "$code" =~ ^[1-5][0-9][0-9]$ ]]
}

if ! server_ready; then
  echo "Starting POS server..."
  if ! command -v npm >/dev/null 2>&1; then
    echo "ERROR: npm still not found. Expected at: $HOME/.nvm/versions/node/*/bin/npm"
    exit 1
  fi
  echo "Using npm: $(command -v npm)"
  nohup npm run dev > .pos-server.log 2>&1 &
  SERVER_PID=$!
  echo "Waiting for server (pid $SERVER_PID)..."
  for i in $(seq 1 30); do
    sleep 2
    if server_ready; then
      echo "Server is ready."
      break
    fi
    if ! kill -0 $SERVER_PID 2>/dev/null; then
      echo "Server failed to start or another instance is running."
      echo "Continuing to open the browser anyway. Check .pos-server.log if needed."
      break
    fi
    [ $i -eq 30 ] && { echo "Timeout waiting for server."; exit 1; }
  done
fi

# Open in browser: app mode (no address bar) + fullscreen
if command -v google-chrome &>/dev/null; then
  google-chrome --app="$URL" --start-fullscreen --window-size=1920,1080 2>/dev/null &
elif command -v google-chrome-stable &>/dev/null; then
  google-chrome-stable --app="$URL" --start-fullscreen --window-size=1920,1080 2>/dev/null &
elif command -v chromium-browser &>/dev/null; then
  chromium-browser --app="$URL" --start-fullscreen --window-size=1920,1080 2>/dev/null &
elif command -v chromium &>/dev/null; then
  chromium --app="$URL" --start-fullscreen --window-size=1920,1080 2>/dev/null &
else
  xdg-open "$URL" 2>/dev/null &
fi
