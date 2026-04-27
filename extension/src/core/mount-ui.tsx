import React from "react";
import { createRoot } from "react-dom/client";
import App from "../entrypoints/content/App";

export const mountUi = async (ctx: any, video: HTMLVideoElement) => {
  const ui = await createShadowRootUi(ctx, {
    name: "purestream-ui",
    position: "overlay",
    anchor: video.parentElement,
    append: "last",
    onMount: (container) => {
      const root = createRoot(container);
      root.render(
        <React.StrictMode>
          <App container={container} />
        </React.StrictMode>
      );
    },
  });
  ui.mount();
  return ui.uiContainer;
};
