import { mountUi } from "./mount-ui";
import { SubmissionService } from "../api/services/submission";
import { calculateSegments } from "./segment";
import { handleVideo } from "./video";
import { toast } from "../toast";
import { toMessage } from "./error";
import { Config } from "../config";

interface OnPageReadyOptions {
  ctx: any;
  title: string;
  video: HTMLVideoElement;
  platformDelay: number;
  config: Config;
  onWrongTitle?: () => void;
}

export const onPageReady = async ({ ctx, title, video, platformDelay, config, onWrongTitle }: OnPageReadyOptions) => {
  await mountUi(ctx, video);
  await SubmissionService.getScenes(title).match(
    async (submissions) => {
      const segments = await calculateSegments(submissions);
      toast.success(
        `Active for "${title}"`,
        onWrongTitle && {
          children: "Not right?",
          onClick: onWrongTitle,
        },
      );
      handleVideo({ video, segments, platformDelay, config });
    },
    async (error) => {
      toast.error(toMessage(error));
      console.log(error);
    },
  );
};
