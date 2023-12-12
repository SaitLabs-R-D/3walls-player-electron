// copied from this library cuz it's really short
// https://www.npmjs.com/package/electron-is-dev
//https://github.com/sindresorhus/electron-is-dev/blob/main/index.js

import electron from "electron";

if (typeof electron === "string") {
  throw new TypeError("Not running in an Electron environment!");
}

const isEnvSet = "ELECTRON_IS_DEV" in process.env;
const getFromEnv = Number.parseInt(process.env.ELECTRON_IS_DEV, 10) === 1;

export const isDev = isEnvSet ? getFromEnv : !electron.app.isPackaged;
export const mode = isDev ? "development" : "production";
