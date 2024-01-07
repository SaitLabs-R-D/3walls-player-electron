import { contextBridge, ipcRenderer } from "electron";
import { PreviewAPI, PreviewSubmitTokenPayload } from "../../shared/types";

const API: PreviewAPI = {
  onSendToken: (callback: (value: string) => void) =>
    ipcRenderer.on("token", (_event, value) => callback(value)),
  submitToken: (token: string, devMode) =>
    ipcRenderer.send("start", { token, devMode } as PreviewSubmitTokenPayload),
};

contextBridge.exposeInMainWorld("ipcRenderer", API);
