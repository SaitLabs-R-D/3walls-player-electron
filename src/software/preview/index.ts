import { BrowserWindow } from "electron";
import { loadApp } from "../helpers";
import path from "path";
import { APP_ICON_PATH, APP_PREFIX, WEBSITE_URL } from "../../../constants";

export class Preview {
  public isQuestionnaireOpen = false;
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

    this.window.webContents.on("did-fail-load", this.destroy);
  }

  public loadPreviewApp() {
    loadApp(this.window, PREVIEW_VITE_NAME, PREVIEW_VITE_DEV_SERVER_URL);
  }

  public destroy() {
    if (this.window && !this.window.isDestroyed()) {
      this.window.destroy();
      this.window = null;
    }

    this.isQuestionnaireOpen = false;
  }

  public minimize() {
    this.window.minimize();
  }

  public focus() {
    if (this.window.isMinimized()) this.window.restore();

    this.window.show();
    this.window.focus();
  }

  public sendURL(url: string) {
    const token = url.replace(`${APP_PREFIX}://`, "").replaceAll("/", "");

    this.window.webContents.send("token", token);
  }

  public loadQuestionnaire(token: string) {
    this.window.loadURL(`${WEBSITE_URL}/software/${token}/questionnaire`);
    this.isQuestionnaireOpen = true;
  }
}
