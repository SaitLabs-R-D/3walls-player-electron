import { Locale } from "./general";
import { Action } from "./player";

export type FloatingMenuAPI = {
  onLocaleChange: (callback: (value: Locale) => void) => void;
  actions: ActionsInAPI;
};

export type ActionsInAPI = {
  [key in Action]: () => void;
};

export type FloatingMenuWindow = Window &
  typeof globalThis & {
    ipcRenderer: FloatingMenuAPI;
  };
