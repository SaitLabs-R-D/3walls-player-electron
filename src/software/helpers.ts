import { BrowserWindow } from "electron";
import path from "path";

export const createMainWindow = () => {
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

  // and load the index.html of the app.
  if (PREVIEW_VITE_DEV_SERVER_URL) {
    window.loadURL(PREVIEW_VITE_DEV_SERVER_URL);
  } else {
    window.loadFile(
      path.join(__dirname, `../renderer/${PREVIEW_VITE_NAME}/index.html`)
    );
  }

  return window;
};

export const focusWindow = (window: BrowserWindow | null) => {
  if (!window) return;
  if (window.isMinimized()) window.restore();

  window.show();
  window.focus();
};
