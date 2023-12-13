import { LessonPartType } from "./lesson";

export type PlayerAPI = {
  onSetup: (callback: PlayerOnSetup) => void;
};

export type PlayerOnSetup = (screenIdx: number) => void;

export type PlayerWindow = Window &
  typeof globalThis & {
    ipcRenderer: PlayerAPI;
  };

export type Action =
  | "escape"
  | "next"
  | "prev"
  | "videoPauseOrContinue"
  | "videoRewind"
  | "videoForward"
  | "videoFullscreen"
  | "videoFullscreen";

export type FunctionizedAction = `on${Capitalize<Action>}`;

export type Actions = {
  name: Action;
  keybinds: string;
}[];
