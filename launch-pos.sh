#!/usr/bin/env bash
# Tarimo Hardware POS – one-click launcher
# Starts the server if needed and opens the app in full-screen browser.

set -e
POS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$POS_DIR"
PORT=3000
URL="http://localhost:${PORT}"

# Check if server is already running
server_ready() {
  curl -s -o /dev/null -w "%{http_code}" --connect-timeout 1 "$URL" 2>/dev/null | grep -q "200\|301\|302"
}

if ! server_ready; then
  echo "Starting POS server..."
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
      echo "Server failed to start. Check .pos-server.log"
      exit 1
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
