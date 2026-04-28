import { TMDBError } from "../api/services/tmdb";
import { FetchError } from "../api/fetch";
import { PlatformError } from "../platform";

type AppError = FetchError | TMDBError | PlatformError;

const ErrorMap: Record<AppError["tag"], (err: any) => string> = {
  "TMDBError::NotFound": (e) => `Failed to find "${e.title}" on TMDB`,

  "PlatformError::SeasonAndEpNumNotFound": () => "Failed to identiy current episode",
  "PlatformError::UnsupportedPlatform": () => "Unsupported platform",
  "PlatformError::TitleNotFound": () => "Failed to identify title",
  "PlatformError::VideoNotFound": () => "Failed to identify video element",

  "FetchError::Network": () => "Network error",
  "FetchError::BadResponse": (e) => `Server error ${e.status}`,
  "FetchError::JsonParse": () => "Failed to parse JSON",
};

export const toMessage = (error: AppError) => {
  const mapper = ErrorMap[error.tag];
  return mapper ? mapper(error) : "An unexpected error occurred.";
};
