import { defineConfig } from "vite";

// https://vitejs.dev/config
export default defineConfig({
  root: "src/apps/updater",
  publicDir: __dirname + "/public",
});
