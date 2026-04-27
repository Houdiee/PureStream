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

const getAction = (severity: SubmissionSeverity, config: Config) => config[`severity${severity}` as keyof Config] as string;

const applyFilter = (video: HTMLVideoElement, filter: string) => {
  if (video.style.filter !== filter) video.style.filter = filter;
};

export const handleVideo = ({ video, segments, platformDelay, config, notifyUpcomingSeconds = 5, onReport }: HandleVideoOptions) => {
  const normalized = segments
    .map((s) => ({ ...s, start: s.start + platformDelay, end: s.end + platformDelay }))
    .sort((a, b) => a.start - b.start);

  const state = {
    dismissed: new Set<Segment>(),
    reportedOnce: new Set<Segment>(),
    lastNotified: null as Segment | null,
    activeToastId: null as string | null,
    frameId: 0,
  };

  const closeActiveToast = () => {
    if (!state.activeToastId) return;
    toastManager.close(state.activeToastId);
    state.activeToastId = null;
  };

  const notify = (upcoming: Segment, now: number) => {
    const action = getAction(upcoming.severity, config);
    if (action === "Nothing") return;

    const message = `${VERB[action]} in ${Math.ceil(upcoming.start - now)}s`;

    if (state.lastNotified === upcoming) {
      if (state.activeToastId) toast.update(state.activeToastId, "info", message);
      return;
    }

    state.activeToastId = toast.info(
      message,
      {
        children: `Don't ${action.toLowerCase()}`,
        onClick() {
          state.dismissed.add(upcoming);
          closeActiveToast();
        },
      },
      null,
    );
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
    if (state.dismissed.has(active)) return applyFilter(video, "");
    const action = getAction(active.severity, config);
    if (action === "Skip") {
      applyFilter(video, "");
      video.currentTime = active.end;
      return;
    }
    applyFilter(video, FILTER[action] ?? "");
  };

  const tick = () => {
    const now = video.currentTime;

    // Evict dismissed segments the playhead has rewound behind their notify window
    for (const seg of state.dismissed) {
      if (now < seg.start - notifyUpcomingSeconds) state.dismissed.delete(seg);
    }

    const upcoming = normalized.find((s) => now >= s.start - notifyUpcomingSeconds && now < s.start);
    const active = normalized.find((s) => now >= s.start && now < s.end);

    if (upcoming && !state.dismissed.has(upcoming)) {
      notify(upcoming, now);
    } else if (!upcoming && state.lastNotified) {
      closeActiveToast();
      state.lastNotified = null;
    }

    // Countdown toast closes the moment the segment goes active
    if (active && state.activeToastId) closeActiveToast();

    // ── False-report prompt ──────────────────────────────────────────────────
    const justEnded = normalized.find((s) => state.dismissed.has(s) && now >= s.end);
    if (justEnded) promptReport(justEnded);

    // ── Filter / skip ────────────────────────────────────────────────────────
    active ? applyEffect(active) : applyFilter(video, "");

    state.frameId = requestAnimationFrame(tick);
  };

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  // No need to burn CPU on rAF while the video is paused. The countdown toast
  // stays open (Base UI timer is frozen at MAX_SAFE), and resumes updating the
  // moment playback continues. A single tick on "seeked" keeps state correct
  // when the user scrubs while paused.
  const start = () => {
    state.frameId = requestAnimationFrame(tick);
  };

  const stop = () => {
    cancelAnimationFrame(state.frameId);
    state.frameId = 0;
  };

  video.addEventListener("play", start);
  video.addEventListener("pause", stop);
  video.addEventListener("seeked", tick);
  if (!video.paused) start();

  return () => {
    stop();
    applyFilter(video, "");
    video.removeEventListener("play", start);
    video.removeEventListener("pause", stop);
    video.removeEventListener("seeked", tick);
  };
};
