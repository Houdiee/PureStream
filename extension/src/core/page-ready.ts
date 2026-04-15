import { mountUi } from "./mount-ui";
import { SubmissionService } from "../api/services/submission";
import { calculateSegments } from "./segment";
import { handleVideo } from "./video";
import { toErrorMessage } from "./error";

import { notifications } from "@mantine/notifications";

export const onPageReady = async (ctx: any, title: string, video: HTMLVideoElement, platformDelay: number) => {
  await mountUi(ctx, video);

  await SubmissionService.getScenes(title).match(
    async (submissions) => {
      const segments = await calculateSegments(submissions);
      handleVideo(video, segments, platformDelay);
    },

    async (error) => {
      notifications.show({
        title: "PureStream",
        message: toErrorMessage(error),
      });
      console.log(error);
    },
  );
};
