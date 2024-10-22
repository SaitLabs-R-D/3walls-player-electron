import { Locale } from "./general";

export type PreviewAPI = {
  onSendToken: (callback: PreviewOnSendToken) => void;
  submitToken: (token: string, devMode: boolean) => void;
  setIntl: (locale: Locale) => void;
  onLocaleChange: (callback: PreviewOnLocaleChange) => void;
  closeWindow: () => void;
};

export type PreviewOnSendToken = (value: string) => void;

export type PreviewOnLocaleChange = (value: Locale) => void;

export type PreviewSubmitTokenPayload = {
  token: string;
  devMode: boolean;
};

export type PreviewWindow = Window &
  typeof globalThis & {
    ipcRenderer: PreviewAPI;
  };
