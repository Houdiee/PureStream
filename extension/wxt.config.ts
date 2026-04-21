import { defineConfig } from "wxt";
import tailwindcss from "@tailwindcss/vite";
import wasm from "vite-plugin-wasm";

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: "src",
  modules: ["@wxt-dev/module-react"],
  vite: () => ({
    plugins: [tailwindcss(), wasm()],
  }),
  manifest: {
    permissions: ["webNavigation"],
  },
});
