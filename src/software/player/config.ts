import { Actions } from "../../shared/types";

export const actions: Actions = [
  {
    name: "escape",
    keybinds: "Escape",
  },
  {
    name: "next",
    keybinds: "CommandOrControl+n",
  },
  {
    name: "prev",
    keybinds: "CommandOrControl+p",
  },
  {
    name: "videoPauseOrContinue",
    keybinds: "CommandOrControl+space",
  },
  {
    name: "videoRewind",
    keybinds: "CommandOrControl+Left",
  },
  {
    name: "videoForward",
    keybinds: "CommandOrControl+Right",
  },
  {
    name: "videoFullscreen",
    keybinds: "CommandOrControl+f",
  },
];
