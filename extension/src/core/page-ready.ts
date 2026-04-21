import { mountUi } from "./mount-ui";
import { SubmissionService } from "../api/services/submission";
import { calculateSegments } from "./segment";
import { handleVideo } from "./video";
import { toast } from "../toast";
import { toMessage } from "./error";

export const onPageReady = async (ctx: any, title: string, video: HTMLVideoElement, platformDelay: number) => {
  await mountUi(ctx, video);

  await SubmissionService.getScenes(title).match(
    async (submissions) => {
      const segments = await calculateSegments(submissions);
      console.log(segments);
      toast.success("Active");
      handleVideo(video, segments, platformDelay);
    },

    async (error) => {
      toast.error(toMessage(error));
      console.log(error);
    },
  );
};
