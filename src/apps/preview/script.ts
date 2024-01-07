// import { ipcRenderer } from "electron";
import { PreviewWindow } from "../../shared/types";

const input = document.querySelector("input");
const startButton = document.querySelector("button.start") as HTMLButtonElement;
const startDevButton = document.querySelector(
  "button.dev"
) as HTMLButtonElement;

function sendToken(e: MouseEvent | KeyboardEvent) {
  const isDev = (e.target as HTMLButtonElement).classList.contains("dev");

  const win = window as PreviewWindow;
  win.ipcRenderer.submitToken(input.value, isDev);

  input.value = "";
}

input.addEventListener("keyup", (e) => {
  if (e.key === "Enter" && input.value) {
    startButton.click();
  }
});

startButton.addEventListener("click", sendToken);
startDevButton.addEventListener("click", sendToken);

window.addEventListener("DOMContentLoaded", () => {
  const win = window as PreviewWindow;

  win.ipcRenderer.onSendToken((value) => {
    input.value = value;
  });
});
