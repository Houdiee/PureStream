import { api } from "../client";
import { FetchError, fetchJson } from "../fetch";
import { TMDBService, TMDBError, TMDBMedia } from "./tmdb";
import { Submission, MediaType } from "../../submission";

export type SubmissionServiceError = FetchError | TMDBError;

const getByMediaID = (mediaType: MediaType, id: number) => fetchJson<Submission[]>(api.get(`media/${mediaType}/${id}/submissions`));

const getScenesForMedia = (media: TMDBMedia) => getByMediaID(media.media_type as MediaType, media.id);

const getScenes = (title: string) => TMDBService.findByTitle(title).andThen(getScenesForMedia);

export const SubmissionService = {
  getByMediaID,
  getScenes,
  getScenesForMedia,
};
