import { BrowserWindow } from "electron";
import { focusWindow, loadApp } from "../helpers";
import path from "path";
import { APP_ICON_PATH, APP_PREFIX, WEBSITE_URL } from "../../../constants";
import { store } from "../store";

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

    this.window.webContents.on("did-finish-load", () => {
      this.window.webContents.send("lang", store.lang);
      store.addListener("preview", (lang) => {
        this.window.webContents.send("lang", lang);
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
    this.isQuestionnaireOpen = false;
  }

  public minimize() {
    this.window.minimize();
  }

  public focus() {
    focusWindow(this.window);
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
