import "~/assets/style.css";

import { storage } from "@wxt-dev/storage";
import { Config, defaultConfig } from "../../config";
import { getPlatform } from "../../platform";
import { monitorPageState } from "../../core/page-monitor";
import { onPageReady } from "../../core/page-ready";
import { manualSearch as onWrongTitle } from "../../core/manual-search";

export default defineContentScript({
  matches: ["*://*.primevideo.com/*"],
  cssInjectionMode: "ui",

  async main(ctx: any) {
    let config = await storage.getItem<Config>("sync:config");
    if (!config) config = defaultConfig;

    const hostname = window.location.href;
    getPlatform(hostname).match(
      (platform) =>
        monitorPageState({
          platform,
          callback: (title, video) => onPageReady({ ctx, title, video, platformDelay: platform.delay, config, onWrongTitle }),
        }),
      (err) => console.error(err),
    );
  },
});
