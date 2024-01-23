import { contextBridge, ipcRenderer } from "electron";
import { PreviewAPI, PreviewSubmitTokenPayload } from "../../shared/types";
import { Lang } from "../../shared/types/general";

const API: PreviewAPI = {
  onSendToken: (callback: (value: string) => void) =>
    ipcRenderer.on("token", (_event, value) => callback(value)),
  submitToken: (token: string, devMode) =>
    ipcRenderer.send("start", { token, devMode } as PreviewSubmitTokenPayload),
  setIntl: (lang) => ipcRenderer.send("intl", lang),
  onLangChange: (callback: (value: Lang) => void) =>
    ipcRenderer.on("lang", (_event, value) => callback(value)),
};

contextBridge.exposeInMainWorld("ipcRenderer", API);
