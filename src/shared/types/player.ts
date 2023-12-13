import {
  LessonPartNormalContent,
  LessonPartType,
  LessonPartPanoramicContent,
} from "./lesson";

export type PlayerAPI = {
  onSetup: (callback: PlayerOnSetup) => void;
  onPaint: (callback: onPaint) => void;
};

export type PlayerOnSetup = (screenIdx: number) => void;
export type onPaint = (payload: PlayerOnPaintPayload) => void;

export type PlayerOnPaintPayload<T = LessonPartType> = {
  type: T;
  content: T extends "normal"
    ? LessonPartNormalContent
    : LessonPartPanoramicContent;
};

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
