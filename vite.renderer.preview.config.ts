import { defineConfig } from "vite";

// https://vitejs.dev/config
export default defineConfig({
  root: "src/apps/preview",
  publicDir: __dirname + "/public",
  build: {
    rollupOptions: {
      input: {
        main: './src/apps/preview/index.html',
        thankYou: './src/apps/preview/thank_you.html',
      },
    },
  },
});
