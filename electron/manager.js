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

// const API = "https://api.dev.3walls.org/api/v2";
// const API = "http://localhost:7000/api/v2";
const API = "https://api.app.3walls.org/api/v2";

class Manager {
  screens = [];
  data = [];
  ytTimestamps = [];
  screensEnded = 0;
  onEnd = () => {};
  token = "";
  floatingMenu = null;

  constructor(focusMainWindow, onEnd) {
    this.focusMainWindow = focusMainWindow;
    this.onEnd = onEnd;
  }

  load(token, isDev) {
    log.info("requesting to load screens");
    this.reset();
    this.isDev = isDev;
    this.token = token;
    this.getData(token);
  }

  reset() {
    // not in case of "undefined", just when "false".
    if (this.floatingMenu?.window.isDestroyed() === false) {
      this.floatingMenu.window.close();
      this.floatingMenu = null;
    }

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
    this.hanldeKeyboardEvents();
    this.handleMenuEvents();
  }

  initScreens() {
    log.info("initiating " + this.data.length + " screens");
    let windowsLoadedCount = 0;

    this.floatingMenu = new FloatingMenu();

    this.data.map((window, index) => {
      const newScreen = new Screen(
        index,
        window,
        this.data.length,
        this.isDev,
        this.handleScreenEnded.bind(this)
      );
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

  next() {
    this.sendEvent("next");
  }

  prev() {
    this.sendEvent("prev");
  }

  pauseOrContinue() {
    log.info("pauseOrContinue");

    this.sendEvent("pauseOrContinue");
    this.sendEvent("reqInfo", {
      type: "yt-timestamp",
    });
  }

  flipPosition() {
    this.sendEvent("flipPosition");
  }

  fastForward(by = 0.0) {
    this.sendEvent("fastForward", { by });
  }

  fullscreen() {
    this.sendEvent("fullscreen");
  }

  escape() {
    this.screensEnded = this.screens.length - 1;
    this.handleScreenEnded();
  }

  handleMenuEvents() {
    ipcMain.on("menu", (_, payload) => {
      switch (payload.type) {
        case "next":
          return this.next();
        case "prev":
          return this.prev();
        case "pauseOrContinue":
          return this.pauseOrContinue();
        case "fastForward":
          return this.fastForward(payload.by);
        case "fullscreen":
          return this.fullscreen();
        // case "flipPosition":
        //   return this.flipPosition();
        // case "openDevTools":
        //   return this.sendEvent("openDevTools");
        default:
          return;
      }
    });
  }

  hanldeKeyboardEvents() {
    globalShortcut.register("CommandOrControl+n", this.next);

    globalShortcut.register("CommandOrControl+Tab", this.flipPosition);

    globalShortcut.register("CommandOrControl+p", this.prev);

    globalShortcut.register("CommandOrControl+Space", this.pauseOrContinue);

    globalShortcut.register("CommandOrControl+Right", () =>
      this.fastForward(1)
    );

    globalShortcut.register("CommandOrControl+Left", () =>
      this.fastForward(-1)
    );

    globalShortcut.register("CommandOrControl+f", this.fullscreen);

    globalShortcut.register("Escape", this.escape);

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

  formatData(data = []) {
    if (!Array.isArray(data)) {
      dialog.showErrorBox(
        "Error",
        "Failed to load data, please contact support 420"
      );
      return;
    }
    // ? converts data from vertical to horizontal

    data = data.sort((a, b) => a.order - b.order);

    let newData = [];

    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < data[i].screens.length; j++) {
        if (!newData[j]) {
          newData[j] = [];
        }

        switch (data[i].type) {
          case "panoramic":
            newData[j].push({
              url: data[i].gcp_path ?? data[i].panoramic_url,
              type_: "panoramic",
              mime_type: null,
              comment: null,
            });
            break;
          case "normal":
          default:
            newData[j].push(data[i].screens[j]);
            break;
        }
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

  handleScreenEnded() {
    this.screensEnded++;
    if (this.screensEnded === this.screens.length) {
      // it's a perfect ordert
      // 1. if mainWindow is not focus - a problem
      // 2. on reset - the token is gone
      this.focusMainWindow();
      this.onEnd(this.token);
      this.reset();
    }
  }

  async getData(token) {
    try {
      const res = await axios.get(`${API}/watch/data?token=${token}`);

      this.data = this.formatData(res.data.content);
      this.initScreens();
    } catch (e) {
      console.log(e);
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
  onEnd = () => {};

  constructor(pos, data, screensCount, isDev, onEnd) {
    this.data = data;
    this.pos = pos;
    this.screensCount = screensCount;
    this.isDev = isDev;
    this.onEnd = onEnd;
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

    log.info("creating window ", this.pos);

    this.setPosition();

    this.window.loadFile("app/stream/index.html");
  }

  getAllDisplays() {
    const screens = screen.getAllDisplays();
    log.info(`found ${screens.length} screens`);
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
      const width = Math.floor(scrn[0].workArea.width / this.screensCount);
      const x = width * posIndex;

      log.info(
        JSON.stringify(
          {
            x: (scrn[0].workArea.width / this.screensCount) * posIndex,
            y: 0,
            posIndex,
            width,
            height: scrn[0].workArea.height,
          },
          null,
          2
        )
      );

      this.window.setPosition(x, 0);
      this.window.setSize(width, scrn[0].workArea.height);
      return;
    }

    if (scrn[posIndex]) {
      log.info(
        "found scrn[posIndex], setting position",
        posIndex,
        scrn[posIndex]
      );
      this.window.setPosition(scrn[posIndex].workArea.x || 0, 0);
      this.window.setFullScreen(true);
    } else {
      log.info(
        "did not find scrn[posIndex], setting position",
        posIndex,
        scrn[posIndex]
      );

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
      this.onEnd();
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
      screen_idx: this.pos,
      ...payload,
    });
  }
}

class FloatingMenu {
  constructor() {
    const primaryScreen = screen.getPrimaryDisplay();

    const width = 500,
      height = 50;

    const y = primaryScreen.workArea.height - height * 2;
    const x = primaryScreen.workArea.width / 2 - width / 2;

    this.window = new BrowserWindow({
      alwaysOnTop: true,
      autoHideMenuBar: true,
      width,
      height,
      y,
      x,
      frame: false,
      resizable: false,
      movable: true,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
    });

    this.window.loadFile("app/menu/index.html");
  }
}

module.exports = {
  Manager,
};
