import { Locale } from "../../shared/types/general";
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

  win.ipcRenderer.onLocaleChange((locale) => {
    (
      document.querySelector(".intl__circle > img") as HTMLImageElement
    ).src = `${locale}.webp`;

    input.placeholder = dictionary[locale].placeholder;
    startButton.innerText = dictionary[locale].startBtn;
    startDevButton.innerText = dictionary[locale].startDevBtn;
    document.querySelector("p").innerHTML = dictionary[locale].comment;
  });
});

// intl
const intlBtns = document.querySelectorAll(".intl__dropdown__item");

intlBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const win = window as PreviewWindow;
    const locale = btn.getAttribute("id") as Locale;

    win.ipcRenderer.setIntl(locale);
  });
});

const dictionary = {
  "he-il": {
    placeholder: "קוד שיעור",
    startBtn: "התחלת השיעור",
    startDevBtn: "בדיקת השיעור",
    comment: "לחץ ctrl+v בשדה שמעל",
  },
  "en-us": {
    placeholder: "Lesson Code",
    startBtn: "Start Lesson",
    startDevBtn: "Start Lesson (Dev)",
    comment: "Press ctrl+v in the field above",
  },
};
