import { LessonPartType } from "./lesson";

export type PlayerAPI = {
  onSetup: (callback: PlayerOnSetup) => void;
};

export type PlayerOnSetup = (screenIdx: number) => void;

export type PlayerWindow = Window &
  typeof globalThis & {
    ipcRenderer: PlayerAPI;
  };
