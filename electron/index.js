const { app, BrowserWindow, dialog } = require("electron");
const { ipcMain } = require("electron/main");
const path = require("path");
const { Manager } = require("./manager");
const { Deeplink } = require("electron-deeplink");
const isDev = require("electron-is-dev");

const log = require("electron-log");

let mainWindow, activateUrl;

const APP_PREFIX = "threewalls-app";
const deeplink = new Deeplink({ app, mainWindow, protocol: APP_PREFIX, isDev });

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
  app.on("second-instance", (_event, _commandLine, _workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

const focusMainWindow = () => {
  if (mainWindow) {
    mainWindow.show();
    mainWindow.focus();
  }
};

const manager = new Manager(focusMainWindow);

const createWindow = () => {
  mainWindow = new BrowserWindow({
    autoHideMenuBar: true,
    width: 800,
    height: 600,
    center: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile("app/start/index.html");

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
};

ipcMain.on("start", (_, token) => {
  mainWindow?.minimize();

  log.info("start streaming" + token);

  manager.reset();
  manager.load(token);
});

deeplink.on("received", (url) => {
  activateUrl = url;
  manager.reset();

  if (!app.isReady()) return;

  if (!mainWindow) {
    createWindow();
  }

  sendUrl();
});

app.on("ready", () => {
  createWindow();
  sendUrl();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", (...args) => {
  log.info("activate", args);
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

const sendUrl = () => {
  if (mainWindow && activateUrl) {
    mainWindow.webContents.send(
      "url",
      activateUrl.replace(`${APP_PREFIX}://`, "").replaceAll("/", "")
    );
  }
};
