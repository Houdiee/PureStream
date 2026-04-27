import { api } from "../client";
import { FetchError, fetchJson } from "../fetch";
import { TMDBService, TMDBError, TMDBMedia } from "./tmdb";
import { Submission } from "../../submission";

export type SubmissionServiceError = FetchError | TMDBError;

const getSubmissionsForMedia = (media: TMDBMedia) => fetchJson<Submission[]>(api.get(`media/${media.media_type}/${media.id}/submissions`));

const getScenes = (title: string) => TMDBService.findByTitle(title).andThen(getSubmissionsForMedia);

export const SubmissionService = {
  getScenes,
  getSubmissionsForMedia,
};
