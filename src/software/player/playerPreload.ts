// this file is here and not under `../player` because it's loaded from "./index.ts"
// but the name is still "player" becuase it belongs to all parts which makes it a player and not a part

import { contextBridge, ipcRenderer } from "electron";
import { PlayerAPI } from "../../shared/types";

const API: PlayerAPI = {
  onSetup: (callback) => {
    ipcRenderer.on("setup", (_, screenIdx) => {
      callback(screenIdx);
    });
  },
  onPaint: (callback) => {
    ipcRenderer.on("paint", (_, payload) => {
      callback(payload);
    });
  },
  onVideoPauseOrContinue: (callback) => {
    ipcRenderer.on("videoPauseOrContinue", (_, timestamp) => {
      callback(timestamp);
    });
  },
  onVideoSeekTo: (callback) => {
    ipcRenderer.on("videoSeekTo", (_, payload) => {
      callback(payload);
    });
  },
  onVideoToggleFullscreen: (callback) => {
    ipcRenderer.on("videoToggleFullscreen", () => {
      callback();
    });
  },
};

contextBridge.exposeInMainWorld("ipcRenderer", API);
