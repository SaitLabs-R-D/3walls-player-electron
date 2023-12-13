import { PlayerWindow } from "../../shared/types";

//==================//
//     Constants    //
//==================//

const setup = {
  screenIdx: 0,
};

//==================//
//      Events      //
//==================//

window.addEventListener("DOMContentLoaded", () => {
  const win = window as PlayerWindow;

  win.ipcRenderer.onSetup((screenIdx) => {
    setup.screenIdx = screenIdx;

    document.body.innerHTML = screenIdx + "";
  });
});

//==================//
//     Adapters     //
//==================//
