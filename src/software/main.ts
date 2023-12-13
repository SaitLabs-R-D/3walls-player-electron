import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { APP_PREFIX } from "../../constants";
import { Preview } from "./preview";
import { PreviewSubmitTokenPayload } from "../shared/types";
import { Player } from "./player";

//==================//
//      Setup       //
//==================//

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
  app.on("second-instance", () => {
    // Someone tried to run a second instance, we should focus our window.
    preview.focus();
  });
}

//==================//
//      Main        //
//==================//

async function init() {
  preview.load();
}

function handlePreviewSendURL(url: string) {
  preview.focus();
  preview.sendURL(url);
}

function handleStartLesson(payload: PreviewSubmitTokenPayload) {
  preview.minimize();
  player.loadLesson(payload.token, payload.devMode);
}

//==================//
//      Events      //
//==================//

const preview = new Preview();
const player = new Player();

// app.on("open-url", () => {
//   dialog.showErrorBox(
//     "Protocol handler",
//     "This app doesn't handle opening URLs."
//   );
// });

app.on("second-instance", (_, commandLine) => {
  handlePreviewSendURL(commandLine.pop());
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", init);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    init();
  }
});

ipcMain.on("start", (_event, payload: PreviewSubmitTokenPayload) =>
  handleStartLesson(payload)
);
