const { ipcRenderer } = require("electron");

const elements = {
  browser: document.querySelector("#webview"),
  video: document.querySelector("#video"),
  img: document.querySelector("#image"),
};
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

  elements.video.currentTime = diff / 1000 + skip;
};

const createVideo = (url) => {
  const video = document.createElement("video");
  video.id = "video";
  video.src = url;
  video.setAttribute("autoplay", "true");

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
