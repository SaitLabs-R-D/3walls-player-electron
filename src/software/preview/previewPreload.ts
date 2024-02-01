import { contextBridge, ipcRenderer } from "electron";
import { PreviewAPI, PreviewSubmitTokenPayload } from "../../shared/types";
import { Locale } from "../../shared/types/general";

const API: PreviewAPI = {
  onSendToken: (callback: (value: string) => void) =>
    ipcRenderer.on("token", (_event, value) => callback(value)),
  submitToken: (token: string, devMode) =>
    ipcRenderer.send("start", { token, devMode } as PreviewSubmitTokenPayload),
  setIntl: (locale) => ipcRenderer.send("intl", locale),
  onLocaleChange: (callback: (value: Locale) => void) =>
    ipcRenderer.on("locale", (_event, value) => callback(value)),
};

contextBridge.exposeInMainWorld("ipcRenderer", API);
