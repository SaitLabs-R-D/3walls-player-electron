const axios = require("axios");
const {
  BrowserWindow,
  screen,
  ipcMain,
  globalShortcut,
  dialog,
} = require("electron");
const path = require("path");

class Manager {
  screens = [];
  data = [];
  token = "";

  constructor(token) {
    console.log("Manager created");
    this.token = token;
    this.getData(token);
  }

  init() {
    this.hanldeEvents();
  }

  initScreens() {
    let windowsLoadedCount = 0;

    this.data.map((window, index) => {
      const newScreen = new Screen(
        window.order,
        window.screens,
        this.data.length
      );
      this.screens.push(newScreen);

      newScreen.window.on("ready-to-show", () => {
        newScreen.window.webContents.send("init", {
          order: window.order,
        });
        if (++windowsLoadedCount === this.data.length) {
          // once all windows are loaded, we can start the party ✨
          this.init();
        }
      });

      newScreen.window.on("close", () => {
        this.screens = this.screens.filter((_, i) => index !== i);
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

    // ! remove when production
    globalShortcut.register("CommandOrControl+1+2", () => {
      this.sendEvent("openDevTools");
    });
  }

  sendEvent(event, payload) {
    this.screens.forEach((screen) => {
      screen.createEvent(event, payload);
    });
  }

  async getData(token, depth = 0) {
    try {
      const res = await axios.get(
        "http://localhost:5004/api/v1/watch/data?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsZXNzb25faWQiOiI2Mzc2MDJmYzg0M2IyMWU2MTQ0ZmQ2ZjYiLCJsZXNzb25fdHlwZSI6InB1Ymxpc2hlZCIsImV4cCI6MTY2OTEwNTU2OX0.TEdmKREd5lJ1OuYq5Pxw5S69ll8Jt_ktYtbM_vthSbg"
      );

      this.data = res.data.data;
      this.initScreens();
    } catch (e) {
      if (depth < 3) {
        this.getData(token, depth + 1);
      } else {
        dialog.showErrorBox(
          "Error",
          "Failed to load data, please try again later\n \n" + e
        );
      }
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
      // fullscreen: true,
      autoHideMenuBar: true,
      height: scrn[0].workAreaSize.height,
      width: scrn[0].workAreaSize.width / this.screensCount,
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
        nodeIntegration: true,
        contextIsolation: false,
        webviewTag: true,
      },
    });

    this.window.setPosition(
      (scrn[1].workArea.width / this.screensCount) * this.pos,
      0
    );
    this.window.loadFile("app/index.html");
  }

  createEvent(event, payload = {}) {
    if (event === "next") {
      return this.next(payload);
    }
    if (event === "prev") {
      return this.prev(payload);
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
    if (this.i >= this.data.length - 1) return;
    console.log("next");

    this.i++;
    this.play(timestamp);
  }

  prev(timestamp = {}) {
    if (this.i <= 0) return;
    console.log("prev");

    this.i--;
    this.play(timestamp);
  }

  play(payload) {
    const { type_, url } = this.data[this.i];

    console.log("play", type_, url);

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
