import { createRoot } from "react-dom/client";
import { createElement } from "react";
import { TitleSearch } from "../components/TitleSearch";
import { TMDBMedia } from "../api/services/tmdb";

export const openTitleSearch = (container: HTMLElement): Promise<TMDBMedia | null> =>
  new Promise((resolve) => {
    const node = document.createElement("div");
    container.appendChild(node);
    const root = createRoot(node);

    const teardown = (result: TMDBMedia | null) => {
      root.unmount();
      node.remove();
      resolve(result);
    };

    root.render(
      createElement(TitleSearch, {
        onSelect: (media) => teardown(media),
        onDismiss: () => teardown(null),
      }),
    );
  });
