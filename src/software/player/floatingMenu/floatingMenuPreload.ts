import { contextBridge, ipcRenderer } from "electron";
import { FloatingMenuAPI } from "../../../shared/types";

const API: FloatingMenuAPI = {
  escape: () => ipcRenderer.send("escape"),
  next: () => ipcRenderer.send("next"),
  prev: () => ipcRenderer.send("prev"),
  videoPauseOrContinue: () => ipcRenderer.send("videoPauseOrContinue"),
  videoRewind: () => ipcRenderer.send("videoRewind"),
  videoForward: () => ipcRenderer.send("videoForward"),
};

contextBridge.exposeInMainWorld("ipcRenderer", API);
