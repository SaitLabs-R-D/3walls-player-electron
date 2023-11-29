const { ipcRenderer } = require("electron");

ipcRenderer.on("can", (event, newCan) => setCan(newCan));

const buttons = document.querySelectorAll("button");

const can = {
  pauseOrContinue: false,
  move: {
    next: false,
    prev: false,
  },
  fastForward: {
    "-1": false,
    1: false,
  },
};

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

const setCan = (newCan) => {
  // ! I WORKED ON THIS FOR 2 HOURS BUT IT'S NOT EVEN NEEDED
  // buttons.forEach((button) => {
  //   if (button.className === "pauseOrContinue") {
  //     button.disabled = !newCan.pauseOrContinue;
  //   } else if (button.className === "move") {
  //     button.disabled = !newCan.move[button.id];
  //   } else if (button.className === "fastForward") {
  //     button.disabled = !newCan.fastForward[button.id];
  //   }
  // });
};
