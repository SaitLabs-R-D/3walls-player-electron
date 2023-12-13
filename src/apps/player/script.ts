import {
  LessonPartNormalContent,
  PlayerOnPaintPayload,
  PlayerWindow,
} from "../../shared/types";

//==================//
//     Constants    //
//==================//

const crrPaint: {
  element?: HTMLElement;
} = {};

const setup = {
  screenIdx: 0,
};

//==================//
//      Paint       //
//==================//

function paint(payload: PlayerOnPaintPayload) {
  if (payload.type === "panoramic") return;

  const content = payload.content as LessonPartNormalContent;

  switch (content.type_) {
    case "img":
      crrPaint.element = paintImage(content.url);
      break;
    case "video":
      crrPaint.element = paintVideo(content.url);
      break;
    case "browser":
      crrPaint.element = paintWebview(content.url);
      break;
    default:
      break;
  }
}

//==================//
//      Events      //
//==================//

window.addEventListener("DOMContentLoaded", () => {
  const win = window as PlayerWindow;

  // win.ipcRenderer.onSetup((screenIdx) => {
  //   setup.screenIdx = screenIdx;

  //   document.body.innerHTML = screenIdx + "";
  // });

  win.ipcRenderer.onPaint((payload) => {
    cleanup();
    console.log(payload);
    paint(payload);
  });
});

//==================//
//     Adapters     //
//==================//

function cleanup() {
  if (crrPaint.element) {
    document.body.removeChild(crrPaint.element);
    crrPaint.element = undefined;
  }
}

function paintImage(URL: string) {
  const element = document.createElement("img");
  element.src = URL;

  document.body.appendChild(element);

  return element;
}

function paintVideo(URL: string) {
  const element = document.createElement("video");
  element.controls = true;
  element.src = URL;

  document.body.appendChild(element);

  return element;
}

function paintWebview(URL: string) {
  const element = document.createElement("webview");
  element.src = URL;

  document.body.appendChild(element);

  return element;
}

// function paintPanoramic() {}
