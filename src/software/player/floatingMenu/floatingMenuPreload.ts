import { contextBridge, ipcRenderer } from "electron";
import { FloatingMenuAPI } from "../../../shared/types";

const API: FloatingMenuAPI = {
  onLangChange: (callback) =>
    ipcRenderer.on("lang", (_event, value) => callback(value)),
  actions: {
    escape: () => ipcRenderer.send("escape"),
    next: () => ipcRenderer.send("next"),
    prev: () => ipcRenderer.send("prev"),
    videoToggleFullscreen: () => ipcRenderer.send("videoToggleFullscreen"),
    videoPauseOrContinue: () => ipcRenderer.send("videoPauseOrContinue"),
    videoRewind: () => ipcRenderer.send("videoRewind"),
    videoForward: () => ipcRenderer.send("videoForward"),
  },
};

contextBridge.exposeInMainWorld("ipcRenderer", API);
