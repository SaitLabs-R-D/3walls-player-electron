import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { APP_PREFIX, SCREENS_COUNT } from "../../constants";
import { Preview } from "./preview";
import { Updater } from "./updater";
import { PreviewSubmitTokenPayload } from "../shared/types";
import { Player } from "./player";
import { Locale } from "../shared/types/general";
import { store } from "./store";
import { displaysCount } from "./helpers";

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
}

//==================//
//      Main        //
//==================//

async function init() {
  if (await updater.isLatestVersion()) {
    preview.createWindow();
    preview.loadPreviewApp();
  } else {
    updater.createWindow();
    updater.loadUpdater();
  }
}

function handlePreviewSendURL(URL: string) {
  const [token, locale] = URL.trim()
    .replaceAll(APP_PREFIX + "://", "")
    .replaceAll("/", "")
    .split("?locale=");

  store.setLocale(locale as Locale);

  if (player.isPlaying) return;

  if (preview.isQuestionnaireOpen) {
    preview.loadPreviewApp();
  }

  preview.focus();
  preview.sendToken(token);
}

function handleStartLesson(payload: PreviewSubmitTokenPayload) {
  preview.minimize();
  const isDev = displaysCount() < SCREENS_COUNT;
  player.loadLesson(payload.token, isDev);
}

function handleShowQuestionnaire() {
  preview.loadQuestionnaire(player.token);
  preview.focus();
  player.reset();
}

//==================//
//      Events      //
//==================//

const updater = new Updater();
const preview = new Preview();
const player = new Player(handleShowQuestionnaire);

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

ipcMain.on("intl", (_event, locale: Locale) => {
  store.setLocale(locale);
});

ipcMain.on("update", (_event) => {
  updater.update();
})