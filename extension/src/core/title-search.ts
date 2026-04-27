import { createRoot } from "react-dom/client";
import { createElement } from "react";
import { TitleSearch } from "../components/TitleSearch";
import { TMDBMedia } from "../api/services/tmdb";

/*
  CURRENT ISSUES:
  pressing the button on the toast overrides keyboard behvaiour instead of passing it back to the site
  duplicate UI for whatever fucking reason

  TO-DO:
  1. Re-activate the extension and search for the newly selected title in multi search with its appropriate media type search
  2. Report false submission
*/

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
