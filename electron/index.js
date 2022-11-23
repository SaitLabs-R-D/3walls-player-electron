const { app, BrowserWindow, dialog } = require("electron");
const { ipcMain } = require("electron/main");
const path = require("path");
const { Manager } = require("./manager");

const APP_PREFIX = "threewalls-app";

let mainWindow;
const manager = new Manager();

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient(APP_PREFIX, process.execPath, [
      path.resolve(process.argv[1]),
    ]);
  }
} else {
  app.setAsDefaultProtocolClient(APP_PREFIX);
}

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

const createWindow = async () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile("app/start/index.html");

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  ipcMain.on("start", (_, token) => {
    manager.load(token);
  });
};

app.on("open-url", (_, url) => {
  console.log("open-url", url);

  if (!mainWindow) {
    createWindow();
  }

  manager.reset();

  mainWindow.webContents.send("url", url.replace(`${APP_PREFIX}://`, ""));
});

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
