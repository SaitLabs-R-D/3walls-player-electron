import { Lang, FloatingMenuWindow, ActionsInAPI } from "../../shared/types";

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

win.ipcRenderer.onLangChange((lang) => {
  Object.keys(dictionary[lang]).forEach((key) => {
    const element = document.querySelector(`.${key}`) as HTMLDivElement;
    element.innerText = dictionary[lang][key];
  });
});

const dictionary: {
  [key in Lang]: {
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
