import { ResultAsync, ok, err } from "neverthrow";

import { api } from "../client";
import { FetchError, fetchJson } from "../fetch";

interface TMDBService {
  getMediaByTitle: (title: string) => ResultAsync<any, TMDBServiceError>;
}

export type TMDBServiceError = FetchError | ReturnType<(typeof Err)[keyof typeof Err]>;
export const Err = {
  TitleNotFound: (title: string) => ({ tag: "TMDBServiceError::TitleNotFound" as const, title }),
};

const getMediaByTitle: TMDBService["getMediaByTitle"] = (title: string) => {
  return fetchJson(api.get(`search?query=${encodeURIComponent(title)}`)).andThen((json: any) => {
    const media = json.results.find(
      (media: any) =>
        media.title?.trim().toLowerCase() === title.trim().toLowerCase() ||
        media.name?.trim().toLowerCase() === title.trim().toLowerCase(),
    );
    return media ? ok(media) : err(Err.TitleNotFound(title));
  });
};

export const TMDBService: TMDBService = {
  getMediaByTitle,
};
