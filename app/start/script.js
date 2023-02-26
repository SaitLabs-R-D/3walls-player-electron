const { ipcRenderer } = require("electron");

const cta = document.querySelectorAll("button");
const inp = document.querySelector("input");

ipcRenderer.on("url", (_, url) => {
  inp.value = url;
});

inp.addEventListener("keyup", (e) => {
  if (e.key === "Enter" && inp.value) {
    cta.click();
  }
});

cta.forEach((btn) =>
  btn.addEventListener("click", (e) => {
    const payload = {
      token: inp.value,
      isDev: false,
    };

    if (e.target.className.includes("dev")) {
      payload.isDev = true;
    }

    ipcRenderer.send("start", payload);
    inp.value = "";
  })
);
