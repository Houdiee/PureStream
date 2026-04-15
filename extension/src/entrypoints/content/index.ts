import { getPlatform } from "../../platform";
import { monitorPageState } from "../../core/page-monitor";
import { onPageReady } from "../../core/page-ready";

export default defineContentScript({
  matches: ["*://*.primevideo.com/*"],
  cssInjectionMode: "ui",

  async main(ctx: any) {
    const hostname = window.location.href;
    getPlatform(hostname).match(
      (platform) => monitorPageState(platform, (title, video) => onPageReady(ctx, title, video, platform.delay)),
      (err) => console.error(err),
    );
  },
});
