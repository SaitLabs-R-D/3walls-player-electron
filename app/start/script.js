const { ipcRenderer } = require("electron");

const pre = document.querySelector("#pre");
const startDiv = document.querySelector("#start");
const start = document.querySelector("#start > button");

let token;

ipcRenderer.on("url", (_, url) => {
  pre.setAttribute("hidden", "true");
  token = url;
  startDiv.children[0].innerHTML = url;
  startDiv.removeAttribute("hidden");
});

start.addEventListener("click", () => {
  ipcRenderer.send("start", token);
});
