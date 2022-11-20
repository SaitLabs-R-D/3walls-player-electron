const { ipcRenderer } = require("electron");

const elements = {
  browser: document.querySelector("#webview"),
  video: document.querySelector("#video"),
  img: document.querySelector("#image"),
};
const info_div = document.querySelector("#center");

ipcRenderer.on("play", (_, { type, url, timestamp }) => {
  console.log("play", type, url);
  setup({ type, url, timestamp });
  cleanup(type);
});

ipcRenderer.on("init", (_, { order }) => {
  info_div.children[0].innerHTML = order;
});

function setup({ type, url, timestamp }) {
  info_div.setAttribute("hidden", "true");

  elements[type].src = url;
  elements[type].setAttribute("hidden", "false");

  if (type === "video") {
    // todo elements.video.requestFullscreen();
    handleSynchVideo(timestamp);
  }
}

function cleanup(type) {
  if (type !== "video") {
    elements.video.setAttribute("hidden", "true");
    elements.video.src = "";
  }
  if (type !== "img") {
    elements.img.setAttribute("hidden", "true");
    elements.img.src = "";
  }
  if (type !== "browser") {
    elements.browser.setAttribute("hidden", "true");
  }
}

const handleSynchVideo = (timestamp, skip = 0) => {
  const now = new Date().getTime();
  const diff = now - timestamp;

  elements.video.currentTime = diff / 1000 + skip;
};
