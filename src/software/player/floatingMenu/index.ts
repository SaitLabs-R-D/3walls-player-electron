import { BrowserWindow, ipcMain, screen } from "electron";
import { loadApp } from "../../helpers";
import path from "path";
import { Action } from "../../../shared/types";
import { actions } from "../config";

export class FloatingMenu {
  private window: BrowserWindow;
  private fireAction: (action: Action) => void;

  constructor(fireAction: (action: Action) => void) {
    this.fireAction = fireAction;
    this.createWindow();
    this.listen();
  }

  public destroy() {
    if (this.window && !this.window.isDestroyed()) {
      this.window.destroy();
      this.window = null;
    }
  }

  public createWindow() {
    const primaryScreen = screen.getPrimaryDisplay();

    const width = 750,
      height = 50;

    const y = primaryScreen.workArea.height - height * 2;
    const x = primaryScreen.workArea.width / 2 - width / 2;

    this.window = new BrowserWindow({
      alwaysOnTop: true,
      autoHideMenuBar: true,
      width,
      height,
      y,
      x,
      frame: false,
      resizable: false,
      movable: true,
      webPreferences: {
        preload: path.join(__dirname, "floatingMenuPreload.js"),
        nodeIntegration: true,
        contextIsolation: true,
      },
    });

    loadApp(
      this.window,
      FLOATINGMENU_VITE_NAME,
      FLOATINGMENU_VITE_DEV_SERVER_URL
    );
  }

  private listen() {
    actions.forEach((action) => {
      ipcMain.on(action.name, () => {
        this.fireAction(action.name);
      });
    });
  }
}
