import { BrowserWindow, ipcMain, screen } from "electron";
import { loadApp } from "../../helpers";
import path from "path";
import { Action } from "../../../shared/types";
import { actions } from "../config";

export class FloatingMenu {
  public isShown = false;
  private window: BrowserWindow;
  private fireAction: (action: Action) => void;
  private interval: NodeJS.Timeout;

  constructor(fireAction: (action: Action) => void) {
    this.fireAction = fireAction;
    this.init();
  }

  public init() {
    this.createWindow();
    this.listen();
  }

  public destroy() {
    console.log(`\ndestroy\n`);
    if (this.window && !this.window.isDestroyed()) {
      this.isShown = false;
      this.window.destroy();
      this.window = null;
      this.unlisten();
      clearInterval(this.interval);
    }
  }

  public createWindow() {
    this.isShown = true;
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
      minimizable: false,
      closable: false,
      movable: true,
      webPreferences: {
        preload: path.join(__dirname, "floatingMenuPreload.js"),
        nodeIntegration: true,
        contextIsolation: true,
      },
    });

    // check if the window is destroyed
    this.window.on("closed", () => {
      console.log(`\nclosed ${this.isShown}\n`);
      if (this.isShown) {
        this.createWindow();
      }
    });

    // check if minimized
    this.window.on("minimize", () => {
      console.log("\nminimize\n");
      if (this.isShown) {
        this.window.restore();
      }
    });

    this.window.webContents.on("render-process-gone", () => {
      console.log("\nrender-process-gone\n");
      if (this.isShown) {
        this.createWindow();
      }
    });

    this.interval = setInterval(() => {
      console.log(
        "\ninterval\n",
        this.window.isDestroyed(),
        this.window.isAlwaysOnTop()
      );
      this.window.setAlwaysOnTop(true);
    }, 1000);

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

  private unlisten() {
    actions.forEach((action) => {
      ipcMain.removeAllListeners(action.name);
    });
  }
}
