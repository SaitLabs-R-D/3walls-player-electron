import path from "path";
import { APP_ICON_PATH, SCREENS_COUNT } from "../../../constants";
import { BrowserWindow, screen } from "electron";
import { loadApp } from "../helpers";
import { LessonContent } from "../../shared/types";

export class Part {
  public window: BrowserWindow;
  private screenIdx: number;
  private devMode: boolean;

  constructor(screenIdx: number, devMode = false) {
    this.screenIdx = SCREENS_COUNT - screenIdx - 1;
    this.devMode = devMode;
    this.createWindow();
  }

  public destroy() {
    if (this.window && !this.window.isDestroyed()) {
      this.window.destroy();
      this.window = null;
    }
  }

  public paint(type: string, content: LessonContent) {
    this.window.webContents.send("paint", { type, content });
  }

  private createWindow() {
    this.window = new BrowserWindow({
      autoHideMenuBar: true,
      width: 500,
      height: 500,
      center: true,
      icon: APP_ICON_PATH,
      webPreferences: {
        preload: path.join(__dirname, "playerPreload.js"),
        nodeIntegration: true,
        contextIsolation: true,
        webviewTag: true,
      },
    });

    loadApp(this.window, PLAYER_VITE_NAME, PLAYER_VITE_DEV_SERVER_URL);

    this.window.on("ready-to-show", () => {
      this.window.webContents.send("setup", this.screenIdx);
    });

    this.setPosition();

    this.window.webContents.openDevTools();
  }

  private setPosition() {
    const screens = this.getAllDisplays();

    if (this.devMode) {
      const width = Math.floor(screens[0].workArea.width / SCREENS_COUNT);
      const x = width * this.screenIdx;

      this.window.setPosition(x, 0);
      this.window.setSize(width, screens[0].workArea.height);
    } else if (screens[this.screenIdx]) {
      this.window.setPosition(screens[this.screenIdx].workArea.x || 0, 0);
      this.window.setFullScreen(true);
    } else {
      this.window.setFullScreen(false);
      this.window.setPosition(screens[0].workArea.x, 0);
    }
  }

  private getAllDisplays() {
    const screens = screen.getAllDisplays();
    /*
      ?why we sort them?
      screens = [primary, secondary, tertiary]
      and not [right, center, left] (or reversed)
      so we sort them by their x position
    */
    return screens.sort((a, b) => a.bounds.x - b.bounds.x);
  }
}
