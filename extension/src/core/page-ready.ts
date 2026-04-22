import { mountUi } from "./mount-ui";
import { SubmissionService } from "../api/services/submission";
import { calculateSegments } from "./segment";
import { handleVideo } from "./video";
import { toast } from "../toast";
import { toMessage } from "./error";
import { Config } from "../config";

interface onPageReadyOptions {
  ctx: any;
  title: string;
  video: HTMLVideoElement;
  platformDelay: number;
  config: Config;
}

export const onPageReady = async ({ ctx, title, video, platformDelay, config }: onPageReadyOptions) => {
  await mountUi(ctx, video);

  await SubmissionService.getScenes(title).match(
    async (submissions) => {
      const segments = await calculateSegments(submissions);
      toast.success(`Active for "${title}"`);
      handleVideo({ video, segments, platformDelay, config });
    },

    async (error) => {
      toast.error(toMessage(error));
      console.log(error);
    },
  );
};
