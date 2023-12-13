import { Action } from "./player";

export type FloatingMenuAPI = {
  [key in Action]: () => void;
};

export type FloatingMenuWindow = Window &
  typeof globalThis & {
    ipcRenderer: FloatingMenuAPI;
  };
