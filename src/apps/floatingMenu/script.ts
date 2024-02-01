import { Locale, FloatingMenuWindow, ActionsInAPI } from "../../shared/types";

const win = window as FloatingMenuWindow;
const buttons = document.querySelectorAll(
  "button"
) as NodeListOf<HTMLButtonElement>;

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    if (button.className in win.ipcRenderer) {
      const cls = button.className as keyof ActionsInAPI;
      win.ipcRenderer.actions[cls]();
    }
  });
});

win.ipcRenderer.onLocaleChange((locale) => {
  Object.keys(dictionary[locale]).forEach((key) => {
    const element = document.querySelector(`.${key}`) as HTMLDivElement;
    element.innerText = dictionary[locale][key];
  });
});

const dictionary: {
  [key in Locale]: {
    [key: string]: string;
  };
} = {
  "he-il": {
    escape: "יציאה",
    videoRewind: "וידאו אחורה",
    prev: "שקף קודם",
    videoPauseOrContinue: "השהה/המשך",
    next: "שקף הבא",
    videoForward: "וידאו קדימה",
    drag: "גרירה",
  },
  "en-us": {
    escape: "Escape",
    videoRewind: "Rewind",
    prev: "Previous slide",
    videoPauseOrContinue: "Pause/Continue",
    next: "Next slide",
    videoForward: "Forward",
    drag: "Drag",
  },
};
