const { ipcRenderer } = require("electron");

const buttons = document.querySelectorAll("button");

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    switch (button.className) {
      case "move":
        send(button.id);
        break;
      case "fastForward":
        send("fastForward", { by: Number(button.id) });
        break;
      default:
        send(button.className);
        break;
    }
  });
});

const send = (type, payload) => {
  ipcRenderer.send("menu", { type, ...payload });
};
