import { TMDBServiceError } from "../api/services/tmdb";
import { SubmissionServiceError } from "../api/services/submission";

type AppError = TMDBServiceError | SubmissionServiceError;

const ErrorMap: Record<AppError["tag"], (err: any) => string> = {
  "TMDBServiceError::TitleNotFound": (e) => `Failed to find "${e.title}" on TMDB.`,
  "FetchError::Network": () => "Network error",
  "FetchError::BadResponse": (e) => `Server error ${e.status}`,
  "FetchError::JsonParse": () => "Failed to parse JSON",
};

export const toMessage = (error: AppError) => {
  const mapper = ErrorMap[error.tag];
  return mapper ? mapper(error) : "An unexpected error occurred.";
};
