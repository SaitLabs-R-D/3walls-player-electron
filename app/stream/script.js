const { ipcRenderer } = require("electron");

const info_div = document.querySelector("#center");
let element, crrType, crrUrl, crrTimestamp, interval, screenIdx;

ipcRenderer.on("play", (_, { type, url, timestamp, screen_idx }) => {
  crrType = type;
  crrUrl = url;
  crrTimestamp = timestamp;
  screenIdx = screen_idx;

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

ipcRenderer.on("syncYtTimestamps", (_, { timestamp, skip }) => {
  handleSyncYoutube(timestamp, skip);
});

ipcRenderer.on("reqInfo", (_, event) => {
  if (
    (event.type === "yt-timestamp") & (crrType === "browser") &&
    isYoutube(crrUrl)
  ) {
    handleSendYoutubeTimestamp();
  }
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

    if (isYoutube(url)) {
      handleYoutubeAutoPause();
      handleSynchVideo(timestamp);
    }
  } else if (type === "img") {
    element = createImage(url);
  } else if (type === "panoramic") {
    element = createPanoramic(url);
  }
}

function cleanup() {
  element?.remove();
  element = null;
  delete document.body.dataset.child;
}

const getTimeForSync = (timestamp, skip = 0) => {
  /**
   * ? what's going on?
   *
   * all 3 players are receiving the same timestamp
   * but they are not synced
   * we calculate the difference between the timestamp and the current time
   */

  const now = new Date().getTime();
  const diff = now - timestamp;
  return diff / 1000 + skip;
};

const handleSynchVideo = (timestamp, skip = 0) => {
  element.currentTime = getTimeForSync(timestamp, skip);
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

const createPanoramic = (url) => {
  document.body.dataset.child = "panoramic";

  const img = document.createElement("img");
  img.id = "panoramic";
  img.src = url;

  const left = (3 - screenIdx) * 100;

  img.style.left = `-${left}%`;

  document.body.appendChild(img);

  return document.getElementById("panoramic");
};

const isYoutube = (url) => url.includes("youtube") || url.includes("youtu.be");

const handleYoutubeAutoPause = () => {
  /*
    This is the ugliest code I've ever written.
    I'm sorry.

    There are a couple of issues with youtube videos and webviews:

    webview events are not very stable (dom-ready & did-stop-loading), and they don't fire consistently
    it's also depends on internet connection speed & youtube player speed
    so we cannot just fire it once on dom-ready, cause the video might not be loaded yet

    ! this is a workaround, not a fix
    ! there's a possible memory leak here
  */

  const code = `
    try {
      document.querySelector("#player video").pause();
      document.querySelector("#player video").currentTime = 0;
    } catch {};

    function onYouTubePlayerReady(e) {
      try {
        e.stopVideo();
      } catch {}
    }
  `;

  const tryEcec = () => {
    try {
      element.executeJavaScript(code);
    } catch {}
  };

  element.addEventListener("dom-ready", () => {
    // youtube itself will call this function https://developers.google.com/youtube/iframe_api_reference
    element.executeJavaScript(code);
  });

  // another one before the first 50ms
  tryEcec();

  const MAX_TRIES = 10;
  let counter = 0;
  clearInterval(interval);
  interval = setInterval(() => {
    counter++;

    tryEcec();

    if (counter > MAX_TRIES) {
      clearInterval(interval);
    }
  }, 50);
};

const handleSyncYoutube = (timestamp, skip) => {
  const t = getTimeForSync(timestamp, skip);

  console.log("syncing youtube", t, { timestamp, skip });

  return syncYoutube(t);
};

const syncYoutube = (timestamp) => {
  const webview = document.querySelector("webview");
  if (!webview) return;

  const code = `
    try {
      const video = document.querySelector("#player video");
      if (video) {
        video.currentTime = ${timestamp};
      }
    } catch {};
  `;

  try {
    webview.executeJavaScript(code);
  } catch {}
};

const handleSendYoutubeTimestamp = async () => {
  const webview = document.querySelector("webview");

  if (!webview) return;

  const code = `
    document.querySelector("#player video").currentTime;
  `;

  let timestamp = 0;
  try {
    timestamp = await webview.executeJavaScript(code);
  } catch {}

  ipcRenderer.send("resInfo", { type: "yt-timestamp", data: timestamp });
};
