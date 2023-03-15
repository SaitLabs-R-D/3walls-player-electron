const axios = require("axios");
const {
  BrowserWindow,
  screen,
  globalShortcut,
  dialog,
  ipcMain,
} = require("electron");
const path = require("path");
const log = require("electron-log");
const isDev = require("electron-is-dev");

// const api = isDev
//   ? "http://localhost:5004/api/v1"
//   : `https://app.3walls.org/api/v1`;
const api = "https://app.3walls.org/api/v1";

class Manager {
  screens = [];
  data = [];
  token = "";
  ytTimestamps = [];

  constructor(focusMainWindow) {
    this.focusMainWindow = focusMainWindow;
  }

  load(token, isDev) {
    log.info("requesting to load screens");
    this.reset();
    this.isDev = isDev;
    this.token = token;
    this.getData(token);
  }

  reset() {
    this.screens.forEach((screen) => {
      if (!screen.window.isDestroyed()) {
        screen.window.close();
      }
    });
    this.screens = [];
    this.data = [];
    this.token = "";
    ipcMain.removeAllListeners("resInfo");
  }

  init() {
    this.hanldeEvents();
  }

  initScreens() {
    log.info("initiating " + this.screens.length + " screens");
    let windowsLoadedCount = 0;

    this.data.map((window, index) => {
      const newScreen = new Screen(index, window, this.data.length, this.isDev);
      this.screens.push(newScreen);

      newScreen.window.on("ready-to-show", () => {
        newScreen.window.webContents.send("init", {
          order: index,
        });
        if (++windowsLoadedCount === this.data.length) {
          // once all windows are loaded, we can start the party ✨
          this.init();
        }
      });
    });
  }

  hanldeEvents() {
    globalShortcut.register("CommandOrControl+n", () => {
      this.sendEvent("next");
    });

    globalShortcut.register("CommandOrControl+Tab", () => {
      this.sendEvent("flipPosition");
    });

    globalShortcut.register("CommandOrControl+p", () => {
      this.sendEvent("prev");
    });

    globalShortcut.register("CommandOrControl+Space", () => {
      this.sendEvent("pauseOrContinue");
      this.sendEvent("reqInfo", {
        type: "yt-timestamp",
      });
    });

    globalShortcut.register("CommandOrControl+Right", () => {
      this.sendEvent("fastForward", { by: 1 });
    });

    globalShortcut.register("CommandOrControl+Left", () => {
      this.sendEvent("fastForward", { by: -1 });
    });

    globalShortcut.register("CommandOrControl+f", () => {
      this.sendEvent("fullscreen");
    });

    globalShortcut.register("Escape", () => {
      this.focusMainWindow();
      this.reset();
    });

    if (isDev) {
      globalShortcut.register("CommandOrControl+1+2", () => {
        this.sendEvent("openDevTools");
      });
    }

    this.screens.forEach((screen) => {
      screen.window.on("closed", () => {
        this.screens = this.screens.filter((_, i) => screen.order !== i);
      });
    });

    ipcMain.on("resInfo", (_, payload) => {
      if (payload.type === "yt-timestamp") {
        this.handleSyncYtTimestamps(payload);
      }
    });
  }

  sendEvent(event, payload = {}) {
    const now = Date.now();
    this.screens.forEach((screen) => {
      payload.timestamp = now;
      screen.createEvent(event, payload);
    });
  }

  formatData(data) {
    // ? converts data from vertical to horizontal

    data = data.sort((a, b) => a.order - b.order);

    let newData = [];

    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < data[i].screens.length; j++) {
        if (!newData[j]) {
          newData[j] = [];
        }

        newData[j].push(data[i].screens[j]);
      }
    }

    return newData;
  }

  handleSyncYtTimestamps(payload) {
    if (payload.type !== "yt-timestamp") return;

    this.ytTimestamps.push(payload.data);

    if (this.ytTimestamps.length !== this.screens.length) return;

    const avg = this.ytTimestamps.reduce((a, b) => a + b) / this.screens.length;
    this.ytTimestamps = [];
    this.sendEvent("syncYtTimestamps", { skip: avg });
  }

  async getData(token) {
    try {
      const res = await axios.get(`${api}/watch/data?token=${token}`);

      this.data = this.formatData(res.data.data);
      this.initScreens();
    } catch (e) {
      log.error("failed to load data", e);
      dialog.showErrorBox(
        "Error",
        "Failed to load data, please try again later\n \n" + e
      );
    }
  }
}

class Screen {
  i = -1;
  screensCount = 0;
  toggledPosition = true;

  constructor(pos, data, screensCount, isDev) {
    this.data = data;
    this.pos = pos;
    this.screensCount = screensCount;
    this.isDev = isDev;
    this.createWindow();
  }

  createWindow() {
    this.window = new BrowserWindow({
      autoHideMenuBar: true,
      width: 500,
      height: 500,
      center: true,
      icon: path.join(__dirname, "public", "logo.png"),
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
        nodeIntegration: true,
        contextIsolation: false,
        webviewTag: true,
      },
    });

    this.setPosition();

    this.window.loadFile("app/stream/index.html");
  }

  getAllDisplays() {
    const screens = screen.getAllDisplays();
    /*
      ?why we sort them?
      screens = [primary, secondary, tertiary]
      and not [right, center, left] (or reversed)
      that's why we order them by their x position
    */
    return screens.sort((a, b) => a.bounds.x - b.bounds.x);
  }

  async setPosition() {
    const scrn = this.getAllDisplays();

    const posIndex = this.toggledPosition ? 2 - this.pos : this.pos;

    if (this.isDev) {
      this.window.setPosition(
        (scrn[0].workArea.width / this.screensCount) * posIndex, // ? * posIndex, rtl : ltr
        0
      );
      this.window.setSize(
        scrn[0].workArea.width / this.screensCount,
        scrn[0].workArea.height
      );
      return;
    }

    if (scrn[posIndex]) {
      this.window.setPosition(scrn[posIndex].workArea.x || 0, 0);
      this.window.setFullScreen(true);
    } else {
      this.window.setFullScreen(false);
      this.window.setPosition(scrn[0].workArea.x, 0);

      setTimeout(() => {
        this.window.show();
      }, 250);
    }
  }

  createEvent(event, payload = {}) {
    switch (event) {
      case "next":
        return this.next(payload);
      case "prev":
        return this.prev(payload);
      case "pauseOrContinue":
        return this.pauseOrContinue(payload);
      case "fastForward":
        return this.fastForward(payload);
      case "fullscreen":
        return this.fullscreen(payload);
      case "flipPosition":
        return this.flipPosition(payload);
      case "openDevTools":
        return this.window.webContents.openDevTools(payload);
      default:
        this.event(event, payload);
    }
  }

  event(event, payload) {
    this.window.webContents.send(event, payload);
  }

  next(timestamp = {}) {
    if (this.i >= this.data.length - 1) {
      // todo : end session
      return;
    }
    log.info("next");

    this.i++;
    this.play(timestamp);
  }

  prev(timestamp = {}) {
    if (this.i <= 0) return;
    log.info("prev");

    this.i--;
    this.play(timestamp);
  }

  pauseOrContinue(timestamp = {}) {
    if (this.data[this.i].type_ === "browser") {
      this.event("passEventToWebview", {
        type: "keyDown",
        keyCode: "Space",
        ...timestamp,
      });
    }
    if (this.data[this.i].type_ === "video") {
      this.event("pauseOrContinue", timestamp);
    }
  }

  fastForward({ timestamp, by = 0.0 }) {
    if (this.data[this.i].type_ === "browser") {
      this.event("passEventToWebview", {
        type: "keyDown",
        keyCode: by > 0 ? "L" : "J",
      });
    }
    if (this.data[this.i].type_ === "video") {
      this.event("fastForward", { timestamp, by });
    }
  }

  fullscreen() {
    if (this.data[this.i].type_ === "browser") {
      this.event("passEventToWebview", { type: "keyDown", keyCode: "f" });
    }
  }

  play(payload) {
    const { type_, url } = this.data[this.i];

    log.info("playing", type_, url);

    this.event("play", {
      type: type_,
      url,
      ...payload,
    });
  }
}

module.exports = {
  Manager,
};
