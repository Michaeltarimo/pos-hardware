# Tarimo POS – One-click launcher

So Tarimo can open the POS in full screen like an app, without using the terminal.

## First-time setup (do this once)

1. **Create the desktop shortcut**  
   Double-click **`install-launcher.sh`** (in this folder).  
   If your file manager asks “Run” or “Display”, choose **Run**.  
   This creates a shortcut **“Tarimo POS”** on the Desktop.

2. If double-click doesn’t run it: right-click `install-launcher.sh` → **Properties** → **Permissions** → tick **“Allow executing as program”**, then double-click again.

## Daily use

- Double-click **“Tarimo POS”** on the Desktop.  
- The launcher will:
  - Start the POS server if it isn’t already running
  - Open the app in the browser in **full screen** (no address bar, like an app)

To close: use the browser window (e.g. Alt+F4 or close the window). The server keeps running in the background so the next launch is fast. To stop the server completely, restart the computer or run in a terminal from this folder: `pkill -f "next dev"`.

## Optional: run the launcher script directly

You can also run **`launch-pos.sh`** from this folder (double-click or from file manager). It does the same thing as the “Tarimo POS” shortcut.
