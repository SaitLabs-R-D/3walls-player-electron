import { BrowserWindow } from "electron";
import path from "path";

export const loadApp = (window: BrowserWindow, name: string, url: string, fileName: string = "index.html") => {
  if (url) {
    window.loadURL(url);
  } else {
    window.loadFile(path.join(__dirname, `../renderer/${name}/${fileName}`));
  }
};

export const createPreviewWindow = () => {
  // Create the browser window.
  const window = new BrowserWindow({
    width: 800,
    height: 600,
    autoHideMenuBar: true,
    center: true,
    icon: "public/icon.png",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  loadApp(window, PREVIEW_VITE_NAME, PREVIEW_VITE_DEV_SERVER_URL);

  return window;
};

export const focusWindow = (window: BrowserWindow | null) => {
  if (!window) return;
  if (window.isMinimized()) window.restore();

  window.show();
  window.focus();
};

export const displaysCount = () => {
  const { screen } = require('electron')
  return screen.getAllDisplays().length;
}