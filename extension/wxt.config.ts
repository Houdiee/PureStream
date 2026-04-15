import { defineConfig } from "wxt";
import wasm from "vite-plugin-wasm";

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: "src",
  modules: ["@wxt-dev/module-react"],
  vite: () => ({
    plugins: [wasm()],
  }),
  manifest: {
    permissions: ["webNavigation"],
  },
});
