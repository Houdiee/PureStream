import { ResultAsync, ok, err } from "neverthrow";
import { api } from "../client";
import { FetchError, fetchJson } from "../fetch";

export type TMDBMedia = {
  id: number;
  media_type: "tv" | "movie";
  title?: string;
  name?: string;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
};

export type TMDBError = FetchError | { tag: "TMDBError::NotFound"; query: string };

export const TMDB_IMG = (path: string) => `https://image.tmdb.org/t/p/w92${path}`;

export const getDisplayTitle = (m: TMDBMedia) => m.title ?? m.name ?? "Unknown";
export const getDisplayYear = (m: TMDBMedia) => (m.release_date ?? m.first_air_date ?? "").slice(0, 4) || null;

const searchMedia = (query: string): ResultAsync<TMDBMedia[], TMDBError> =>
  fetchJson(api.get(`search?query=${encodeURIComponent(query)}`)).andThen((json: any) => {
    const results: TMDBMedia[] = (json.results ?? []).filter((r: any) => r.media_type === "tv" || r.media_type === "movie");
    return results.length ? ok(results) : err({ tag: "TMDBError::NotFound" as const, query });
  });

const findByTitle = (title: string): ResultAsync<TMDBMedia, TMDBError> =>
  searchMedia(title).andThen((results) => {
    const exact = results.find((m) => getDisplayTitle(m).trim().toLowerCase() === title.trim().toLowerCase());
    return exact ? ok(exact) : err({ tag: "TMDBError::NotFound" as const, query: title });
  });

export const TMDBService = { searchMedia, findByTitle };
