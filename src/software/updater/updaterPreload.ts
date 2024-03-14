import { contextBridge, ipcRenderer } from "electron";
import { updateAPI } from "../../shared/types";

const API: updateAPI = {
  update: () => ipcRenderer.send("update"),
};

contextBridge.exposeInMainWorld("ipcRenderer", API);