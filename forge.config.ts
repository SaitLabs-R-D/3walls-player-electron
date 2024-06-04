import type { ForgeConfig } from "@electron-forge/shared-types";
import { MakerSquirrel } from "@electron-forge/maker-squirrel";
import { MakerZIP } from "@electron-forge/maker-zip";
import { MakerDeb } from "@electron-forge/maker-deb";
import { MakerRpm } from "@electron-forge/maker-rpm";
import { VitePlugin } from "@electron-forge/plugin-vite";
import { APP_PREFIX } from "./constants";
import { generateAssets } from "./hooks";

const config: ForgeConfig = {
  packagerConfig: {
    icon: "./public/icon.ico",
    protocols: [
      {
        name: "3-Walls App",
        schemes: [APP_PREFIX],
      },
    ],
  },
  hooks: {
    generateAssets,
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({
      setupIcon: "./public/icon.ico",
    }),
    // new MakerZIP({}, ["darwin"]),
    // new MakerRpm({}),
    // new MakerDeb({}),
  ],
  plugins: [
    new VitePlugin({
      // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
      // If you are familiar with Vite configuration, it will look really familiar.
      build: [
        {
          // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
          entry: "src/software/main.ts",
          config: "vite.main.config.ts",
        },
        {
          entry: "src/software/preview/previewPreload.ts",
          config: "vite.preload.config.ts",
        },
        {
          entry: "src/software/player/playerPreload.ts",
          config: "vite.preload.config.ts",
        },
        {
          entry: "src/software/player/floatingMenu/floatingMenuPreload.ts",
          config: "vite.preload.config.ts",
        },
        {
          entry: "src/software/updater/updaterPreload.ts",
          config: "vite.updater.config.ts",
        },
      ],
      renderer: [
        {
          name: "preview",
          config: "vite.renderer.preview.config.ts",
        },
        {
          name: "player",
          config: "vite.renderer.player.config.ts",
        },
        {
          name: "updater",
          config: "vite.renderer.updater.config.ts",
        },
        {
          name: "floatingMenu",
          config: "vite.renderer.floatingMenu.config.ts",
        },
      ],
    }),
  ],
};

export default config;
