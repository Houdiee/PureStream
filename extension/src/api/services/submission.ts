import { ResultAsync } from "neverthrow";

import { api } from "../client";
import { FetchError, fetchJson } from "../fetch";
import { TMDBService, TMDBServiceError } from "./tmdb";
import { Submission, MediaType } from "../../submission";

interface SubmissionService {
  getByMediaID: (mediaType: MediaType, id: number) => ResultAsync<Submission[], SubmissionServiceError>;
  getScenes: (title: string) => ResultAsync<Submission[], FetchError | TMDBServiceError>;
}

export type SubmissionServiceError = FetchError;

const getByMediaID: SubmissionService["getByMediaID"] = (mediaType: MediaType, id: number) => {
  return fetchJson<Submission[]>(api.get(`media/${mediaType}/${id}/submissions`));
};

const getScenes: SubmissionService["getScenes"] = (title: string) =>
  TMDBService.getMediaByTitle(title).andThen((media) =>
    SubmissionService.getByMediaID(media.media_type as MediaType, media.id as number),
  );

export const SubmissionService: SubmissionService = {
  getByMediaID,
  getScenes,
};
