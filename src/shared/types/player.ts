import {
  LessonPartNormalContent,
  LessonPartType,
  LessonPartPanoramicContent,
} from "./lesson";

export type PlayerAPI = {
  onSetup: (callback: PlayerOnSetup) => void;
  onPaint: (callback: PlayerOnPaint) => void;
  onVideoPauseOrContinue: (callback: PlayerOnVideoPauseOrContinue) => void;
  onVideoSeekTo: (callback: PlayerOnSeekTo) => void;
  onVideoToggleFullscreen: (callback: () => void) => void;
};

export type PlayerOnSetup = (screenIdx: number) => void;
export type PlayerOnPaint = (payload: PlayerOnPaintPayload) => void;
export type PlayerOnVideoPauseOrContinue = (
  payload: PlayerOnSeekToPayload
) => void;
export type PlayerOnSeekTo = (payload: PlayerOnSeekToPayload) => void;

export type PlayerOnSeekToPayload = {
  at: number;
  timestamp: number;
};

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
  | "videoToggleFullscreen";

export type RendererAction =
  | "escape"
  | "next"
  | "prev"
  | "videoPauseOrContinue"
  | "videoSeekTo"
  | "videoToggleFullscreen";

export type FunctionizedAction = `on${Capitalize<Action>}`;

export type Actions = {
  name: Action;
  keybinds: string;
}[];
