import { Locale } from "../../shared/types/general";
import { PreviewWindow } from "../../shared/types";

const input = document.querySelector("input");
const startButton = document.querySelector("button.start") as HTMLButtonElement;
const closeButton = document.querySelector("button#close") as HTMLButtonElement;

function sendToken(e: MouseEvent | KeyboardEvent) {
  // const isDev = (e.target as HTMLButtonElement).classList.contains("dev");

  const win = window as PreviewWindow;
  win.ipcRenderer.submitToken(input.value, false);

  input.value = "";
}

if (input) {
  input.addEventListener("keyup", (e) => {
    if (e.key === "Enter" && input.value) {
      startButton.click();
    }
  });
}

if (startButton) {
  startButton.addEventListener("click", sendToken);
}

window.addEventListener("DOMContentLoaded", () => {
  const win = window as PreviewWindow;

  win.ipcRenderer.onSendToken((value) => {
    input.value = value;
  });

  if (closeButton) {
    closeButton.addEventListener("click", () => win.ipcRenderer.closeWindow())
  }

  win.ipcRenderer.onLocaleChange((locale) => {
    (
      document.querySelector(".intl__circle > img") as HTMLImageElement
    ).src = `${locale}.webp`;

    if (input) {
      input.placeholder = dictionary[locale].placeholder;
    }
    if (startButton) {
      startButton.innerText = dictionary[locale].startBtn;
    }
    document.querySelector("p").innerHTML = dictionary[locale].comment;
    document.querySelector(".thankyou").innerHTML = dictionary[locale].thankyou;
    document.querySelector("#close").innerHTML = dictionary[locale].close;
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
    thankyou: "תודה על השתתפותך",
    close: "סגור",
  },
  "en-us": {
    placeholder: "Lesson Code",
    startBtn: "Start Lesson",
    comment: "Press ctrl+v in the field above",
    thankyou: "Thank you for participating",
    close: "close",
  },
};
