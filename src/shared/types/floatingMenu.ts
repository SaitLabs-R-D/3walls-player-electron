import { Lang } from "./general";
import { Action } from "./player";

export type FloatingMenuAPI = {
  onLangChange: (callback: (value: Lang) => void) => void;
  actions: ActionsInAPI;
};

export type ActionsInAPI = {
  [key in Action]: () => void;
};

export type FloatingMenuWindow = Window &
  typeof globalThis & {
    ipcRenderer: FloatingMenuAPI;
  };
