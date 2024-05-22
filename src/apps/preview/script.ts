import { Locale } from "../../shared/types/general";
import { PreviewWindow } from "../../shared/types";
import { displaysCount } from "src/software/helpers";

const input = document.querySelector("input");
const startButton = document.querySelector("button.start") as HTMLButtonElement;

function sendToken(e: MouseEvent | KeyboardEvent) {
  // const isDev = (e.target as HTMLButtonElement).classList.contains("dev");
  const isDev = displaysCount() == 1;

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
    comment: "לחץ ctrl+v בשדה שמעל",
  },
  "en-us": {
    placeholder: "Lesson Code",
    startBtn: "Start Lesson",
    comment: "Press ctrl+v in the field above",
  },
};
