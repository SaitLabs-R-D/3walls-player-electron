import { app, shell, BrowserWindow } from "electron";
import { focusWindow, loadApp } from "../helpers";
import path from "path";
import { APP_ICON_PATH, API_URL } from "../../../constants";
import { store } from "../store";
import axios from "axios";
import {download} from 'electron-dl';

export class Updater {
  private window: BrowserWindow;

  public createWindow() {
    this.window = new BrowserWindow({
      width: 500,
      height: 250,
      autoHideMenuBar: true,
      center: true,
      icon: APP_ICON_PATH,
      title: "Update required",
      webPreferences: {
        preload: path.join(__dirname, "updaterPreload.js"),
        nodeIntegration: true,
        contextIsolation: true,
      },
    });

    this.window.on("closed", () => {
      this.window = null;
    });

    this.window.webContents.on("did-fail-load", this.destroy);

    this.window.webContents.on("did-finish-load", () => {
      this.window.webContents.send("locale", store.locale);
      store.addListener("updater", (locale) => {
        this.window.webContents.send("locale", locale);
      });
    });
  }

  public loadUpdater() {
    loadApp(this.window, UPDATER_VITE_NAME, UPDATER_VITE_DEV_SERVER_URL);
  }

  public destroy() {
    if (this.window && !this.window.isDestroyed()) {
      this.window.destroy();
    }

    this.window = null;
    store.removeListener("updater");
  }

  public focus() {
    focusWindow(this.window);
  }

  public async update() {
    // this.window.webContents.downloadURL(`${API_URL}/downloads/lesson-viewer`)
    // await download(this.window, `${API_URL}/downloads/lesson-viewer`)
    try {
      const os = require('os')
      const res = await axios.get(
        `${API_URL}/downloads/lesson-viewer`,
        { headers: { 'User-Agent': os.platform() }}
      );
      const downloadInfo = await download(this.window, res.data.content.url);
      await shell.openPath(downloadInfo.getSavePath());

      this.destroy()
    } catch (error) {
      console.error(error);
    }
  }

  public async isLatestVersion() {
    const res = await axios.get(`${API_URL}/viewer/version`);
    const latest_version = res.data.content;
    const current_version = app.getVersion();
    return current_version === latest_version
  }
}