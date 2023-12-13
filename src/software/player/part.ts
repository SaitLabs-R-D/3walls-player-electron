import path from "path";
import { APP_ICON_PATH, SCREENS_COUNT } from "../../../constants";
import { BrowserWindow, screen } from "electron";
import { loadApp } from "../helpers";

export class Part {
  public window: BrowserWindow;
  private screenIdx: number;
  private devMode: boolean;

  constructor(screenIdx: number, devMode = false) {
    this.screenIdx = screenIdx;
    this.devMode = devMode;
    this.createWindow();

    setTimeout(() => {
      this.window.webContents.send("setup", screenIdx);
      this.window.webContents.openDevTools();
    }, 1000);
  }

  public destroy() {
    this.window.destroy();
  }

  public render() {
    //
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

    this.setPosition();
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
