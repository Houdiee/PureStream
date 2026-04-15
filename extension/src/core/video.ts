import { Segment } from "./segment";

// TODO: add cleanup logic

export const handleVideo = (video: HTMLVideoElement, segments: Segment[], delay: number) => {
  let frameId: number;

  const update = () => {
    const now = video.currentTime;
    const activeSegment = segments.find((s) => s.start + delay <= now && now < s.end + delay);
    const targetFilter = activeSegment ? "blur(25px)" : "none";

    if (video.style.filter !== targetFilter) {
      video.style.filter = targetFilter;
    }
    frameId = requestAnimationFrame(update);
  };
  frameId = requestAnimationFrame(update);
};
