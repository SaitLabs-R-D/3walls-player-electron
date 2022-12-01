const { ipcRenderer } = require("electron");

const start = document.querySelector("button");
const inp = document.querySelector("input");

ipcRenderer.on("url", (_, url) => {
  inp.value = url;
});

start.addEventListener("click", () => {
  ipcRenderer.send("start", inp.value);
  inp.value = "";
});
