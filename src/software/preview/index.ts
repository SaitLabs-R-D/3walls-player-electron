import { BrowserWindow, ipcMain } from "electron";
import { focusWindow, loadApp } from "../helpers";
import path from "path";
import { APP_ICON_PATH, API_URL } from "../../../constants";
import { store } from "../store";
import axios from "axios";
import log from "electron-log";

export class Preview {
  public isThankYouOpen = false;
  private window: BrowserWindow;

  public createWindow() {
    this.window = new BrowserWindow({
      width: 800,
      height: 600,
      autoHideMenuBar: true,
      center: true,
      icon: APP_ICON_PATH,
      webPreferences: {
        preload: path.join(__dirname, "previewPreload.js"),
        nodeIntegration: true,
        contextIsolation: true,
      },
    });

    this.window.on("closed", () => {
      this.window = null;
    });

    ipcMain.on('close-window', (event) => {
      this.window.close()
    })

    this.window.webContents.on("did-fail-load", this.destroy);

    this.window.webContents.on("did-finish-load", () => {
      this.window.webContents.send("locale", store.locale);
      store.addListener("preview", (locale) => {
        this.window.webContents.send("locale", locale);
      });
    });
  }

  public loadPreviewApp() {
    loadApp(this.window, PREVIEW_VITE_NAME, PREVIEW_VITE_DEV_SERVER_URL);
  }

  public destroy() {
    if (this.window && !this.window.isDestroyed()) {
      this.window.destroy();
    }

    this.window = null;
    store.removeListener("preview");
    this.isThankYouOpen = false;
  }

  public minimize() {
    this.window.minimize();
  }

  public focus() {
    focusWindow(this.window);
  }

  public sendToken(token: string) {
    this.window.webContents.send("token", token);
  }

  public loadThankYou(token: string) {
    this.sendReviewEmail(token);
    loadApp(this.window, PREVIEW_VITE_NAME, null, "thank_you.html");
    this.isThankYouOpen = true;
  }

  private async sendReviewEmail(token: string) {
    try {
      const res = await axios.post(`${API_URL}/reviews/email/${token}?locale=${store.locale}`);
    } catch (e) {
      log.error("failed to send email", e);
    }
  }

}
