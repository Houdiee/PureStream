import { Segment } from "./segment";
import { Config } from "../config";
import { toast } from "../toast";

interface HandleVideoOptions {
  video: HTMLVideoElement;
  segments: Segment[];
  platformDelay: number;
  config: Config;
  notifyUpcomingSeconds: number;
}

export const handleVideo = ({
  video,
  segments,
  platformDelay,
  config,
  notifyUpcomingSeconds = 3,
}: HandleVideoOptions) => {
  let frameId: number;
  let lastNotifiedSegment: Segment | null = null;
  let activeToastId: string | null = null;

  const normalizedSegments = segments.map((s) => ({
    ...s,
    start: s.start + platformDelay,
    end: s.end + platformDelay,
  }));

  const update = () => {
    const now = video.currentTime;
    const upcoming = normalizedSegments.find((s) => now >= s.start - notifyUpcomingSeconds && now < s.start);
    const active = normalizedSegments.find((s) => now >= s.start && now < s.end);

    if (upcoming) {
      const action = config[`severity${upcoming.severity}` as keyof Config];
      if (action !== "Nothing") {
        const verbMap: Record<string, string> = {
          Skip: "Skipping",
          Blur: "Blurring",
          Blackout: "Blacking-out",
        };

        const secondsLeft = Math.ceil(upcoming.start - now);
        const message = `${verbMap[action] || action} in ${secondsLeft}s`;

        if (lastNotifiedSegment !== upcoming) {
          activeToastId = toast.info(message);
          lastNotifiedSegment = upcoming;
        } else if (activeToastId) {
          toast.update(activeToastId, "info", message);
        }
      }
    }

    if (lastNotifiedSegment && !upcoming && !active) {
      lastNotifiedSegment = null;
      activeToastId = null;
    }

    applyEffect(video, active, config);

    frameId = requestAnimationFrame(update);
  };

  frameId = requestAnimationFrame(update);
  return () => cancelAnimationFrame(frameId);
};

const applyEffect = (video: HTMLVideoElement, active: Segment | undefined, config: Config) => {
  let filter = "";

  if (active) {
    const action = config[`severity${active.severity}` as keyof Config];
    if (action === "Blur") filter = "blur(25px)";
    if (action === "Blackout") filter = "brightness(0)";
    if (action === "Skip") {
      video.currentTime = active.end;
      return;
    }
  }

  if (video.style.filter !== filter) {
    video.style.filter = filter;
  }
};
