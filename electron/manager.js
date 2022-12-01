const axios = require("axios");
const { BrowserWindow, screen, globalShortcut, dialog } = require("electron");
const path = require("path");
const log = require("electron-log");
const isDev = require("electron-is-dev");

class Manager {
  screens = [];
  data = [];
  token = "";

  constructor(focusMainWindow) {
    this.focusMainWindow = focusMainWindow;
  }

  load(token) {
    log.info("requesting to load screens");
    this.reset();
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
  }

  init() {
    this.hanldeEvents();
  }

  initScreens() {
    log.info("initiating " + this.screens.length + " screens");
    let windowsLoadedCount = 0;

    this.data.map((window, index) => {
      const newScreen = new Screen(index, window, this.data.length);
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
      this.sendEvent("next", { timestamp: Date.now() });
    });

    globalShortcut.register("CommandOrControl+p", () => {
      this.sendEvent("prev", { timestamp: Date.now() });
    });

    globalShortcut.register("CommandOrControl+Space", () => {
      this.sendEvent("pauseOrContinue", { timestamp: Date.now() });
    });

    globalShortcut.register("CommandOrControl+Right", () => {
      this.sendEvent("fastForward", { timestamp: Date.now(), by: 1 });
    });

    globalShortcut.register("CommandOrControl+Left", () => {
      this.sendEvent("fastForward", { timestamp: Date.now(), by: -1 });
    });

    globalShortcut.register("Escape", () => {
      this.focusMainWindow();
      this.reset();
    });

    globalShortcut.register("CommandOrControl+1+2", () => {
      if (isDev) {
        this.sendEvent("openDevTools");
      }
    });

    this.screens.forEach((screen) => {
      screen.window.on("closed", () => {
        this.screens = this.screens.filter((_, i) => screen.order !== i);
      });
    });
  }

  sendEvent(event, payload) {
    this.screens.forEach((screen) => {
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

  async getData(token) {
    try {
      const res = await axios.get(
        `https://app.3walls.org/api/v1/watch/data?token=${token}`
      );

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

  constructor(pos, data, screensCount) {
    this.data = data;
    this.pos = pos;
    this.screensCount = screensCount;
    this.createWindow();
  }

  createWindow() {
    const scrn = screen.getAllDisplays();

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

    if (!isDev && scrn[this.pos]) {
      this.window.setPosition(scrn[this.pos].workArea.x, 0);
      this.window.fullScreen = true;
    }

    if (isDev) {
      this.window.setPosition(
        (scrn[0].workArea.width / this.screensCount) * this.pos,
        0
      );
      this.window.setSize(
        scrn[0].workArea.width / this.screensCount,
        scrn[0].workArea.height
      );
    }

    this.window.loadFile("app/stream/index.html");
  }

  createEvent(event, payload = {}) {
    if (event === "next") {
      return this.next(payload);
    }
    if (event === "prev") {
      return this.prev(payload);
    }
    if (event === "pauseOrContinue") {
      return this.pauseOrContinue(payload);
    }
    if (event === "fastForward") {
      return this.fastForward(payload);
    }

    if (event === "openDevTools") {
      this.window.webContents.openDevTools();
    }

    this.window.webContents.send(event, payload);
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
    if (this.data[this.i].type_ !== "video") return;

    this.event("pauseOrContinue", timestamp);
  }

  fastForward({ timestamp, by = 0.0 }) {
    if (this.data[this.i].type_ !== "video") return;

    this.event("fastForward", { timestamp, by });
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
