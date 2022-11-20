const { ipcRenderer } = require("electron");

const elements = {
  browser: document.querySelector("#webview"),
  video: document.querySelector("#video"),
  image: document.querySelector("#image"),
};

ipcRenderer.on("play", (_, { type, url, timestamp }) => {
  setup({ type, url, timestamp });
  cleanup(type);
});

function setup({ type, url, timestamp }) {
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
  if (type !== "image") {
    elements.image.setAttribute("hidden", "true");
    elements.image.src = "";
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
