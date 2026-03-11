#!/usr/bin/env bash
# Run this once to create a "Tarimo POS" launcher on your Desktop.
# After that, double-click "Tarimo POS" to open the app in full screen.

set -e
POS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LAUNCHER="$POS_DIR/launch-pos.sh"
DESKTOP="$HOME/Desktop/Tarimo POS.desktop"
mkdir -p "$(dirname "$DESKTOP")"

chmod +x "$LAUNCHER"

cat > "$DESKTOP" << EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=Tarimo POS
Comment=Open Tarimo Hardware POS in full screen
Exec=/usr/bin/env bash $LAUNCHER
Icon=applications-office
Path=$POS_DIR
Terminal=false
StartupNotify=true
Categories=Office;Finance;
EOF

chmod +x "$DESKTOP"
echo "Done! A shortcut 'Tarimo POS' was created on your Desktop."
echo "Double-click it to start the POS in full screen."
