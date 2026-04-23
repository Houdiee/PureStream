import { Segment } from "./segment";
import { SubmissionSeverity } from "../submission";
import { Config } from "../config";
import { toast, toastManager } from "../toast";

interface HandleVideoOptions {
  video: HTMLVideoElement;
  segments: Segment[];
  platformDelay: number;
  config: Config;
  notifyUpcomingSeconds?: number;
  onReport?: (segment: Segment) => void;
}

const VERB: Record<string, string> = { Skip: "Skipping", Blur: "Blurring", Blackout: "Blacking-out" };
const FILTER: Record<string, string> = { Blur: "blur(25px)", Blackout: "brightness(0)" };

const getAction = (severity: SubmissionSeverity, config: Config) => config[`severity${severity}` as keyof Config];

const applyFilter = (video: HTMLVideoElement, filter: string) => {
  if (video.style.filter !== filter) video.style.filter = filter;
};

export const handleVideo = ({ video, segments, platformDelay, config, notifyUpcomingSeconds = 5, onReport }: HandleVideoOptions) => {
  const normalized = segments.map((s) => ({
    ...s,
    start: s.start + platformDelay,
    end: s.end + platformDelay,
  }));

  const state = {
    skippedOnce: new Set<Segment>(),
    reportedOnce: new Set<Segment>(),
    lastNotified: null as Segment | null,
    activeToastId: null as string | null,
    frameId: 0,
  };

  const notify = (upcoming: Segment, now: number) => {
    const action = getAction(upcoming.severity, config);
    if (action === "Nothing") return;

    const message = `${VERB[action]} in ${Math.ceil(upcoming.start - now)}s`;

    if (state.lastNotified === upcoming) {
      if (state.activeToastId) toast.update(state.activeToastId, "info", message);
      return;
    }

    /* prettier-ignore */
    state.activeToastId = toast.info(message, {
      children: `Don't ${action.toLowerCase()}`,
      onClick() {
        state.skippedOnce.add(upcoming);
        if (state.activeToastId) toastManager.close(state.activeToastId);
        state.activeToastId = null;
      },
    }, 5000);
    state.lastNotified = upcoming;
  };

  const promptReport = (segment: Segment) => {
    if (state.reportedOnce.has(segment)) return;
    state.reportedOnce.add(segment);

    toast.warn("Was this a false report?", {
      children: "Report",
      onClick() {
        onReport?.(segment);
      },
    });
  };

  const applyEffect = (active: Segment) => {
    if (state.skippedOnce.has(active)) return applyFilter(video, "");
    const action = getAction(active.severity, config);
    if (action === "Skip") {
      video.currentTime = active.end;
      return;
    }
    applyFilter(video, FILTER[action] ?? "");
  };

  const tick = () => {
    const now = video.currentTime;
    const upcoming = normalized.find((s) => now >= s.start - notifyUpcomingSeconds && now < s.start);
    const active = normalized.find((s) => now >= s.start && now < s.end);

    if (upcoming && !state.skippedOnce.has(upcoming)) notify(upcoming, now);
    else if (!upcoming && state.lastNotified) {
      if (state.activeToastId) toastManager.close(state.activeToastId);
      state.lastNotified = null;
      state.activeToastId = null;
    }

    const justEnded = normalized.find((s) => state.skippedOnce.has(s) && now >= s.end);
    if (justEnded) promptReport(justEnded);

    active ? applyEffect(active) : applyFilter(video, "");

    state.frameId = requestAnimationFrame(tick);
  };

  state.frameId = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(state.frameId);
};
