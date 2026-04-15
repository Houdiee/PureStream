import { Result } from "neverthrow";
import { Platform } from "../platform";

const DEBOUNCE_MS = 500;

const debounce = (fn: () => void, ms: number) => {
  let timer: ReturnType<typeof setTimeout>;
  return () => {
    clearTimeout(timer);
    timer = setTimeout(fn, ms);
  };
};

export const monitorPageState = (
  platform: Platform,
  callback: (title: string, video: HTMLVideoElement) => Promise<void>,
) => {
  let current = { title: "", videoSrc: "" };
  const hasChanged = (title: string, src: string) => title !== current.title || src !== current.videoSrc;

  const check = async () => {
    console.log("checking");
    const result = Result.combine([platform.getTitle(), platform.getVideoElement()]);
    if (result.isErr()) return;

    const [title, video] = result.value;
    if (hasChanged(title, video.src)) {
      console.log("has changed");
      current = { title, videoSrc: video.src };
      await callback(title, video);
    }
  };

  const observer = new MutationObserver(debounce(check, DEBOUNCE_MS));
  observer.observe(document.body, {
    subtree: true,
    attributes: true,
    attributeFilter: ["src"],
  });

  check();
  return () => observer.disconnect();
};
