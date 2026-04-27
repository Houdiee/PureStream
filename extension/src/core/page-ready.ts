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

let abortController: (() => void) | null = null;

export const onPageReady = async ({ ctx, title, video, platformDelay, config }: OnPageReadyOptions) => {
  const container = await mountUi(ctx, video);
  startForTitle(title, video, platformDelay, config, container);
};

const startForTitle = async (title: string, video: HTMLVideoElement, platformDelay: number, config: Config, container: HTMLElement) => {
  if (abortController) {
    abortController();
    abortController = null;
  }

  await SubmissionService.getScenes(title).match(
    async (submissions) => {
      const segments = await calculateSegments(submissions);
      toast.success(`Active for "${title}"`, {
        children: "Not right?",
        onClick: async () => {
          const selected = await openTitleSearch(container);
          if (!selected) return;
          startForTitle(getDisplayTitle(selected), video, platformDelay, config, container);
        },
      });
      handleVideo({ video, segments, platformDelay, config });

      const cleanupVideo = handleVideo({ video, segments, platformDelay, config });
      cleanupVideo();
    },
    async (error) => {
      toast.error(toMessage(error), {
        children: "Search manually",
        onClick: async () => {
          const selected = await openTitleSearch(container);
          if (!selected) return;
          startForTitle(getDisplayTitle(selected), video, platformDelay, config, container);
        },
      });
      console.error(error);
    },
  );
};
