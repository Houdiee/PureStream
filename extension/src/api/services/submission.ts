import { api } from "../client";
import { FetchError, fetchJson } from "../fetch";
import { TMDBService, TMDBError, TMDBMedia } from "./tmdb";
import { Submission } from "../../submission";
import { Segment } from "../../core/segment";

export type SubmissionServiceError = FetchError | TMDBError;

const getSubmissionsForMedia = (media: TMDBMedia) =>
  fetchJson<Submission[]>(api.get(`media/${media.media_type}/${media.id}/submissions`)).map((submissions) => ({ media, submissions }));

const getSubmissionsForTitle = (title: string) => TMDBService.findByTitle(title).andThen(getSubmissionsForMedia);

const reportSegment = (segment: Segment, media: TMDBMedia, season?: number, episode?: number) =>
  fetchJson(
    api.post(`media/${media.media_type}/${media.id}/submissions`, {
      json: {
        severity: segment.severity,
        start: segment.start,
        end: segment.end,
        isReport: true,
        season,
        episode,
      },
    }),
  );

export const SubmissionService = {
  getSubmissionsForTitle,
  getSubmissionsForMedia,
  reportSegment,
};
