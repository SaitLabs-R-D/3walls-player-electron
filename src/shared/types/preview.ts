import { Lang } from "./general";

export type PreviewAPI = {
  onSendToken: (callback: PreviewOnSendToken) => void;
  submitToken: (token: string, devMode: boolean) => void;
  setIntl: (lang: Lang) => void;
  onLangChange: (callback: PreviewOnLangChange) => void;
};

export type PreviewOnSendToken = (value: string) => void;

export type PreviewOnLangChange = (value: Lang) => void;

export type PreviewSubmitTokenPayload = {
  token: string;
  devMode: boolean;
};

export type PreviewWindow = Window &
  typeof globalThis & {
    ipcRenderer: PreviewAPI;
  };
