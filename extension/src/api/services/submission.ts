import { ResultAsync } from "neverthrow";
import { api } from "../client";
import { FetchError, fetchJson } from "../fetch";
import { TMDBService, TMDBError, TMDBMedia } from "./tmdb";
import { Submission, MediaType } from "../../submission";

export type SubmissionServiceError = FetchError | TMDBError;

interface SubmissionService {
  getByMediaID: (mediaType: MediaType, id: number) => ResultAsync<Submission[], FetchError>;
  getScenes: (title: string) => ResultAsync<Submission[], SubmissionServiceError>;
  getScenesForMedia: (media: TMDBMedia) => ResultAsync<Submission[], FetchError>;
}

const getByMediaID: SubmissionService["getByMediaID"] = (mediaType, id) =>
  fetchJson<Submission[]>(api.get(`media/${mediaType}/${id}/submissions`));

const getScenesForMedia: SubmissionService["getScenesForMedia"] = (media) => getByMediaID(media.media_type as MediaType, media.id);

const getScenes: SubmissionService["getScenes"] = (title) => TMDBService.findByTitle(title).andThen(getScenesForMedia);

export const SubmissionService: SubmissionService = {
  getByMediaID,
  getScenes,
  getScenesForMedia,
};
