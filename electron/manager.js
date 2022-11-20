const axios = require("axios");
const { BrowserWindow, screen, ipcMain, globalShortcut } = require("electron");
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

    this.data.map((screen, index) => {
      const newScreen = new Screen(index, screen.data);
      this.screens.push(newScreen);

      newScreen.window.on("ready-to-show", () => {
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
      // const res = await axios.get(
      //   "http://localhost:5004/api/v1/sockets/create/screen-sync"
      // );
      // this.data = res.data.screens;
      this.data = [
        {
          data: [
            "video https://www.proprep.com/Content/Videos/HowItWorks.mp4",
            "browser https://www.mentimeter.com/",
            "image https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/dog-puppy-on-garden-royalty-free-image-1586966191.jpg?crop=1.00xw:0.669xh;0,0.190xh&resize=640:*",
          ],
        },
        {
          data: [
            "video https://www.proprep.com/Content/Videos/HowItWorks.mp4",
            "image https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/dog-puppy-on-garden-royalty-free-image-1586966191.jpg?crop=1.00xw:0.669xh;0,0.190xh&resize=640:*",
            "browser https://www.sport5.co.il/",
          ],
        },
        {
          data: [
            "image https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/dog-puppy-on-garden-royalty-free-image-1586966191.jpg?crop=1.00xw:0.669xh;0,0.190xh&resize=640:*",
            "video https://www.proprep.com/Content/Videos/HowItWorks.mp4",
            "browser https://www.sport5.co.il/",
          ],
        },
      ];
      this.initScreens();
    } catch (e) {
      console.log(e);
      if (depth < 3) {
        this.getData(token, depth + 1);
      } else {
        console.log("failed to load data");
        // todo : handle error
      }
    }
  }
}

class Screen {
  i = -1;

  constructor(pos, data) {
    this.data = data;
    this.pos = pos;
    this.createWindow();
  }

  createWindow() {
    const scrn = screen.getAllDisplays();

    this.window = new BrowserWindow({
      // fullscreen: true,
      autoHideMenuBar: true,
      height: scrn[0].workAreaSize.height,
      width: scrn[0].workAreaSize.width / 3,
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
        nodeIntegration: true,
        contextIsolation: false,
        webviewTag: true,
      },
    });

    this.window.setPosition((scrn[1].workArea.width / 3) * this.pos, 0);
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
    const [type, url] = this.data[this.i]?.split(" ");

    this.event("play", {
      type,
      url,
      ...payload,
    });
  }
}

module.exports = {
  Manager,
};
