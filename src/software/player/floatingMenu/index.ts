import { BrowserWindow, screen } from "electron";
import { loadApp } from "../../helpers";
import path from "path";

export class FloatingMenu {
  private window: BrowserWindow;

  constructor() {
    this.createWindow();
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
        preload: path.join(__dirname, "playerPreload.js"),
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
}
