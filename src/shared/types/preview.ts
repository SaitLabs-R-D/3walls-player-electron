export type PreviewAPI = {
  onSendToken: (callback: PreviewOnSendToken) => void;
  submitToken: (token: string, devMode: boolean) => void;
};

export type PreviewOnSendToken = (value: string) => void;

export type PreviewSubmitTokenPayload = {
  token: string;
  devMode: boolean;
};

export type PreviewWindow = Window &
  typeof globalThis & {
    ipcRenderer: PreviewAPI;
  };
