import { fromPromise, ResultAsync } from "neverthrow";
import { HTTPError } from "ky";

export type FetchError =
  | { tag: "FetchError::Network"; cause: unknown }
  | { tag: "FetchError::BadResponse"; status: number }
  | { tag: "FetchError::JsonParse"; cause: unknown };

export const FetchErr = {
  NetworkError: (cause: unknown): FetchError => ({ tag: "FetchError::Network", cause }),
  BadResponse: (status: number): FetchError => ({ tag: "FetchError::BadResponse", status }),
  JsonParseError: (cause: unknown): FetchError => ({ tag: "FetchError::JsonParse", cause }),
};

export const fetchJson = <T>(request: Promise<unknown>): ResultAsync<T, FetchError> => {
  return fromPromise(
    request, //
    (e) => (e instanceof HTTPError ? FetchErr.BadResponse(e.response.status) : FetchErr.NetworkError(e)),
  ).andThen((data: any) => fromPromise(data.json() as Promise<T>, FetchErr.JsonParseError));
};
