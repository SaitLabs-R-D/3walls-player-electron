import { FloatingMenuWindow } from "../../shared/types";

const win = window as FloatingMenuWindow;
const buttons = document.querySelectorAll(
  "button"
) as NodeListOf<HTMLButtonElement>;

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    if (button.className in win.ipcRenderer) {
      const cls = button.className as keyof FloatingMenuWindow["ipcRenderer"];
      win.ipcRenderer[cls]();
    }
  });
});
