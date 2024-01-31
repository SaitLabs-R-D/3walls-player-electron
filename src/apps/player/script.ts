import {
  LessonPartNormalContent,
  PlayerOnPaintPayload,
  PlayerWindow,
} from "../../shared/types";
import { isYoutube } from "../../shared/utils";

//==================//
//     Constants    //
//==================//

const crrPaint: {
  element?: HTMLElement;
  elementType?: "img" | "video" | "browser" | "panoramic";
  isYoutube?: boolean;
} = {};

const setup = {
  screenIdx: 0,
};

//==================//
//      Paint       //
//==================//

function paint(payload: PlayerOnPaintPayload) {
  if (payload.type === "panoramic") {
    crrPaint.elementType = "panoramic";
    crrPaint.element = paintPanoramicImage(payload.content.url);

    return;
  }

  const content = payload.content as LessonPartNormalContent;

  crrPaint.elementType = content.type_;

  switch (content.type_) {
    case "img":
      crrPaint.element = paintImage(content.url);
      break;
    case "video":
      crrPaint.element = paintVideo(content.url);
      break;
    case "browser":
      crrPaint.element = paintWebview(content.url);
      crrPaint.isYoutube = isYoutube(content.url);
      break;
    default:
      break;
  }
}

function cleanup() {
  if (!crrPaint.element) return;

  delete document.body.dataset.child;
  document.body.removeChild(crrPaint.element);
  crrPaint.element = null;
  crrPaint.elementType = null;
  crrPaint.isYoutube = null;
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

function paintPanoramicImage(URL: string) {
  const element = paintImage(URL);

  document.body.dataset.child = "panoramic";

  element.style.position = "absolute";
  element.style.width = "300%";
  //                             0/1/2
  element.style.left = `-${setup.screenIdx * 100}%`;

  return element;
}

//==================//
//      Events      //
//==================//

window.addEventListener("DOMContentLoaded", () => {
  const win = window as PlayerWindow;

  win.ipcRenderer.onSetup((screenIdx) => {
    setup.screenIdx = screenIdx;
  });

  win.ipcRenderer.onPaint((payload) => {
    cleanup();
    console.log(payload);
    paint(payload);
  });

  win.ipcRenderer.onVideoPauseOrContinue((payload) => {
    console.log("onVideoPauseOrContinue", payload);

    if (crrPaint.isYoutube) {
      const element = crrPaint.element as Electron.WebviewTag;
      // element.sendInputEvent({ type: "keyDown", keyCode: "space" });
      return;
    }

    if (crrPaint.elementType !== "video") return;

    const element = crrPaint.element as HTMLVideoElement;

    // syncVideo(element, payload.at, payload.timestamp);

    if (element.paused) {
      element.play();
    } else {
      element.pause();
    }
  });

  win.ipcRenderer.onVideoSeekTo((payload) => {
    if (crrPaint.elementType !== "video") return;

    const element = crrPaint.element as HTMLVideoElement;

    // should use the `syncVideo` function here, and use the payload properly
    // !temporary!
    element.currentTime += payload as unknown as number;
  });
});

//==================//
//     Adapters     //
//==================//

function syncVideo(video: HTMLVideoElement, at: number, timestamp: number) {
  /*
    The variables basically tell us:
    "on 13:00:00 you should be at 00:00:00"
    so we can calculate the drift, and fix it, for example:
    "on 13:00:00 you should be at 00:00:00, but now it's 13:00:01, so you should be at 00:00:01"
  */

  const now = Date.now();
  const diff = now - at;
  console.log(timestamp);
  // timestamp += diff;
  // video.currentTime = timestamp / 1000;
}
