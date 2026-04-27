import { mountUi } from "./mount-ui";
import { SubmissionService } from "../api/services/submission";
import { getDisplayTitle } from "../api/services/tmdb";
import { calculateSegments } from "./segment";
import { handleVideo } from "./video";
import { openTitleSearch } from "./title-search";
import { toast } from "../toast";
import { toMessage } from "./error";
import { Config } from "../config";

interface OnPageReadyOptions {
  ctx: any;
  title: string;
  video: HTMLVideoElement;
  platformDelay: number;
  config: Config;
}

export const onPageReady = async ({ ctx, title, video, platformDelay, config }: OnPageReadyOptions) => {
  const uiContainer = (await mountUi(ctx, video)).uiContainer;
  activate(title, video, platformDelay, config, uiContainer);
};

let deactivateVideo: (() => void) | null = null;

const activate = async (title: string, video: HTMLVideoElement, platformDelay: number, config: Config, container: HTMLElement) => {
  if (deactivateVideo) {
    deactivateVideo();
    deactivateVideo = null;
    toast.close();
  }

  await SubmissionService.getScenes(title).match(
    async (submissions) => {
      const segments = await calculateSegments(submissions);
      toast.success(`Active for "${title}"`, {
        children: "Not right?",
        onClick: async () => {
          const selected = await openTitleSearch(container);
          if (!selected) return;
          activate(getDisplayTitle(selected), video, platformDelay, config, container);
        },
      });

      deactivateVideo = handleVideo({ video, segments, platformDelay, config });
    },

    async (error) => {
      toast.error(toMessage(error), {
        children: "Search manually",
        onClick: async () => {
          const selected = await openTitleSearch(container);
          if (!selected) return;
          activate(getDisplayTitle(selected), video, platformDelay, config, container);
        },
      });
      console.error(error);
    },
  );
};
