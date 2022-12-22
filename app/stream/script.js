const { ipcRenderer } = require("electron");

const info_div = document.querySelector("#center");
let element;

ipcRenderer.on("play", (_, { type, url, timestamp }) => {
  console.log("play", type, url);
  cleanup();
  setup({ type, url, timestamp });
});

ipcRenderer.on("init", (_, { order }) => {
  info_div.children[0].innerHTML = order;
  document.title = "screen " + order;
});

ipcRenderer.on("pauseOrContinue", (_, { timestamp }) => {
  handleSynchVideo(timestamp, element.currentTime);
  if (element.paused) {
    element.play();
  } else {
    element.pause();
  }
});

ipcRenderer.on("fastForward", (_, { timestamp, by }) => {
  // pass shortcut to webview
  if (element.tagName === "WEBVIEW") {
    element.send("fastForward", { timestamp, by });
    return;
  }

  handleSynchVideo(timestamp, element.currentTime + by);
});

ipcRenderer.on("passEventToWebview", (_, event) => {
  handlePassEvent(event);
});

function setup({ type, url, timestamp }) {
  info_div.setAttribute("hidden", "true");

  if (type === "video") {
    element = createVideo(url);

    element.addEventListener("loadedmetadata", () =>
      handleSynchVideo(timestamp)
    );
  } else if (type === "browser") {
    element = createWebview(url);
  } else if (type === "img") {
    element = createImage(url);
  }
}

function cleanup() {
  element?.remove();
  element = null;
}

const handleSynchVideo = (timestamp, skip = 0) => {
  const now = new Date().getTime();
  const diff = now - timestamp;

  console.log("sync", {
    diff,
    skip,
    timestamp: diff / 1000 + skip,
    ts: timestamp,
  });

  element.currentTime = diff / 1000 + skip;
};

const handlePassEvent = (event) => {
  document.querySelector("webview")?.sendInputEvent(event);
};

const createVideo = (url) => {
  const video = document.createElement("video");
  video.id = "video";
  video.src = url;

  video.setAttribute("controls", "true");

  document.body.appendChild(video);

  return document.getElementById("video");
};
const createWebview = (url) => {
  const webview = document.createElement("webview");
  webview.id = "webview";
  webview.src = url;
  document.body.appendChild(webview);

  return document.getElementById("webview");
};
const createImage = (url) => {
  const img = document.createElement("img");
  img.id = "image";
  img.src = url;

  document.body.appendChild(img);

  return document.getElementById("image");
};
