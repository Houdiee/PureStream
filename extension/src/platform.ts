import { Result, ok, err } from "neverthrow";
import { primevideo } from "./platforms/primevideo";

export interface Platform {
  getTitle: () => Result<string, PlatformError>;
  getVideoElement: () => Result<HTMLVideoElement, PlatformError>;
  getSeasonAndEpNum: () => Result<[number, number], PlatformError>;
  delay: number;
}

export type PlatformError = ReturnType<(typeof Err)[keyof typeof Err]>;
export const Err = {
  UnsupportedPlatform: (hostname: string) => ({ tag: "PlatformError::UnsupportedPlatform" as const, hostname }),
  TitleNotFound: () => ({ tag: "PlatformError::TitleNotFound" as const }),
  VideoNotFound: () => ({ tag: "PlatformError::VideoNotFound" as const }),
  SeasonAndEpNumNotFound: () => ({ tag: "PlatformError::SeasonAndEpNumNotFound" as const }),
};

export const getPlatform = (hostname: string): Result<Platform, PlatformError> => {
  if (hostname.includes("primevideo")) {
    return ok(primevideo);
  } else {
    return err(Err.UnsupportedPlatform(hostname));
  }
};
