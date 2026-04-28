import { ok, Result } from "neverthrow";
import { mountUi } from "./mount-ui";
import { Platform, PlatformError } from "../platform";
import { Submission } from "../submission";
import { SubmissionService } from "../api/services/submission";
import { getDisplayTitle, TMDBError, TMDBMedia } from "../api/services/tmdb";
import { calculateSegments } from "./segment";
import { handleVideo } from "./video";
import { openTitleSearch } from "./title-search";
import { toast } from "../toast";
import { toMessage } from "./error";
import { Config } from "../config";

interface OnPageReadyOptions {
  ctx: any;
  platform: Platform;
  title: string;
  video: HTMLVideoElement;
  config: Config;
}

interface ActivateOptions {
  uiContainer: HTMLElement;
  platform: Platform;
  target: string | TMDBMedia;
  video: HTMLVideoElement;
  config: Config;
}

type EpisodeContext = { season: number; episode: number } | undefined;

const fetchSubmissions = (target: string | TMDBMedia) =>
  typeof target === "string" ? SubmissionService.getSubmissionsForTitle(target) : SubmissionService.getSubmissionsForMedia(target);

const filterSubmissions = (submissions: Submission[], season?: number, episode?: number) =>
  season === undefined || episode === undefined
    ? submissions
    : submissions.filter((s) => s.season === undefined || (s.season === season && s.episode === episode));

const resolveEpisodeContext = (platform: Platform, media: TMDBMedia): Result<EpisodeContext, PlatformError> =>
  media.media_type !== "tv" ? ok(undefined) : platform.getSeasonAndEpNum().map(([season, episode]) => ({ season, episode }));

const isNotFound = (e: TMDBError) => e.tag === "TMDBError::NotFound";

let deactivate: (() => void) | null = null;

const teardown = () => {
  deactivate?.();
  deactivate = null;
  toast.close();
};

export const onPageReady = async ({ ctx, platform, title, video, config }: OnPageReadyOptions) => {
  const { uiContainer } = await mountUi(ctx, video);
  activate({ uiContainer, platform, target: title, video, config });
};

const activate = async (options: ActivateOptions) => {
  const { uiContainer, platform, target, video, config } = options;
  teardown();

  const displayTitle = typeof target === "string" ? target : getDisplayTitle(target);

  const openSearch = async () => {
    const selected = await openTitleSearch(uiContainer);
    if (selected) activate({ ...options, target: selected });
  };

  await fetchSubmissions(target).match(
    async ({ media, submissions }) => {
      const seasonAndEpResult = resolveEpisodeContext(platform, media);
      if (seasonAndEpResult.isErr()) {
        toast.error(toMessage(seasonAndEpResult.error));
        return;
      }

      const filtered = filterSubmissions(submissions, seasonAndEpResult.value?.season, seasonAndEpResult.value?.episode);
      const segments = await calculateSegments(filtered);
      toast.success(`Active for "${displayTitle}"`, { children: "Not right?", onClick: openSearch });
      deactivate = handleVideo({ video, media, segments, config, delay: platform.delay, ...seasonAndEpResult.value });
    },
    async (error) => {
      if (isNotFound(error)) {
        toast.warn(`Couldn't find "${displayTitle}" — try searching manually.`, { children: "Search", onClick: openSearch });
      } else {
        toast.error(toMessage(error));
        console.error(error);
      }
    },
  );
};
